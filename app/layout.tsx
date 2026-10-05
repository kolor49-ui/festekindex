import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { listNavCategories } from "@/lib/data/repository";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://festekindex.hu"),
  title: {
    default: "FESTÉKINDEX — a festékipar szakmai indexe",
    template: "%s | FESTÉKINDEX",
  },
  description:
    "Gyártók, márkák, festékek, bevonatok, technológiák és szakmai kapcsolatok egy kereshető rendszerben.",
  openGraph: {
    siteName: "FESTÉKINDEX",
    locale: "hu_HU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = listNavCategories().map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    navLabel: c.navLabel,
  }));

  return (
    <html lang="hu">
      <body className={inter.className}>
        <AppShell categories={categories}>{children}</AppShell>
      </body>
    </html>
  );
}
