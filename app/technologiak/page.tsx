import type { Metadata } from "next";
import { listTechnologies } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Technológiák | FESTÉKINDEX",
  "Festékipari technológiák: airless, porfesték, csiszolás és további eljárások.",
  "/technologiak",
);

export default function TechnologiakPage() {
  const items = listTechnologies();
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Technológiák" },
          ]}
        />
        <h1>Technológiák</h1>
        <p className="page-lead">
          Eljárások és alkalmazástechnikák — márkákkal, gépekkel és
          forgalmazókkal összekötve.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
