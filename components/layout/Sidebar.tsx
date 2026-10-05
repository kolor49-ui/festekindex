"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavCategory = {
  id: string;
  slug: string;
  name: string;
  navLabel?: string;
};

const DB_LINKS = [
  { href: "/cegek", label: "Cégek" },
  { href: "/markak", label: "Márkák" },
  { href: "/technologiak", label: "Technológiák" },
  { href: "/tudastar", label: "Tudástár" },
];

export function Sidebar({
  categories,
  open,
  onNavigate,
}: {
  categories: NavCategory[];
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar${open ? " open" : ""}`} id="side">
      <Link href="/" className="brand" onClick={onNavigate}>
        <div className="brandrow">
          <div className="mark" aria-hidden />
          <div className="name">
            FESTÉK<span>INDEX</span>
          </div>
        </div>
        <div className="tagline">A festékipar szakmai indexe</div>
      </Link>

      <div className="sidebody">
        <div className="sidetitle">Szakterületek</div>
        <div>
          {categories.map((cat) => {
            const href =
              cat.id === "cat_all" ? "/" : `/kategoriak/${cat.slug}`;
            const active =
              cat.id === "cat_all"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={cat.id}
                href={href}
                className={`cat${active ? " on" : ""}`}
                onClick={onNavigate}
              >
                {cat.navLabel ?? cat.name}
              </Link>
            );
          })}
        </div>

        <div className="sidegroup">
          <div className="sidetitle">Adatbázis</div>
          {DB_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mainlink"
              onClick={onNavigate}
            >
              {link.label} <span>→</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
