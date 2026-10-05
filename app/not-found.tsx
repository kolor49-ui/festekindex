import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main">
      <div className="page-wrap">
        <h1>Az oldal nem található</h1>
        <p className="page-lead">
          A keresett entitás vagy oldal nem létezik, vagy még nincs publikálva.
        </p>
        <Link href="/" className="pill pill-link">
          ← Vissza a főoldalra
        </Link>
      </div>
    </main>
  );
}
