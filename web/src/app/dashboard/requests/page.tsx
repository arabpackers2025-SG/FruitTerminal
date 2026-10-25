import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { buyRequests } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { categoryOptions } from "@/lib/catoptions";
import { RequestForm } from "@/components/lead-forms";
import { closeLeadAction } from "@/lib/actions/leads";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Buy requests" };

export default async function RequestsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.companyId) redirect("/dashboard");
  const [rows, options] = await Promise.all([
    db.query.buyRequests.findMany({ where: eq(buyRequests.companyId, user.companyId), orderBy: desc(buyRequests.createdAt), with: { category: true } }),
    categoryOptions(),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-black">Buy requests</h1>
      <p className="mt-2 text-ink-2">Tell the market what you need. Matching exporters see it and can inquire.</p>
      <div className="mt-6"><RequestForm options={options} /></div>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {rows.length === 0 && <li className="py-6 text-ink-2">No buy requests yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold">{r.title} {r.status !== "ACTIVE" && <span className="text-xs text-stone">({r.status.toLowerCase()})</span>}</p>
              <p className="text-sm text-ink-2">{r.category.name}{r.quantity ? ` · ${r.quantity}` : ""}{r.destination ? ` · ${r.destination}` : ""}</p>
            </div>
            {r.status === "ACTIVE" && (
              <form action={closeLeadAction}><input type="hidden" name="kind" value="request" /><input type="hidden" name="id" value={r.id} />
                <button className="rounded-sm border border-line px-3 py-1.5 text-sm hover:bg-paper-2">Close</button></form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
