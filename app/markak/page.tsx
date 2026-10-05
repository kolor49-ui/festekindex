import type { Metadata } from "next";
import { listBrands } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Márkák | FESTÉKINDEX",
  "Festékipari márkák, gyártói kapcsolatok és magyarországi forgalmazók.",
  "/markak",
);

export default function MarkakPage() {
  const items = listBrands();
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Márkák" },
          ]}
        />
        <h1>Márkák</h1>
        <p className="page-lead">
          Nemzetközi és hazai márkák — gyártókkal, forgalmazókkal és
          technológiákkal összekötve.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
