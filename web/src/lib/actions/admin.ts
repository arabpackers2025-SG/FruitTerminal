"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, stagingCompanies, terminals } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { clean } from "@/lib/validate";
import { slugify } from "@/lib/slug";

async function requireAdmin() {
  const u = await getSessionUser();
  if (u?.role !== "ADMIN") redirect("/login");
  return u;
}
async function uniqueSlug(base: string) {
  let slug = slugify(base) || "company";
  const root = slug; let i = 2;
  while (await db.query.companies.findFirst({ where: eq(companies.slug, slug) })) slug = `${root}-${i++}`;
  return slug;
}

export async function reviewStagingAction(form: FormData) {
  await requireAdmin();
  const id = clean(form.get("id"));
  const decision = clean(form.get("decision"));
  const row = await db.query.stagingCompanies.findFirst({ where: eq(stagingCompanies.id, id) });
  if (!row) redirect("/admin/staging");

  if (decision === "approve") {
    const terminal = row.terminalSlug
      ? await db.query.terminals.findFirst({ where: eq(terminals.slug, row.terminalSlug) })
      : null;
    const existing = row.sourceUrl
      ? await db.query.companies.findFirst({ where: eq(companies.sourceUrl, row.sourceUrl) })
      : null;
    const raw = (row.raw ?? {}) as { description?: string };
    const values = {
      name: row.name, role: "BUYER" as const,
      country: row.country ?? terminal?.country ?? "XX",
      city: row.city ?? terminal?.city ?? null,
      address: row.address, website: row.website, phone: row.phone, email: row.email,
      stall: row.stall,
      description: raw.description ?? (row.products ? `Products: ${row.products}` : null),
      source: row.source, sourceUrl: row.sourceUrl, scrapedAt: row.scrapedAt,
      terminalId: terminal?.id ?? null,
    };
    if (existing && existing.status === "UNCLAIMED") {
      await db.update(companies).set(values).where(eq(companies.id, existing.id));
    } else if (!existing) {
      await db.insert(companies).values({ ...values, slug: await uniqueSlug(row.name) });
    }
    await db.update(stagingCompanies).set({ review: "APPROVED" }).where(eq(stagingCompanies.id, id));
  } else {
    await db.update(stagingCompanies).set({ review: "REJECTED" }).where(eq(stagingCompanies.id, id));
  }
  revalidatePath("/admin/staging");
  redirect("/admin/staging");
}
