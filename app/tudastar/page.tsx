import type { Metadata } from "next";
import { listKnowledge } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Tudástár | FESTÉKINDEX",
  "Festékekről, bevonatokról és alkalmazástechnológiákról szóló szakmai útmutatók és összehasonlítások.",
  "/tudastar",
);

export default function TudastarPage() {
  const items = listKnowledge();
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Tudástár" },
          ]}
        />
        <h1>Tudástár</h1>
        <p className="page-lead">
          Festékekről, bevonatokról és alkalmazástechnológiákról szóló szakmai
          útmutatók és összehasonlítások.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
