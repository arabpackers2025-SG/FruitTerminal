import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLocale, dir } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { default: "Fruit Terminal", template: "%s · Fruit Terminal" },
  description:
    "Directory of wholesale fruit terminals worldwide and the exporters, growers and importers that trade through them.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dir(locale)} className="h-full">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
