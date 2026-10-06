import type { Metadata } from "next";
import { listNavCategories } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";

export const metadata: Metadata = listMetadata(
  "Kategóriák | FESTÉKINDEX",
  "Festékipari szakterületek és szakmai kategóriarendszer.",
  "/kategoriak",
);

export default function KategoriakPage() {
  const items = listNavCategories().filter((c) => c.id !== "cat_all");
  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Kategóriák" },
          ]}
        />
        <h1>Kategóriák</h1>
        <p className="page-lead">
          Szakmai kategóriarendszer — festékipari szakterületek és kapcsolódó
          termékek.
        </p>
        <EntityList entities={items} />
      </div>
    </main>
  );
}
