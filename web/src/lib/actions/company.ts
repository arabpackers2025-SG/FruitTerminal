"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, claimRequests, profiles, subscriptions, users, companyProducts } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { clean, domainOf, isEmail } from "@/lib/validate";
import { slugify } from "@/lib/slug";
import { notifyClaimDecision } from "@/lib/email";

async function uniqueSlug(base: string) {
  let slug = slugify(base) || "company";
  const root = slug;
  let i = 2;
  while (await db.query.companies.findFirst({ where: eq(companies.slug, slug) })) slug = `${root}-${i++}`;
  return slug;
}

export type FormState = { error?: string; ok?: string };

/** Claim an existing unclaimed listing. Auto-approves when the member's email domain
    matches the company's website domain; otherwise it waits for admin review. */
export async function claimCompanyAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.companyId) return { error: "Your account is already linked to a company." };

  const companyId = clean(form.get("companyId"));
  const note = clean(form.get("note"));
  const company = await db.query.companies.findFirst({ where: eq(companies.id, companyId) });
  if (!company) return { error: "That company no longer exists." };
  if (company.status === "CLAIMED" || company.status === "VERIFIED") {
    return { error: "This company has already been claimed. Contact us if that's a mistake." };
  }

  const emailDomain = domainOf(user!.email);
  const siteDomain = domainOf(company.website) || domainOf(company.email);
  const autoApprove = !!emailDomain && !!siteDomain && emailDomain === siteDomain;

  await db.insert(claimRequests).values({
    companyId,
    userId: user!.id,
    proof: note || (autoApprove ? `email domain matches ${siteDomain}` : null),
    status: autoApprove ? "APPROVED" : "PENDING",
  });

  if (autoApprove) {
    await db.update(companies).set({ status: "CLAIMED" }).where(eq(companies.id, companyId));
    await db.update(users).set({ companyId }).where(eq(users.id, user!.id));
    await db.insert(subscriptions).values({ companyId }).onConflictDoNothing();
    redirect("/dashboard?claimed=1");
  }
  return { ok: "Claim submitted. We'll review it and email you, usually within a day." };
}

/** Create a brand-new company listing; the creator becomes its owner immediately. */
export async function createCompanyAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.companyId) return { error: "Your account is already linked to a company." };

  const name = clean(form.get("name"));
  const role = clean(form.get("role")) as "BUYER" | "SELLER" | "BOTH";
  const country = clean(form.get("country")).toUpperCase();
  const city = clean(form.get("city"));
  const website = clean(form.get("website"));
  const email = clean(form.get("email"));
  const description = clean(form.get("description"));
  if (!name) return { error: "Enter your company name." };
  if (!/^[A-Z]{2}$/.test(country)) return { error: "Enter a 2-letter country code (e.g. EG, CA)." };
  if (!["BUYER", "SELLER", "BOTH"].includes(role)) return { error: "Choose whether you buy, sell, or both." };
  if (email && !isEmail(email)) return { error: "Enter a valid company email, or leave it blank." };

  const [c] = await db
    .insert(companies)
    .values({
      slug: await uniqueSlug(name),
      name, role, country,
      city: city || null,
      website: website || null,
      email: email || null,
      description: description || null,
      status: "CLAIMED",
      source: "self-registered",
    })
    .returning({ id: companies.id });
  await db.insert(profiles).values({ companyId: c.id }).onConflictDoNothing();
  await db.insert(subscriptions).values({ companyId: c.id }).onConflictDoNothing();
  await db.update(users).set({ companyId: c.id }).where(eq(users.id, user!.id));
  redirect("/dashboard");
}

/** Edit the owner's own company details and profile. */
export async function updateCompanyAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const cid = user!.companyId!;

  const name = clean(form.get("name"));
  if (!name) return { error: "Company name can't be empty." };
  const website = clean(form.get("website"));
  const email = clean(form.get("email"));
  if (email && !isEmail(email)) return { error: "Enter a valid email, or leave it blank." };

  await db.update(companies).set({
    name,
    role: (clean(form.get("role")) as "BUYER" | "SELLER" | "BOTH") || "BUYER",
    country: clean(form.get("country")).toUpperCase() || user!.company!.country,
    city: clean(form.get("city")) || null,
    address: clean(form.get("address")) || null,
    website: website || null,
    email: email || null,
    phone: clean(form.get("phone")) || null,
    description: clean(form.get("description")) || null,
  }).where(eq(companies.id, cid));

  const list = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);
  await db
    .insert(profiles)
    .values({
      companyId: cid,
      certifications: list(clean(form.get("certifications"))),
      exportMarkets: list(clean(form.get("exportMarkets"))),
      packingDetails: clean(form.get("packingDetails")) || null,
      capacity: clean(form.get("capacity")) || null,
      yearFounded: Number(clean(form.get("yearFounded"))) || null,
    })
    .onConflictDoUpdate({
      target: profiles.companyId,
      set: {
        certifications: list(clean(form.get("certifications"))),
        exportMarkets: list(clean(form.get("exportMarkets"))),
        packingDetails: clean(form.get("packingDetails")) || null,
        capacity: clean(form.get("capacity")) || null,
        yearFounded: Number(clean(form.get("yearFounded"))) || null,
      },
    });

  revalidatePath(`/company/${user!.company!.slug}`);
  revalidatePath("/dashboard/profile");
  return { ok: "Saved." };
}

/** Replace the set of products the company sells/buys (category slugs, comma-separated). */
export async function setProductsAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const cid = user!.companyId!;
  const direction = (clean(form.get("direction")) as "SELLS" | "BUYS") || "SELLS";
  const slugs = form.getAll("categories").map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);

  const cats = slugs.length
    ? await db.query.productCategories.findMany({
        where: (c, { inArray: within }) => within(c.slug, slugs),
      })
    : [];
  await db.delete(companyProducts).where(and(eq(companyProducts.companyId, cid), eq(companyProducts.direction, direction)));
  if (cats.length) {
    await db.insert(companyProducts).values(cats.map((c) => ({ companyId: cid, categoryId: c.id, direction })))
      .onConflictDoNothing();
  }
  revalidatePath("/dashboard/profile");
  return { ok: "Products updated." };
}

/** Admin: approve or reject a pending claim. */
export async function decideClaimAction(form: FormData) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const claimId = clean(form.get("claimId"));
  const decision = clean(form.get("decision"));
  const claim = await db.query.claimRequests.findFirst({ where: eq(claimRequests.id, claimId) });
  if (!claim || claim.status !== "PENDING") redirect("/admin/claims");

  const claimant = await db.query.users.findFirst({ where: eq(users.id, claim.userId) });
  const company = await db.query.companies.findFirst({ where: eq(companies.id, claim.companyId) });
  if (decision === "approve") {
    await db.update(claimRequests).set({ status: "APPROVED" }).where(eq(claimRequests.id, claimId));
    await db.update(companies).set({ status: "CLAIMED" }).where(eq(companies.id, claim.companyId));
    await db.update(users).set({ companyId: claim.companyId }).where(eq(users.id, claim.userId));
    await db.insert(subscriptions).values({ companyId: claim.companyId }).onConflictDoNothing();
  } else {
    await db.update(claimRequests).set({ status: "REJECTED" }).where(eq(claimRequests.id, claimId));
  }
  if (claimant?.email && company) {
    await notifyClaimDecision({ email: claimant.email, companyName: company.name, approved: decision === "approve" });
  }
  revalidatePath("/admin/claims");
  redirect("/admin/claims");
}
