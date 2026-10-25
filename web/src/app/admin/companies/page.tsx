import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { verifyCompanyAction } from "@/lib/actions/admin";
import { countryName } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default async function AdminCompanies() {
  const rows = await db.query.companies.findMany({
    where: inArray(companies.status, ["CLAIMED", "VERIFIED"]),
    orderBy: desc(companies.updatedAt),
    limit: 100,
  });
  return (
    <div>
      <h1 className="text-3xl font-black">Claimed companies</h1>
      <p className="mt-2 text-ink-2">Grant the Verified badge after checking a company's documents. {rows.length} shown.</p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {rows.length === 0 && <li className="py-6 text-ink-2">No claimed companies yet.</li>}
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold"><Link href={`/company/${c.slug}`} className="hover:underline">{c.name}</Link>
                {c.status === "VERIFIED" && <span className="ml-2 rounded-sm bg-citrus px-1.5 py-0.5 text-xs font-bold text-ink">Verified</span>}</p>
              <p className="text-sm text-ink-2">{countryName(c.country)} · {c.role.toLowerCase()}</p>
            </div>
            <form action={verifyCompanyAction}>
              <input type="hidden" name="companyId" value={c.id} />
              <input type="hidden" name="verify" value={c.status === "VERIFIED" ? "0" : "1"} />
              <button className="rounded-sm border border-line px-3 py-1.5 text-sm font-semibold hover:bg-paper-2">
                {c.status === "VERIFIED" ? "Remove badge" : "Verify"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
