"use client";

import Link from "next/link";
import { useState } from "react";
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

  return (
    <div className="app">
      {open ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Menü bezárása"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <Sidebar
        categories={categories}
        open={open}
        onNavigate={() => setOpen(false)}
      />
      <section className="content">
        <header className="topbar">
          <button
            type="button"
            className="mobileMenu"
            aria-label="Menü"
            onClick={() => setOpen((v) => !v)}
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
    </div>
  );
}
