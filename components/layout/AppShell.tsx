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
  crumb,
  children,
}: {
  categories: NavCategory[];
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
          <div className="crumb">
            FESTÉKINDEX / <b>{crumb ?? "Minden terület"}</b>
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
