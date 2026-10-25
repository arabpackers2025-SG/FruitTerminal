import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { countryName } from "@/lib/countries";
import { ClaimForm } from "@/components/claim-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Claim a company" };

export default async function ClaimPage({ params }: PageProps<"/claim/[slug]">) {
  const { slug } = await params;
  const company = await db.query.companies.findFirst({ where: eq(companies.slug, slug) });
  if (!company) notFound();
  const user = await getSessionUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-sm text-ink-2">
        <Link href={`/company/${company.slug}`} className="hover:underline">← {company.name}</Link>
      </p>
      <h1 className="mt-2 text-3xl font-black">Claim {company.name}</h1>
      <p className="mt-1 text-ink-2">{company.city ? `${company.city}, ` : ""}{countryName(company.country)}</p>

      <div className="mt-8">
        {company.status !== "UNCLAIMED" ? (
          <p className="rounded-sm bg-paper-2 px-4 py-3 text-ink-2">
            This listing has already been claimed. If it's yours and you've lost access, email{" "}
            <a href="mailto:order@saguenygroup.com" className="font-semibold text-green hover:underline">order@saguenygroup.com</a>.
          </p>
        ) : !user ? (
          <div className="rounded-sm bg-paper-2 px-4 py-4">
            <p className="text-ink-2">Sign in or create an account to claim this company.</p>
            <div className="mt-3 flex gap-3">
              <Link href="/signup" className="rounded-sm bg-green px-4 py-2 font-semibold text-white hover:bg-green-deep">Create account</Link>
              <Link href="/login" className="rounded-sm border border-line px-4 py-2 font-semibold hover:bg-paper">Sign in</Link>
            </div>
          </div>
        ) : user.companyId ? (
          <p className="rounded-sm bg-paper-2 px-4 py-3 text-ink-2">
            Your account is already linked to a company. One account manages one company.
          </p>
        ) : (
          <ClaimForm companyId={company.id} companyName={company.name} />
        )}
      </div>
    </div>
  );
}
