import type { Metadata } from "next";
import { listOrganizations } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Cégek | FESTÉKINDEX",
  "Magyarországi festékipari cégek, gyártók, forgalmazók és képviseletek.",
  "/cegek",
);

export default function CegekPage() {
  const items = listOrganizations();
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Cégek" },
          ]}
        />
        <h1>Cégek</h1>
        <p className="page-lead">
          Jogi személyek, gyártók, magyarországi forgalmazók, képviseletek és
          szervizek — kapcsolati hálóval.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
