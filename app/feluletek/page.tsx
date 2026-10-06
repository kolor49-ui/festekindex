import type { Metadata } from "next";
import { listSurfaces } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Felületek | FESTÉKINDEX",
  "Festékipari felületek és aljzatok: fa, acél, beton, vakolat és további felületek termékekkel és bevonatokkal.",
  "/feluletek",
);

export default function FeluletekPage() {
  const items = listSurfaces();
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Felületek" },
          ]}
        />
        <h1>Felületek</h1>
        <p className="page-lead">
          Aljzatok és felülettípusok — termékekkel és rendszerekkel összekötve,
          a marketing-kategóriáktól függetlenül.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
