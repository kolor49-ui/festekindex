import type { Metadata } from "next";
import { listProducts } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Termékek | FESTÉKINDEX",
  "Festékipari termékek a FESTÉKINDEX adatbázisában.",
  "/termekek",
);

export default function TermekekPage() {
  const items = listProducts();
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Termékek" },
          ]}
        />
        <h1>Termékek</h1>
        <p className="page-lead">
          Konkrét termékek — márkákhoz, családokhoz, felületekhez és
          technológiákhoz kötve.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
