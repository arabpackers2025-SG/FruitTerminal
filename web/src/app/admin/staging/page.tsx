import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { stagingCompanies } from "@/db/schema";
import { reviewStagingAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminStaging() {
  const rows = await db.query.stagingCompanies.findMany({
    where: eq(stagingCompanies.review, "PENDING"),
    orderBy: desc(stagingCompanies.scrapedAt),
    limit: 100,
  });
  return (
    <div>
      <h1 className="text-3xl font-black">Scraped companies to review</h1>
      <p className="mt-2 text-ink-2">Approving adds the company as an Unclaimed listing. {rows.length} pending.</p>
      <ul className="mt-6 space-y-3">
        {rows.length === 0 && <li className="text-ink-2">Nothing waiting.</li>}
        {rows.map((r) => (
          <li key={r.id} className="tag p-4">
            <p className="font-bold">{r.name} <span className="font-normal text-ink-2">· {r.terminalSlug ?? r.source}</span></p>
            <p className="mt-1 text-sm text-ink-2">
              {[r.website, r.phone, r.email, r.city, r.country].filter(Boolean).join(" · ") || "no contact details"}
              {r.products ? ` · ${r.products.slice(0, 120)}` : ""}
            </p>
            <div className="mt-3 flex gap-2">
              <form action={reviewStagingAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="approve" />
                <button className="rounded-sm bg-green px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-deep">Approve</button></form>
              <form action={reviewStagingAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="reject" />
                <button className="rounded-sm border border-line px-4 py-1.5 text-sm hover:bg-paper-2">Reject</button></form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
