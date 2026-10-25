import { db } from "@/db";
import { offers, buyRequests, inquiries, companyProducts } from "@/db/schema";
import { and, count, desc, eq, gte, isNull, ne, inArray } from "drizzle-orm";

export type Plan = "FREE" | "SELLER_PRO" | "BUYER_PRO";

export function dailyLimitFor(plan: Plan): number {
  return plan === "FREE" ? 1 : Infinity;
}

function startOfTodayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

export async function sentTodayCount(companyId: string): Promise<number> {
  const [r] = await db
    .select({ n: count() })
    .from(inquiries)
    .where(and(eq(inquiries.fromCompanyId, companyId), gte(inquiries.createdAt, startOfTodayUTC())));
  return r.n;
}

export async function memberDashboard(companyId: string, plan: Plan = "FREE") {
  const [[unreadRow], [sentToday], [activeOffers], [activeRequests]] = await Promise.all([
    db.select({ n: count() }).from(inquiries).where(and(eq(inquiries.toCompanyId, companyId), isNull(inquiries.readAt))),
    sentTodayCount(companyId).then((n) => [{ n }]),
    db.select({ n: count() }).from(offers).where(and(eq(offers.companyId, companyId), eq(offers.status, "ACTIVE"))),
    db.select({ n: count() }).from(buyRequests).where(and(eq(buyRequests.companyId, companyId), eq(buyRequests.status, "ACTIVE"))),
  ]);

  const recentInquiries = await db.query.inquiries.findMany({
    where: eq(inquiries.toCompanyId, companyId),
    orderBy: desc(inquiries.createdAt),
    limit: 5,
    with: { fromCompany: true },
  });

  const myCats = await db
    .select({ id: companyProducts.categoryId })
    .from(companyProducts)
    .where(eq(companyProducts.companyId, companyId));
  const catIds = myCats.map((c) => c.id);

  let matchingLeads: { id: string; kind: "offer" | "request"; title: string; categoryName: string; companyName: string }[] = [];
  if (catIds.length) {
    const [o, r] = await Promise.all([
      db.query.offers.findMany({
        where: and(inArray(offers.categoryId, catIds), eq(offers.status, "ACTIVE"), ne(offers.companyId, companyId)),
        orderBy: desc(offers.createdAt), limit: 4, with: { category: true, company: true },
      }),
      db.query.buyRequests.findMany({
        where: and(inArray(buyRequests.categoryId, catIds), eq(buyRequests.status, "ACTIVE"), ne(buyRequests.companyId, companyId)),
        orderBy: desc(buyRequests.createdAt), limit: 4, with: { category: true, company: true },
      }),
    ]);
    matchingLeads = [
      ...o.map((x) => ({ id: x.id, kind: "offer" as const, title: x.title, categoryName: x.category.name, companyName: x.company.name })),
      ...r.map((x) => ({ id: x.id, kind: "request" as const, title: x.title, categoryName: x.category.name, companyName: x.company.name })),
    ].slice(0, 6);
  }

  // plan is resolved by the caller via the session; limit shown there.
  return {
    unread: unreadRow.n,
    sentToday: sentToday.n,
    dailyLimit: dailyLimitFor(plan),
    activeOffers: activeOffers.n,
    activeRequests: activeRequests.n,
    recentInquiries,
    matchingLeads,
  };
}
