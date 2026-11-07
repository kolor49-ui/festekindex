"""Rate-limited HTTP client with retry, timeout, and disk cache."""

from __future__ import annotations

import hashlib
import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Callable
from urllib.parse import quote, urlsplit, urlunsplit


def sanitize_request_url(url: str) -> str:
    """Encode spaces/unsafe path chars so urllib can fetch manufacturer PDFs."""
    parts = urlsplit(url.strip())
    path = quote(parts.path, safe="/%")
    # Keep already-encoded query; only quote truly raw spaces if present.
    query = parts.query.replace(" ", "%20")
    return urlunsplit((parts.scheme, parts.netloc, path, query, parts.fragment))


DEFAULT_UA = (
    "FestekindexMassImport/0.2 (+local-only research; respectful crawl; "
    "no automated publish)"
)


@dataclass
class HttpResult:
    url: str
    ok: bool
    status: int | None
    content_type: str | None
    body: bytes
    from_cache: bool
    error: str | None = None
    attempts: int = 1


class RateLimitedClient:
    def __init__(
        self,
        *,
        cache_dir: Path,
        min_interval_s: float = 0.6,
        timeout_s: float = 45.0,
        max_retries: int = 3,
        user_agent: str = DEFAULT_UA,
        sleeper: Callable[[float], None] = time.sleep,
    ) -> None:
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.min_interval_s = min_interval_s
        self.timeout_s = timeout_s
        self.max_retries = max_retries
        self.user_agent = user_agent
        self._sleeper = sleeper
        self._last_request_at = 0.0

    def _cache_key(self, url: str) -> str:
        return hashlib.sha256(url.encode("utf-8")).hexdigest()

    def _cache_paths(self, url: str) -> tuple[Path, Path]:
        key = self._cache_key(url)
        return self.cache_dir / f"{key}.bin", self.cache_dir / f"{key}.meta.json"

    def get(self, url: str, *, use_cache: bool = True) -> HttpResult:
        request_url = sanitize_request_url(url)
        bin_path, meta_path = self._cache_paths(request_url)
        if use_cache and bin_path.exists() and meta_path.exists():
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
                body = bin_path.read_bytes()
                return HttpResult(
                    url=request_url,
                    ok=True,
                    status=meta.get("status"),
                    content_type=meta.get("content_type"),
                    body=body,
                    from_cache=True,
                    attempts=0,
                )
            except OSError:
                pass

        last_err: str | None = None
        for attempt in range(1, self.max_retries + 1):
            elapsed = time.monotonic() - self._last_request_at
            wait = self.min_interval_s - elapsed
            if wait > 0:
                self._sleeper(wait)
            self._last_request_at = time.monotonic()
            try:
                req = urllib.request.Request(
                    request_url,
                    headers={"User-Agent": self.user_agent, "Accept": "*/*"},
                )
                with urllib.request.urlopen(req, timeout=self.timeout_s) as resp:
                    body = resp.read()
                    status = getattr(resp, "status", 200)
                    content_type = resp.headers.get("Content-Type")
                bin_path.write_bytes(body)
                meta_path.write_text(
                    json.dumps(
                        {
                            "url": request_url,
                            "status": status,
                            "content_type": content_type,
                            "sha256": hashlib.sha256(body).hexdigest(),
                            "bytes": len(body),
                        },
                        indent=2,
                    )
                    + "\n",
                    encoding="utf-8",
                )
                return HttpResult(
                    url=request_url,
                    ok=True,
                    status=status,
                    content_type=content_type,
                    body=body,
                    from_cache=False,
                    attempts=attempt,
                )
            except urllib.error.HTTPError as e:
                last_err = f"HTTPError:{e.code}"
                # Do not retry hard 404
                if e.code in (404, 410):
                    break
                self._sleeper(min(2.0 * attempt, 6.0))
            except Exception as e:  # noqa: BLE001
                last_err = f"{type(e).__name__}:{e}"
                self._sleeper(min(2.0 * attempt, 6.0))

        return HttpResult(
            url=request_url,
            ok=False,
            status=None,
            content_type=None,
            body=b"",
            from_cache=False,
            error=last_err,
            attempts=self.max_retries,
        )
