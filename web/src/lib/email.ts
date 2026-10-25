import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "@/db/schema";

const FROM = process.env.EMAIL_FROM || "Fruit Terminal <notifications@saguenygroup.com>";
const SITE = process.env.SITE_URL || "https://ft.saguenygroup.com";

/** Sends through Resend when RESEND_API_KEY is set; otherwise logs and returns.
    Never throws — a notification failure must not break the user's action. */
async function send(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) {
    console.log(`[email:skipped] to=${to || "?"} subject=${subject}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, text }),
    });
    if (!res.ok) console.error(`[email:failed] ${res.status} ${await res.text()}`);
  } catch (e) {
    console.error("[email:error]", e);
  }
}

export async function notifyInquiry(p: { inquiryId: string; fromName: string; toCompanyId: string; message: string }) {
  const target = await db.query.companies.findFirst({ where: eq(companies.id, p.toCompanyId) });
  if (!target?.email) return;
  await send(
    target.email,
    `New inquiry on Fruit Terminal from ${p.fromName}`,
    `${p.fromName} sent you an inquiry:\n\n"${p.message}"\n\nSign in to reply: ${SITE}/dashboard/inbox`,
  );
}

export async function notifyClaimDecision(p: { email: string; companyName: string; approved: boolean }) {
  await send(
    p.email,
    `Your Fruit Terminal claim for ${p.companyName}`,
    p.approved
      ? `Your claim for ${p.companyName} was approved. Manage your listing: ${SITE}/dashboard`
      : `We couldn't verify your claim for ${p.companyName}. Reply with proof you work there and we'll take another look.`,
  );
}

export async function notifyMatchingMembers(p: {
  categoryId: string;
  kind: "offer" | "request";
  title: string;
  excludeCompanyId: string;
}) {
  const { and, eq, ne, inArray } = await import("drizzle-orm");
  const { companyProducts, subscriptions, companies: comps } = await import("@/db/schema");
  // An offer (someone selling) alerts buyers of that category; a request alerts sellers.
  const wantDirection = p.kind === "offer" ? "BUYS" : "SELLS";
  const rows = await db
    .select({ email: comps.email, name: comps.name })
    .from(companyProducts)
    .innerJoin(comps, eq(comps.id, companyProducts.companyId))
    .innerJoin(subscriptions, eq(subscriptions.companyId, comps.id))
    .where(
      and(
        eq(companyProducts.categoryId, p.categoryId),
        eq(companyProducts.direction, wantDirection),
        ne(comps.id, p.excludeCompanyId),
        eq(subscriptions.status, "ACTIVE"),
        inArray(subscriptions.plan, ["SELLER_PRO", "BUYER_PRO"]),
      ),
    )
    .limit(50);
  const subject = p.kind === "offer" ? `New offer on Fruit Terminal: ${p.title}` : `New buy request on Fruit Terminal: ${p.title}`;
  for (const r of rows) {
    if (r.email) await send(r.email, subject, `A new ${p.kind} matches products you trade: "${p.title}".\n\nBrowse it: ${SITE}/${p.kind === "offer" ? "offers" : "requests"}`);
  }
}
