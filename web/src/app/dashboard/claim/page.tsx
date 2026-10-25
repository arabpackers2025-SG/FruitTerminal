import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { listCompanies } from "@/lib/queries";
import { countryName, flag } from "@/lib/countries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Claim your listing" };
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function ClaimSearchPage({ searchParams }: PageProps<"/dashboard/claim">) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.companyId) redirect("/dashboard");
  const sp = await searchParams;
  const q = str(sp.q);
  const results = q ? await listCompanies({ q, pageSize: 20 }) : null;

  return (
    <div>
      <h1 className="text-3xl font-black">Claim your listing</h1>
      <p className="mt-2 text-ink-2">Search for your company. Not here? <Link href="/dashboard/new" className="font-semibold text-green hover:underline">Add it.</Link></p>
      <form method="get" className="mt-5 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Company name or city"
          className="w-full rounded-sm border border-line bg-white px-3 py-2.5 focus:border-green" />
        <button className="rounded-sm bg-green px-4 py-2.5 font-semibold text-white hover:bg-green-deep">Search</button>
      </form>
      {results && (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {results.rows.length === 0 && <li className="py-6 text-ink-2">No matches. You can <Link href="/dashboard/new" className="font-semibold text-green hover:underline">add your company</Link>.</li>}
          {results.rows.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-ink-2">{flag(c.country)} {c.city ? `${c.city}, ` : ""}{countryName(c.country)} · {c.status === "UNCLAIMED" ? "Unclaimed" : "Already claimed"}</p>
              </div>
              {c.status === "UNCLAIMED"
                ? <Link href={`/claim/${c.slug}`} className="rounded-sm bg-green px-3 py-2 text-sm font-semibold text-white hover:bg-green-deep">Claim</Link>
                : <span className="text-sm text-stone">Taken</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
