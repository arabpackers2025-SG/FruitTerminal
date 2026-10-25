import Link from "next/link";
import type { Metadata } from "next";
import { countryName, flag } from "@/lib/countries";
import { listTerminals } from "@/lib/queries";
import { getLocale, translator } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Wholesale fruit terminals worldwide",
  description: "Directory of wholesale fruit and vegetable terminals by country, with the wholesalers trading in each.",
};

export default async function TerminalsPage() {
  const [terms, locale] = await Promise.all([listTerminals(), getLocale()]);
  const tr = translator(locale);
  const byCountry = new Map<string, typeof terms>();
  for (const t of terms) byCountry.set(t.country, [...(byCountry.get(t.country) ?? []), t]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black">{tr("terminals.title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{tr("terminals.intro")}</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {[...byCountry.entries()].map(([country, list]) => (
          <section key={country}>
            <h2 className="border-b-2 border-ink pb-1 text-xl font-extrabold">
              {flag(country)} {countryName(country)}
            </h2>
            {list.map((t) => (
              <Link key={t.slug} href={`/terminals/${t.slug}`} className="board-row">
                <span>
                  <span className="font-semibold">{t.name}</span>
                  <span className="block text-sm text-ink-2">{t.city}</span>
                </span>
                <span className="text-sm tabular-nums text-ink-2">{tr("terminals.listed", { n: t.companyCount })}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
