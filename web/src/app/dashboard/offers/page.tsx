import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { categoryOptions } from "@/lib/catoptions";
import { OfferForm } from "@/components/lead-forms";
import { closeLeadAction } from "@/lib/actions/leads";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Offers" };

export default async function OffersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.companyId) redirect("/dashboard");
  const [rows, options] = await Promise.all([
    db.query.offers.findMany({ where: eq(offers.companyId, user.companyId), orderBy: desc(offers.createdAt), with: { category: true } }),
    categoryOptions(),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-black">Offers</h1>
      <p className="mt-2 text-ink-2">Post what you have available. Matching buyers see it and can inquire.</p>
      <div className="mt-6"><OfferForm options={options} /></div>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {rows.length === 0 && <li className="py-6 text-ink-2">No offers yet.</li>}
        {rows.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-semibold">{o.title} {o.status !== "ACTIVE" && <span className="text-xs text-stone">({o.status.toLowerCase()})</span>}</p>
              <p className="text-sm text-ink-2">{o.category.name}{o.quantity ? ` · ${o.quantity}` : ""}{o.origin ? ` · ${o.origin}` : ""}</p>
            </div>
            {o.status === "ACTIVE" && (
              <form action={closeLeadAction}><input type="hidden" name="kind" value="offer" /><input type="hidden" name="id" value={o.id} />
                <button className="rounded-sm border border-line px-3 py-1.5 text-sm hover:bg-paper-2">Close</button></form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
