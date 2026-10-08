"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Sidebar } from "./Sidebar";

type NavCategory = {
  id: string;
  slug: string;
  name: string;
  navLabel?: string;
};

export function AppShell({
  categories,
  children,
}: {
  categories: NavCategory[];
  /** @deprecated Unused — page Breadcrumbs are the canonical location signal. */
  crumb?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const scrollYRef = useRef(0);
  const scrollCapturedRef = useRef(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const captureScrollY = useCallback(() => {
    scrollYRef.current = window.scrollY;
    scrollCapturedRef.current = true;
  }, []);

  const openDrawer = useCallback(() => {
    // pointerdown already captured scroll; keyboard path captures here.
    if (!scrollCapturedRef.current) {
      scrollYRef.current = window.scrollY;
    }
    scrollCapturedRef.current = false;
    setOpen(true);
  }, []);

  // Preserve document scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;

    const { body, documentElement } = document;
    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
      width: body.style.width,
    };
    const prevHtmlOverflow = documentElement.style.overflow;

    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    const sidebar = document.getElementById("side");
    sidebarRef.current = sidebar;
    const focusables = getFocusable(sidebar);
    const initial = focusables[0] ?? sidebar;
    initial?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
        return;
      }
      if (e.key !== "Tab" || !sidebar) return;
      const items = getFocusable(sidebar);
      if (!items.length) {
        e.preventDefault();
        sidebar.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (!active || active === first || !sidebar.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !sidebar.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.overflow = prevBody.overflow;
      body.style.width = prevBody.width;
      documentElement.style.overflow = prevHtmlOverflow;
      const y = scrollYRef.current;
      menuButtonRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, y);
    };
  }, [open, closeDrawer]);

  function onMenuKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      openDrawer();
    }
  }

  return (
    <div className={`app${open ? " nav-open" : ""}`}>
      {open ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Menü bezárása"
          tabIndex={-1}
          onClick={closeDrawer}
        />
      ) : null}
      <Sidebar
        categories={categories}
        open={open}
        onNavigate={closeDrawer}
        dialogTitleId={open ? titleId : undefined}
      />
      <section className="content" inert={open ? true : undefined}>
        <header className="topbar">
          <button
            type="button"
            className="mobileMenu"
            aria-label={open ? "Menü bezárása" : "Menü"}
            aria-expanded={open}
            aria-controls="side"
            ref={menuButtonRef}
            onPointerDown={() => {
              if (!open) captureScrollY();
            }}
            onClick={() => (open ? closeDrawer() : openDrawer())}
            onKeyDown={onMenuKeyDown}
          >
            ☰
          </button>
          {/* Global site scope — not a page breadcrumb (those live in each Hub). */}
          <div className="crumb site-scope">
            <Link href="/">FESTÉKINDEX</Link>
            <span className="site-scope-tag">A festékipar szakmai indexe</span>
          </div>
          <div className="toplinks">
            <Link href="/cegek">Cégek</Link>
            <Link href="/markak">Márkák</Link>
            <Link href="/tudastar">Tudástár</Link>
          </div>
        </header>
        {children}
      </section>
      {open ? (
        <span id={titleId} className="sr-only">
          Fő navigáció
        </span>
      ) : null}
    </div>
  );
}

function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.tabIndex !== -1,
  );
}
