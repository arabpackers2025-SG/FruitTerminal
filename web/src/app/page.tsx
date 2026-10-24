import Link from "next/link";
import { countryName, flag } from "@/lib/countries";
import { homeStats, listTerminals, latestLeads } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, terms, leads] = await Promise.all([homeStats(), listTerminals(), latestLeads()]);
  const byCountry = new Map<string, typeof terms>();
  for (const t of terms) byCountry.set(t.country, [...(byCountry.get(t.country) ?? []), t]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid gap-10 py-12 md:grid-cols-[5fr_7fr] md:py-16">
        <div>
          <h1 className="text-4xl font-black md:text-5xl">
            Find the buyers inside every fruit terminal.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-2">
            Wholesale markets from Toronto to Rungis to Hunts Point, the importers who trade in them,
            and the exporters who can supply them. Free to browse; members get contact details.
          </p>
          <form action="/buyers" method="get" className="mt-7 flex gap-2">
            <input
              type="search"
              name="q"
              placeholder="Search a buyer, product or city"
              className="w-full rounded-sm border border-line bg-white px-4 py-3 text-ink"
              aria-label="Search buyers"
            />
            <button className="rounded-sm bg-green px-5 py-3 font-semibold text-white hover:bg-green-deep">
              Search
            </button>
          </form>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <dt className="text-sm text-ink-2">Terminals</dt>
              <dd className="text-3xl font-black tabular-nums">{stats.terminals}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">Buyers</dt>
              <dd className="text-3xl font-black tabular-nums">{stats.buyers}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">Exporters</dt>
              <dd className="text-3xl font-black tabular-nums">{stats.sellers}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-sm border border-ink bg-white p-4 md:p-6">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
            <h2 className="text-xl font-extrabold">Terminal board</h2>
            <Link href="/terminals" className="text-sm font-semibold text-green hover:underline">
              All terminals
            </Link>
          </div>
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
                    {t.companyCount} {t.companyCount === 1 ? "wholesaler" : "wholesalers"}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 py-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold">Latest buy requests</h2>
          {leads.requests.length === 0 ? (
            <p className="mt-3 text-ink-2">
              No open requests yet. Buyers post what they need; matching exporters are alerted.
            </p>
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
          <h2 className="text-2xl font-extrabold">Latest offers</h2>
          {leads.offers.length === 0 ? (
            <p className="mt-3 text-ink-2">
              No open offers yet. Exporters post availability by product and season.
            </p>
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
          <h3 className="text-lg font-extrabold">Browse by terminal</h3>
          <p className="mt-2 text-ink-2">
            Every listed terminal has a page with its location, hours and the wholesalers trading inside it.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-extrabold">Claim your listing</h3>
          <p className="mt-2 text-ink-2">
            Listed from public sources and marked Unclaimed? Claim it for free, correct the details, and start
            receiving inquiries.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-extrabold">Members see contacts</h3>
          <p className="mt-2 text-ink-2">
            Browsing is free with one inquiry a day. Seller Pro and Buyer Pro unlock phone, email and website on
            every profile.{" "}
            <Link href="/pricing" className="font-semibold text-green hover:underline">
              See plans
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
