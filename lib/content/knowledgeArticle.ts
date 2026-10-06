/**
 * Controlled Knowledge article body parser.
 * Supports ## / ### headings, paragraphs, ul/ol lists, and **bold**.
 * No raw HTML — React nodes only.
 */

import { createElement, type ReactNode } from "react";

export type KnowledgeArticleBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

const H2_RE = /^##\s+(.+)$/;
const H3_RE = /^###\s+(.+)$/;
const UL_RE = /^[-*]\s+(.+)$/;
const OL_RE = /^\d+[.)]\s+(.+)$/;

function isUlLine(line: string): boolean {
  return UL_RE.test(line);
}

function isOlLine(line: string): boolean {
  return OL_RE.test(line);
}

function stripUl(line: string): string {
  return line.replace(UL_RE, "$1").trim();
}

function stripOl(line: string): string {
  return line.replace(OL_RE, "$1").trim();
}

/** Parse Knowledge body into ordered semantic blocks. Content order preserved. */
export function parseKnowledgeArticleBody(
  body: string | undefined,
): KnowledgeArticleBlock[] {
  const raw = (body ?? "").replace(/\r\n/g, "\n").trim();
  if (!raw) return [];

  const chunks = raw.split(/\n\s*\n/);
  const blocks: KnowledgeArticleBlock[] = [];

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l) => l.trim().length > 0);
    if (!lines.length) continue;

    if (lines.length === 1) {
      const line = lines[0]!.trim();
      const h2 = H2_RE.exec(line);
      if (h2) {
        blocks.push({ type: "h2", text: h2[1]!.trim() });
        continue;
      }
      const h3 = H3_RE.exec(line);
      if (h3) {
        blocks.push({ type: "h3", text: h3[1]!.trim() });
        continue;
      }
    }

    if (lines.every(isUlLine)) {
      blocks.push({ type: "ul", items: lines.map(stripUl) });
      continue;
    }

    if (lines.every(isOlLine)) {
      blocks.push({ type: "ol", items: lines.map(stripOl) });
      continue;
    }

    // Mixed / multi-line: emit headings or list runs, otherwise paragraphs.
    let i = 0;
    while (i < lines.length) {
      const line = lines[i]!.trim();
      const h2 = H2_RE.exec(line);
      if (h2) {
        blocks.push({ type: "h2", text: h2[1]!.trim() });
        i += 1;
        continue;
      }
      const h3 = H3_RE.exec(line);
      if (h3) {
        blocks.push({ type: "h3", text: h3[1]!.trim() });
        i += 1;
        continue;
      }

      if (isUlLine(line)) {
        const items: string[] = [];
        while (i < lines.length && isUlLine(lines[i]!.trim())) {
          items.push(stripUl(lines[i]!.trim()));
          i += 1;
        }
        blocks.push({ type: "ul", items });
        continue;
      }

      if (isOlLine(line)) {
        const items: string[] = [];
        while (i < lines.length && isOlLine(lines[i]!.trim())) {
          items.push(stripOl(lines[i]!.trim()));
          i += 1;
        }
        blocks.push({ type: "ol", items });
        continue;
      }

      const paraLines: string[] = [];
      while (
        i < lines.length &&
        !H2_RE.test(lines[i]!.trim()) &&
        !H3_RE.test(lines[i]!.trim()) &&
        !isUlLine(lines[i]!.trim()) &&
        !isOlLine(lines[i]!.trim())
      ) {
        paraLines.push(lines[i]!.trim());
        i += 1;
      }
      const text = paraLines.join(" ").trim();
      if (text) blocks.push({ type: "p", text });
    }
  }

  return blocks;
}

/** Inline **bold** only — no HTML tags. */
export function renderInlineText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(createElement("strong", { key: `b${key++}` }, match[1]));
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

/** Render parsed blocks to React nodes (SSR-safe, no dangerouslySetInnerHTML). */
export function renderKnowledgeArticleBody(
  body: string | undefined,
): ReactNode[] {
  return parseKnowledgeArticleBody(body).map((block, i) => {
    switch (block.type) {
      case "h2":
        return createElement(
          "h2",
          { key: `h2-${i}`, className: "knowledge-article-h2" },
          block.text,
        );
      case "h3":
        return createElement(
          "h3",
          { key: `h3-${i}`, className: "knowledge-article-h3" },
          block.text,
        );
      case "p":
        return createElement(
          "p",
          { key: `p-${i}`, className: "knowledge-article-p" },
          ...renderInlineText(block.text),
        );
      case "ul":
        return createElement(
          "ul",
          { key: `ul-${i}`, className: "knowledge-article-ul" },
          block.items.map((item, j) =>
            createElement(
              "li",
              { key: `uli-${j}` },
              ...renderInlineText(item),
            ),
          ),
        );
      case "ol":
        return createElement(
          "ol",
          { key: `ol-${i}`, className: "knowledge-article-ol" },
          block.items.map((item, j) =>
            createElement(
              "li",
              { key: `oli-${j}` },
              ...renderInlineText(item),
            ),
          ),
        );
      default:
        return null;
    }
  });
}

/** Flatten block text in order — for content-preservation checks. */
export function flattenKnowledgeArticleText(
  blocks: KnowledgeArticleBlock[],
): string {
  return blocks
    .map((b) => {
      if (b.type === "ul" || b.type === "ol") return b.items.join("\n");
      return b.text;
    })
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}
