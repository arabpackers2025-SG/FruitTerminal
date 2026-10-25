import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CompanyCard } from "@/components/company-card";
import { TerminalMap } from "@/components/terminal-map";
import { countryName, flag } from "@/lib/countries";
import { getTerminal } from "@/lib/queries";
import { getLocale, translator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/terminals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTerminal(slug);
  if (!t) return {};
  return {
    title: `${t.name}, ${t.city}: wholesalers and importers`,
    description: `${t.name} in ${t.city}, ${countryName(t.country)}: address, hours and the ${t.members.length} fruit wholesalers and importers trading there.`,
  };
}

export default async function TerminalPage({ params }: PageProps<"/terminals/[slug]">) {
  const { slug } = await params;
  const t = await getTerminal(slug);
  if (!t) notFound();
  const tr = translator(await getLocale());

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-ink-2">
        <Link href="/terminals" className="hover:underline">{tr("nav.terminals")}</Link> / {flag(t.country)} {countryName(t.country)}
      </p>
      <h1 className="mt-2 text-4xl font-black">{t.name}</h1>
      <p className="mt-1 text-lg text-ink-2">{t.city}{t.region ? `, ${t.region}` : ""}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[7fr_5fr]">
        <div>
          {t.description && <p className="max-w-prose text-ink-2">{t.description}</p>}
          <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {t.address && (<div><dt className="text-stone">{tr("terminal.address")}</dt><dd className="font-medium">{t.address}</dd></div>)}
            {t.hours && (<div><dt className="text-stone">{tr("terminal.hours")}</dt><dd className="font-medium">{t.hours}</dd></div>)}
            {t.website && (
              <div><dt className="text-stone">{tr("terminal.website")}</dt>
                <dd><a href={t.website} rel="noopener" className="font-medium text-green hover:underline">{t.website.replace(/^https?:\/\//, "")}</a></dd>
              </div>
            )}
            {t.phone && (<div><dt className="text-stone">{tr("terminal.office")}</dt><dd className="font-medium">{t.phone}</dd></div>)}
          </dl>
        </div>
        {t.lat != null && t.lng != null && <TerminalMap lat={t.lat} lng={t.lng} name={t.name} />}
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
          <h2 className="text-2xl font-extrabold">{tr("terminal.wholesalersAt", { name: t.name })}</h2>
          <span className="text-sm text-ink-2">{tr("terminals.listed", { n: t.members.length })}</span>
        </div>
        {t.members.length === 0 ? (
          <div className="tag mt-6 p-8">
            <p className="font-semibold">{tr("terminal.notCollected")}</p>
            <p className="mt-1 text-ink-2">{tr("terminal.notCollectedBody")}</p>
            <Link href="/signup" className="mt-3 inline-block rounded-sm bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-deep">{tr("terminal.listYourCompany")}</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.members.map((c) => <CompanyCard key={c.id} c={c} showTerminal={false} />)}
          </div>
        )}
      </section>
    </div>
  );
}
