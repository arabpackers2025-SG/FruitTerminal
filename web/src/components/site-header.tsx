import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { getLocale, translator } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteHeader() {
  const [user, locale] = await Promise.all([getSessionUser(), getLocale()]);
  const t = translator(locale);
  const nav = [
    { href: "/terminals", label: t("nav.terminals") },
    { href: "/buyers", label: t("nav.buyers") },
    { href: "/exporters", label: t("nav.exporters") },
    { href: "/products", label: t("nav.products") },
    { href: "/pricing", label: t("nav.pricing") },
  ];
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <span className="inline-block h-6 w-6 rounded-sm bg-green" aria-hidden />
          <span className="text-lg font-extrabold tracking-tight" style={{ fontVariationSettings: '"wdth" 112' }}>
            Fruit Terminal
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-2 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-ink hover:text-green">
                {t("cta.dashboard")}
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hidden text-sm font-medium text-ink-2 hover:text-ink sm:inline">
                  {t("cta.admin")}
                </Link>
              )}
              <form action={signOutAction}>
                <button className="text-sm font-medium text-ink-2 hover:text-ink">{t("cta.signout")}</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-medium text-ink-2 hover:text-ink sm:inline">
                {t("cta.signin")}
              </Link>
              <Link
                href="/signup"
                className="rounded-sm bg-green px-3 py-2 text-sm font-semibold text-white hover:bg-green-deep"
              >
                {t("cta.list")}
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-line px-4 py-2 text-sm font-medium text-ink-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
