import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RoleLabel, StatusBadge } from "@/components/company-card";
import { getViewer, maskEmail, maskPhone, maskWebsite, viewerCanSeeContacts } from "@/lib/access";
import { countryName, flag } from "@/lib/countries";
import { getCompany } from "@/lib/queries";

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

  const viewer = getViewer();
  const canSee = viewerCanSeeContacts(viewer);
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
            <span className="masked" title="Visible to members">{masked}</span>
          )}
        </dd>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-ink-2">
        <Link href={c.role === "SELLER" ? "/exporters" : "/buyers"} className="hover:underline">
          {c.role === "SELLER" ? "Exporters" : "Buyers"}
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
                {" "}· at{" "}
                <Link href={`/terminals/${c.terminal.slug}`} className="font-medium text-green hover:underline">
                  {c.terminal.name}
                </Link>
                {c.stall && <> (stall {c.stall})</>}
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
              <h2 className="text-xl font-extrabold">Supplies</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {sells.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2">
                    <Link href={`/products/${p.category.slug}`} className="font-medium hover:underline">{p.category.name}</Link>
                    {p.seasonFrom && p.seasonTo && (
                      <span className="text-sm text-ink-2">{months[p.seasonFrom - 1]} to {months[p.seasonTo - 1]}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {buys.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-extrabold">Buys</h2>
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
              <h2 className="text-xl font-extrabold">Profile</h2>
              <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                {c.profile.certifications.length > 0 && (
                  <div><dt className="text-stone">Certifications</dt><dd className="font-medium">{c.profile.certifications.join(", ")}</dd></div>
                )}
                {c.profile.exportMarkets.length > 0 && (
                  <div><dt className="text-stone">Export markets</dt><dd className="font-medium">{c.profile.exportMarkets.join(", ")}</dd></div>
                )}
                {c.profile.yearFounded && (<div><dt className="text-stone">Founded</dt><dd className="font-medium">{c.profile.yearFounded}</dd></div>)}
                {c.profile.capacity && (<div><dt className="text-stone">Capacity</dt><dd className="font-medium">{c.profile.capacity}</dd></div>)}
                {c.profile.packingDetails && (
                  <div className="sm:col-span-2"><dt className="text-stone">Packing</dt><dd className="font-medium">{c.profile.packingDetails}</dd></div>
                )}
              </dl>
            </section>
          )}

          {(c.offers.length > 0 || c.requests.length > 0) && (
            <section className="mt-8">
              <h2 className="text-xl font-extrabold">Open leads</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {c.offers.map((o) => (
                  <li key={o.id} className="py-3"><p className="font-semibold">Offer: {o.title}</p><p className="text-sm text-ink-2">{o.category.name}{o.quantity ? ` · ${o.quantity}` : ""}</p></li>
                ))}
                {c.requests.map((r) => (
                  <li key={r.id} className="py-3"><p className="font-semibold">Wanted: {r.title}</p><p className="text-sm text-ink-2">{r.category.name}{r.quantity ? ` · ${r.quantity}` : ""}</p></li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="tag h-fit p-5">
          <h2 className="text-lg font-extrabold">Contact</h2>
          {hasContact ? (
            <dl className="mt-3 grid gap-3 text-sm">
              <Contact label="Phone" value={c.phone} masked={maskPhone(c.phone)} />
              <Contact label="Email" value={c.email} masked={maskEmail(c.email)} href={c.email ? `mailto:${c.email}` : undefined} />
              <Contact label="Website" value={c.website?.replace(/^https?:\/\//, "") ?? null} masked={maskWebsite(c.website)} href={c.website ?? undefined} />
              {c.address && (<div><dt className="text-stone">Address</dt><dd className="font-medium">{c.address}</dd></div>)}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-2">No contact details on file yet.</p>
          )}
          {!canSee && hasContact && (
            <p className="mt-4 text-sm text-ink-2">
              Contact details are shown to Seller Pro and Buyer Pro members.{" "}
              <Link href="/pricing" className="font-semibold text-green hover:underline">See plans</Link>
            </p>
          )}
          <Link href="/pricing" className="mt-4 block rounded-sm bg-green px-4 py-2.5 text-center font-semibold text-white hover:bg-green-deep">
            Send an inquiry
          </Link>
          <p className="mt-2 text-center text-xs text-stone">Free accounts can send one inquiry a day.</p>

          {c.status === "UNCLAIMED" && (
            <div className="mt-5 border-t border-line pt-4 text-sm">
              <p className="font-semibold">Is this your company?</p>
              <p className="mt-1 text-ink-2">
                This listing was compiled from {c.source === "founder" ? "public" : "public"} sources. Claim it to correct the details and receive inquiries.
              </p>
              <Link href="/pricing" className="mt-2 inline-block font-semibold text-green hover:underline">Claim this profile</Link>
              <span className="mx-2 text-stone">·</span>
              <Link href="/about#listings" className="text-ink-2 hover:underline">Remove or correct</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
