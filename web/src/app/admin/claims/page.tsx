import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { claimRequests } from "@/db/schema";
import { decideClaimAction } from "@/lib/actions/company";
import { countryName } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default async function AdminClaims() {
  const rows = await db.query.claimRequests.findMany({
    where: eq(claimRequests.status, "PENDING"),
    orderBy: desc(claimRequests.createdAt),
    with: { company: true, user: true },
  });
  return (
    <div>
      <h1 className="text-3xl font-black">Pending claims</h1>
      {rows.length === 0 ? (
        <p className="mt-4 text-ink-2">Nothing waiting. Claims where the account email matches the company domain are approved automatically.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="tag p-4">
              <p className="font-bold">
                <Link href={`/company/${c.company.slug}`} className="hover:underline">{c.company.name}</Link>
                <span className="font-normal text-ink-2"> · {countryName(c.company.country)}</span>
              </p>
              <p className="mt-1 text-sm text-ink-2">
                Requested by {c.user.name ?? "—"} ({c.user.email}){c.proof ? ` · proof: ${c.proof}` : ""}
              </p>
              <div className="mt-3 flex gap-2">
                <form action={decideClaimAction}><input type="hidden" name="claimId" value={c.id} /><input type="hidden" name="decision" value="approve" />
                  <button className="rounded-sm bg-green px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-deep">Approve</button></form>
                <form action={decideClaimAction}><input type="hidden" name="claimId" value={c.id} /><input type="hidden" name="decision" value="reject" />
                  <button className="rounded-sm border border-line px-4 py-1.5 text-sm hover:bg-paper-2">Reject</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
