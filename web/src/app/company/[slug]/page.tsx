import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RoleLabel, StatusBadge } from "@/components/company-card";
import { getViewer, maskEmail, maskPhone, maskWebsite, viewerCanSeeContacts } from "@/lib/access";
import { countryName, flag } from "@/lib/countries";
import { getCompany } from "@/lib/queries";
import { getLocale, translator } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/company/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) return {};
  const what = c.role === "BUYER" ? "fruit importer" : c.role === "SELLER" ? "fruit exporter" : "fruit trader";
  return {
    title: `${c.name}: ${what} in ${c.city ? `${c.city}, ` : ""}${countryName(c.country)}`,
    description: c.description ?? `${c.name}, ${what} based in ${countryName(c.country)}.`,
  };
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function CompanyPage({ params }: PageProps<"/company/[slug]">) {
  const { slug } = await params;
  const c = await getCompany(slug);
  if (!c) notFound();

  const viewer = await getViewer();
  const canSee = viewerCanSeeContacts(viewer, c.id);
  const t = translator(await getLocale());
  const sells = c.products.filter((p) => p.direction === "SELLS");
  const buys = c.products.filter((p) => p.direction === "BUYS");
  const hasContact = c.phone || c.email || c.website;

  const Contact = ({ label, value, masked, href }: { label: string; value: string | null; masked: string | null; href?: string }) => {
    if (!value) return null;
    return (
      <div>
        <dt className="text-stone">{label}</dt>
        <dd className="font-medium">
          {canSee ? (
            href ? <a href={href} rel="noopener" className="text-green hover:underline">{value}</a> : value
          ) : (
            <span className="masked" title={t("company.contactsMembers")}>{masked}</span>
          )}
        </dd>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-ink-2">
        <Link href={c.role === "SELLER" ? "/exporters" : "/buyers"} className="hover:underline">
          {c.role === "SELLER" ? t("nav.exporters") : t("nav.buyers")}
        </Link>{" "}
        / {flag(c.country)} {countryName(c.country)}
      </p>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <RoleLabel role={c.role} />
          <h1 className="mt-1 text-4xl font-black">{c.name}</h1>
          <p className="mt-1 text-lg text-ink-2">
            {c.city ? `${c.city}, ` : ""}{countryName(c.country)}
            {c.terminal && (
              <>
                {" "}· {t("card.at")}{" "}
                <Link href={`/terminals/${c.terminal.slug}`} className="font-medium text-green hover:underline">
                  {c.terminal.name}
                </Link>
                {c.stall && <> ({t("card.stall")} {c.stall})</>}
              </>
            )}
          </p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[7fr_5fr]">
        <div>
          {c.description && <p className="max-w-prose text-ink-2">{c.description}</p>}

          {sells.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-extrabold">{t("company.supplies")}</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {sells.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2">
                    <Link href={`/products/${p.category.slug}`} className="font-medium hover:underline">{p.category.name}</Link>
                    {p.seasonFrom && p.seasonTo && (
                      <span className="text-sm text-ink-2">{months[p.seasonFrom - 1]}–{months[p.seasonTo - 1]}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {buys.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-extrabold">{t("company.buys")}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {buys.map((p) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.category.slug}`} className="rounded-sm bg-paper-2 px-2 py-1 text-sm font-medium hover:bg-line">{p.category.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {c.profile && (c.profile.certifications.length > 0 || c.profile.exportMarkets.length > 0 || c.profile.packingDetails) && (
            <section className="mt-8">
              <h2 className="text-xl font-extrabold">{t("company.profile")}</h2>
              <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                {c.profile.certifications.length > 0 && (
                  <div><dt className="text-stone">{t("company.certs")}</dt><dd className="font-medium">{c.profile.certifications.join(", ")}</dd></div>
                )}
                {c.profile.exportMarkets.length > 0 && (
                  <div><dt className="text-stone">{t("company.markets")}</dt><dd className="font-medium">{c.profile.exportMarkets.join(", ")}</dd></div>
                )}
                {c.profile.yearFounded && (<div><dt className="text-stone">{t("company.founded")}</dt><dd className="font-medium">{c.profile.yearFounded}</dd></div>)}
                {c.profile.capacity && (<div><dt className="text-stone">{t("company.capacity")}</dt><dd className="font-medium">{c.profile.capacity}</dd></div>)}
                {c.profile.packingDetails && (
                  <div className="sm:col-span-2"><dt className="text-stone">{t("company.packing")}</dt><dd className="font-medium">{c.profile.packingDetails}</dd></div>
                )}
              </dl>
            </section>
          )}

          {(c.offers.length > 0 || c.requests.length > 0) && (
            <section className="mt-8">
              <h2 className="text-xl font-extrabold">{t("company.openLeads")}</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {c.offers.map((o) => (
                  <li key={o.id} className="py-3"><p className="font-semibold">{t("company.offer")}: {o.title}</p><p className="text-sm text-ink-2">{o.category.name}{o.quantity ? ` · ${o.quantity}` : ""}</p></li>
                ))}
                {c.requests.map((r) => (
                  <li key={r.id} className="py-3"><p className="font-semibold">{t("company.wanted")}: {r.title}</p><p className="text-sm text-ink-2">{r.category.name}{r.quantity ? ` · ${r.quantity}` : ""}</p></li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="tag h-fit p-5">
          <h2 className="text-lg font-extrabold">{t("company.contact")}</h2>
          {hasContact ? (
            <dl className="mt-3 grid gap-3 text-sm">
              <Contact label={t("company.phone")} value={c.phone} masked={maskPhone(c.phone)} />
              <Contact label={t("company.email")} value={c.email} masked={maskEmail(c.email)} href={c.email ? `mailto:${c.email}` : undefined} />
              <Contact label={t("company.website")} value={c.website?.replace(/^https?:\/\//, "") ?? null} masked={maskWebsite(c.website)} href={c.website ?? undefined} />
              {c.address && (<div><dt className="text-stone">{t("company.address")}</dt><dd className="font-medium">{c.address}</dd></div>)}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-2">{t("company.noContact")}</p>
          )}
          {!canSee && hasContact && (
            <p className="mt-4 text-sm text-ink-2">
              {t("company.contactsMembers")}{" "}
              <Link href="/pricing" className="font-semibold text-green hover:underline">{t("company.seePlans")}</Link>
            </p>
          )}
          <Link href={`/inquire/${c.slug}`} className="mt-4 block rounded-sm bg-green px-4 py-2.5 text-center font-semibold text-white hover:bg-green-deep">
            {t("company.sendInquiry")}
          </Link>
          <p className="mt-2 text-center text-xs text-stone">{t("company.freeNote")}</p>

          {c.status === "UNCLAIMED" && (
            <div className="mt-5 border-t border-line pt-4 text-sm">
              <p className="font-semibold">{t("company.yours")}</p>
              <p className="mt-1 text-ink-2">{t("company.claimDesc")}</p>
              <Link href={`/claim/${c.slug}`} className="mt-2 inline-block font-semibold text-green hover:underline">{t("company.claim")}</Link>
              <span className="mx-2 text-stone">·</span>
              <Link href="/about#listings" className="text-ink-2 hover:underline">{t("company.removeCorrect")}</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
