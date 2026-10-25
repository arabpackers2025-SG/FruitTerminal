import Link from "next/link";
import { getLocale, translator } from "@/lib/i18n";

export async function SiteFooter() {
  const t = translator(await getLocale());
  return (
    <footer className="mt-16 border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-ink-2 sm:grid-cols-3">
        <div>
          <p className="font-extrabold text-ink">Fruit Terminal</p>
          <p className="mt-2 max-w-xs">{t("footer.tagline")}</p>
          <p className="mt-2 text-stone">{t("footer.operated")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/terminals">{t("nav.terminals")}</Link>
          <Link href="/buyers">{t("nav.buyers")}</Link>
          <Link href="/exporters">{t("nav.exporters")}</Link>
          <Link href="/products">{t("nav.products")}</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/about">{t("footer.about")}</Link>
          <Link href="/about#listings">{t("footer.remove")}</Link>
          <Link href="/about#terms">{t("footer.terms")}</Link>
        </div>
      </div>
    </footer>
  );
}
