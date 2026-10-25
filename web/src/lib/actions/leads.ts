"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { offers, buyRequests, inquiries, companies, productCategories } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { clean } from "@/lib/validate";
import { dailyLimitFor, sentTodayCount } from "@/lib/member";
import { notifyInquiry } from "@/lib/email";

export type LeadState = { error?: string; ok?: string };

async function categoryIdFromSlug(slug: string) {
  if (!slug) return null;
  const c = await db.query.productCategories.findFirst({ where: eq(productCategories.slug, slug) });
  return c?.id ?? null;
}

export async function createOfferAction(_prev: LeadState, form: FormData): Promise<LeadState> {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const title = clean(form.get("title"));
  const categoryId = await categoryIdFromSlug(clean(form.get("category")));
  if (!title) return { error: "Give the offer a title." };
  if (!categoryId) return { error: "Pick a product category." };
  await db.insert(offers).values({
    companyId: user!.companyId!, categoryId, title,
    quantity: clean(form.get("quantity")) || null,
    origin: clean(form.get("origin")) || null,
    priceTerms: clean(form.get("priceTerms")) || null,
    details: clean(form.get("details")) || null,
  });
  revalidatePath("/dashboard/offers");
  revalidatePath("/offers");
  return { ok: "Offer posted." };
}

export async function createRequestAction(_prev: LeadState, form: FormData): Promise<LeadState> {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const title = clean(form.get("title"));
  const categoryId = await categoryIdFromSlug(clean(form.get("category")));
  if (!title) return { error: "Give the request a title." };
  if (!categoryId) return { error: "Pick a product category." };
  await db.insert(buyRequests).values({
    companyId: user!.companyId!, categoryId, title,
    quantity: clean(form.get("quantity")) || null,
    destination: clean(form.get("destination")) || null,
    details: clean(form.get("details")) || null,
  });
  revalidatePath("/dashboard/requests");
  revalidatePath("/requests");
  return { ok: "Buy request posted." };
}

export async function closeLeadAction(form: FormData) {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const kind = clean(form.get("kind"));
  const id = clean(form.get("id"));
  if (kind === "offer") {
    await db.update(offers).set({ status: "CLOSED" }).where(and(eq(offers.id, id), eq(offers.companyId, user!.companyId!)));
    revalidatePath("/dashboard/offers");
  } else {
    await db.update(buyRequests).set({ status: "CLOSED" }).where(and(eq(buyRequests.id, id), eq(buyRequests.companyId, user!.companyId!)));
    revalidatePath("/dashboard/requests");
  }
}

export async function sendInquiryAction(_prev: LeadState, form: FormData): Promise<LeadState> {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const toCompanyId = clean(form.get("toCompanyId"));
  const message = clean(form.get("message"));
  if (toCompanyId === user!.companyId) return { error: "That's your own company." };
  if (message.length < 5) return { error: "Write a short message first." };

  const target = await db.query.companies.findFirst({ where: eq(companies.id, toCompanyId) });
  if (!target) return { error: "That company no longer exists." };

  const limit = dailyLimitFor(user!.plan);
  if (limit !== Infinity) {
    const sent = await sentTodayCount(user!.companyId!);
    if (sent >= limit) {
      return { error: `Free accounts can send ${limit} inquiry a day. Upgrade for unlimited, or try again tomorrow.` };
    }
  }

  const [row] = await db.insert(inquiries).values({
    fromCompanyId: user!.companyId!,
    toCompanyId,
    offerId: clean(form.get("offerId")) || null,
    requestId: clean(form.get("requestId")) || null,
    message,
  }).returning({ id: inquiries.id });

  await notifyInquiry({ inquiryId: row.id, fromName: user!.company!.name, toCompanyId, message });
  return { ok: "Inquiry sent. The company can see your details and reply by email." };
}

export async function markInquiryReadAction(form: FormData) {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const id = clean(form.get("id"));
  await db.update(inquiries).set({ readAt: new Date() })
    .where(and(eq(inquiries.id, id), eq(inquiries.toCompanyId, user!.companyId!)));
  revalidatePath("/dashboard/inbox");
}
