import type { Metadata } from "next";
import { listProductFamilies } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Termékcsaládok | FESTÉKINDEX",
  "Gép- és termékcsaládok: márkákhoz, technológiákhoz és forgalmazókhoz kötve.",
  "/termekcsaladok",
);

export default function TermekcsaladokPage() {
  const items = listProductFamilies();
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Termékcsaládok" },
          ]}
        />
        <h1>Termékcsaládok</h1>
        <p className="page-lead">
          Gépcsaládok és termékcsoportok — az adatmodell készen áll a bővítésre.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
