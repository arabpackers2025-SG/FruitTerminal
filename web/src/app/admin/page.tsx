import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { claimRequests, stagingCompanies, companies } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [[claims], [staging], [comps]] = await Promise.all([
    db.select({ n: count() }).from(claimRequests).where(eq(claimRequests.status, "PENDING")),
    db.select({ n: count() }).from(stagingCompanies).where(eq(stagingCompanies.review, "PENDING")),
    db.select({ n: count() }).from(companies),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-black">Admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/claims" className="tag p-5 hover:bg-paper-2"><div className="text-sm text-ink-2">Pending claims</div><div className="text-3xl font-black tabular-nums">{claims.n}</div></Link>
        <Link href="/admin/staging" className="tag p-5 hover:bg-paper-2"><div className="text-sm text-ink-2">Scraped rows to review</div><div className="text-3xl font-black tabular-nums">{staging.n}</div></Link>
        <div className="tag p-5"><div className="text-sm text-ink-2">Companies live</div><div className="text-3xl font-black tabular-nums">{comps.n}</div></div>
      </div>
    </div>
  );
}
