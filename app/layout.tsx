import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { listNavCategories } from "@/lib/data/repository";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0b1117",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://festekindex.hu"),
  applicationName: "FESTÉKINDEX",
  title: {
    default: "FESTÉKINDEX — a festékipar szakmai indexe",
    template: "%s | FESTÉKINDEX",
  },
  description:
    "Cégek, márkák és technológiák egyetlen kereshető szakmai rendszerben.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "FESTÉKINDEX",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    siteName: "FESTÉKINDEX",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        url: "/icons/og-512.png",
        width: 512,
        height: 512,
        alt: "FESTÉKINDEX",
      },
    ],
  },
  twitter: {
    card: "summary",
    images: ["/icons/og-512.png"],
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
    <html lang="hu" className={inter.variable}>
      <body>
        <AppShell categories={categories}>{children}</AppShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
