"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  formatSearchResultMeta,
  normalizeSearchText,
  rankSearchDocuments,
  SEARCH_AUTOCOMPLETE_DESKTOP_LIMIT,
  SEARCH_AUTOCOMPLETE_MOBILE_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
  type SearchDocument,
  type SearchResult,
} from "@/lib/search";

function navigateTo(href: string) {
  if (typeof window !== "undefined") {
    window.location.assign(href);
  }
}

type SearchBoxProps = {
  catalog: SearchDocument[];
  /** Initial input value (e.g. from /kereses?q=). */
  initialQuery?: string;
  placeholder?: string;
  /** Visual density / layout context. */
  variant?: "hero" | "page";
  /** Accessible label for the input. */
  label?: string;
  className?: string;
};

function useIsNarrow(breakpoint = 640) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpoint]);
  return narrow;
}

export function SearchBox({
  catalog,
  initialQuery = "",
  placeholder = "Keress cégre, márkára, termékre, technológiára…",
  variant = "page",
  label = "Keresés",
  className,
}: SearchBoxProps) {
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const narrow = useIsNarrow();

  const limit = narrow
    ? SEARCH_AUTOCOMPLETE_MOBILE_LIMIT
    : SEARCH_AUTOCOMPLETE_DESKTOP_LIMIT;

  const normalizedLen = normalizeSearchText(query).length;
  const eligible = normalizedLen >= SEARCH_MIN_QUERY_LENGTH;

  const suggestions = useMemo(() => {
    if (!eligible) return [] as SearchResult[];
    return rankSearchDocuments(catalog, query).slice(0, limit);
  }, [catalog, query, eligible, limit]);

  const showPanel = open && eligible;

  const goFullSearch = useCallback((q: string) => {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    navigateTo(`/kereses?q=${encodeURIComponent(term)}`);
  }, []);

  const goEntity = useCallback((href: string) => {
    setOpen(false);
    navigateTo(href);
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (showPanel && activeIndex >= 0 && suggestions[activeIndex]) {
      goEntity(suggestions[activeIndex]!.href);
      return;
    }
    goFullSearch(query);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!eligible) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => {
        const max = suggestions.length - 1;
        if (max < 0) return -1;
        return i < max ? i + 1 : 0;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => {
        const max = suggestions.length - 1;
        if (max < 0) return -1;
        return i <= 0 ? max : i - 1;
      });
      return;
    }

    if (e.key === "Enter") {
      // handled by form submit with activeIndex
    }
  }

  const activeOptionId =
    showPanel && activeIndex >= 0
      ? `${listboxId}-opt-${activeIndex}`
      : undefined;

  return (
    <div
      ref={rootRef}
      className={`search-box search-box--${variant}${className ? ` ${className}` : ""}`}
    >
      <form className="search" action="/kereses" method="get" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          name="q"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (eligible) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
        />
        <button type="submit">Keresés</button>
      </form>

      {showPanel ? (
        <div
          className="search-suggest"
          id={listboxId}
          role="listbox"
          aria-label="Keresési javaslatok"
        >
          {suggestions.length === 0 ? (
            <div className="search-suggest-empty">
              <p>Nincs közvetlen javaslat.</p>
              <Link
                href={`/kereses?q=${encodeURIComponent(query.trim())}`}
                className="search-suggest-footer"
                onClick={() => setOpen(false)}
              >
                Keresés erre: „{query.trim()}”
              </Link>
            </div>
          ) : (
            <>
              <ul className="search-suggest-list">
                {suggestions.map((hit, index) => {
                  const meta = formatSearchResultMeta(hit);
                  const active = index === activeIndex;
                  return (
                    <li key={`${hit.type}:${hit.id}`} role="presentation">
                      <button
                        type="button"
                        id={`${listboxId}-opt-${index}`}
                        role="option"
                        aria-selected={active}
                        className={`search-suggest-item${active ? " is-active" : ""}${
                          hit.matchKind === "identity"
                            ? " is-identity"
                            : " is-context"
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(e) => {
                          // Prevent input blur from closing before click.
                          e.preventDefault();
                        }}
                        onClick={() => goEntity(hit.href)}
                      >
                        <span className="search-suggest-name">
                          {hit.displayName}
                        </span>
                        {meta ? (
                          <span className="search-suggest-meta">{meta}</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={`/kereses?q=${encodeURIComponent(query.trim())}`}
                className="search-suggest-footer"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen(false)}
              >
                Összes találat erre: „{query.trim()}”
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
