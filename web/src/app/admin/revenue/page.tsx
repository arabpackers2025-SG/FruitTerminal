import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export const dynamic = "force-dynamic";
const PRICE = { SELLER_PRO: 49, BUYER_PRO: 29 } as const;

export default async function AdminRevenue() {
  const [[seller], [buyer], [pastDue]] = await Promise.all([
    db.select({ n: count() }).from(subscriptions).where(and(eq(subscriptions.plan, "SELLER_PRO"), eq(subscriptions.status, "ACTIVE"))),
    db.select({ n: count() }).from(subscriptions).where(and(eq(subscriptions.plan, "BUYER_PRO"), eq(subscriptions.status, "ACTIVE"))),
    db.select({ n: count() }).from(subscriptions).where(eq(subscriptions.status, "PAST_DUE")),
  ]);
  const mrr = seller.n * PRICE.SELLER_PRO + buyer.n * PRICE.BUYER_PRO;
  return (
    <div>
      <h1 className="text-3xl font-black">Revenue</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Seller Pro", seller.n],
          ["Buyer Pro", buyer.n],
          ["Past due", pastDue.n],
          ["Est. MRR (USD)", `$${mrr.toLocaleString()}`],
        ].map(([l, v]) => (
          <div key={l as string} className="tag p-4"><div className="text-sm text-ink-2">{l}</div><div className="text-2xl font-black tabular-nums">{v}</div></div>
        ))}
      </div>
      <p className="mt-4 text-sm text-stone">Active paid subscriptions. MRR is a straight-line estimate at list prices.</p>
    </div>
  );
}
