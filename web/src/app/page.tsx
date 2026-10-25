import Link from "next/link";
import { countryName, flag } from "@/lib/countries";
import { homeStats, listTerminals, latestLeads } from "@/lib/queries";
import { getLocale, translator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, terms, leads, locale] = await Promise.all([homeStats(), listTerminals(), latestLeads(), getLocale()]);
  const tr = translator(locale);
  const byCountry = new Map<string, typeof terms>();
  for (const t of terms) byCountry.set(t.country, [...(byCountry.get(t.country) ?? []), t]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid gap-10 py-12 md:grid-cols-[5fr_7fr] md:py-16">
        <div>
          <h1 className="text-4xl font-black md:text-5xl">{tr("home.title")}</h1>
          <p className="mt-5 max-w-md text-lg text-ink-2">{tr("home.subtitle")}</p>
          <form action="/buyers" method="get" className="mt-7 flex gap-2">
            <input
              type="search"
              name="q"
              placeholder={tr("home.searchPlaceholder")}
              className="w-full rounded-sm border border-line bg-white px-4 py-3 text-ink"
              aria-label={tr("home.search")}
            />
            <button className="rounded-sm bg-green px-5 py-3 font-semibold text-white hover:bg-green-deep">
              {tr("home.search")}
            </button>
          </form>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <dt className="text-sm text-ink-2">{tr("home.stat.terminals")}</dt>
              <dd className="text-3xl font-black tabular-nums">{stats.terminals}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">{tr("home.stat.buyers")}</dt>
              <dd className="text-3xl font-black tabular-nums">{stats.buyers}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">{tr("home.stat.exporters")}</dt>
              <dd className="text-3xl font-black tabular-nums">{stats.sellers}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-sm border border-ink bg-white p-4 md:p-6">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
            <h2 className="text-xl font-extrabold">{tr("home.board")}</h2>
            <Link href="/terminals" className="text-sm font-semibold text-green hover:underline">
              {tr("home.allTerminals")}
            </Link>
          </div>
          <div className="max-h-[32rem] overflow-y-auto">
            {[...byCountry.entries()].map(([country, list]) => (
              <div key={country} className="pt-3">
                <p className="text-xs font-semibold text-stone">
                  {flag(country)} {countryName(country)}
                </p>
                {list.map((t) => (
                  <Link key={t.slug} href={`/terminals/${t.slug}`} className="board-row">
                    <span className="font-semibold">
                      <span className="text-ink-2">{t.city}</span> <span className="mx-1 text-stone">/</span> {t.name}
                    </span>
                    <span className="text-sm tabular-nums text-ink-2">
                      {tr(t.companyCount === 1 ? "home.wholesaler" : "home.wholesalers", { n: t.companyCount })}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 py-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold">{tr("home.latestRequests")}</h2>
          {leads.requests.length === 0 ? (
            <p className="mt-3 text-ink-2">{tr("home.noRequests")}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {leads.requests.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-ink-2">
                    {r.category.name} · {r.company.name} · {countryName(r.company.country)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold">{tr("home.latestOffers")}</h2>
          {leads.offers.length === 0 ? (
            <p className="mt-3 text-ink-2">{tr("home.noOffers")}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {leads.offers.map((o) => (
                <li key={o.id} className="py-3">
                  <p className="font-semibold">{o.title}</p>
                  <p className="text-sm text-ink-2">
                    {o.category.name} · {o.company.name} · {countryName(o.company.country)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-6 border-t border-line py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-extrabold">{tr("home.browseTitle")}</h3>
          <p className="mt-2 text-ink-2">{tr("home.browseBody")}</p>
        </div>
        <div>
          <h3 className="text-lg font-extrabold">{tr("home.claimTitle")}</h3>
          <p className="mt-2 text-ink-2">{tr("home.claimBody")}</p>
        </div>
        <div>
          <h3 className="text-lg font-extrabold">{tr("home.membersTitle")}</h3>
          <p className="mt-2 text-ink-2">
            {tr("home.membersBody")}{" "}
            <Link href="/pricing" className="font-semibold text-green hover:underline">
              {tr("home.seePlans")}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
