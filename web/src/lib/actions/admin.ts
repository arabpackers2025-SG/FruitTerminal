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

export async function verifyCompanyAction(form: FormData) {
  await requireAdmin();
  const id = clean(form.get("companyId"));
  const verify = clean(form.get("verify")) === "1";
  await db.update(companies).set({ status: verify ? "VERIFIED" : "CLAIMED" }).where(eq(companies.id, id));
  revalidatePath("/admin/companies");
  redirect("/admin/companies");
}

export type ImportState = { error?: string; ok?: string };

/** Parse a single CSV line, honoring double-quoted fields. */
function parseCsvLine(line: string): string[] {
  const out: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Admin bulk import of companies from CSV into staging for review.
    Columns (header row, any order): name, website, phone, email, country, city, products, terminalSlug. */
export async function importCsvAction(_prev: ImportState, form: FormData): Promise<ImportState> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file." };
  const text = (await file.text()).replace(/\r\n/g, "\n").trim();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { error: "The file has no data rows." };

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  if (idx("name") === -1) return { error: 'The CSV needs a "name" column.' };
  const source = `csv:${new Date().toISOString().slice(0, 10)}`;

  const rows = [];
  for (const line of lines.slice(1)) {
    const c = parseCsvLine(line);
    const get = (k: string) => { const i = idx(k); return i >= 0 ? (c[i] || null) : null; };
    const name = get("name");
    if (!name) continue;
    rows.push({
      name,
      website: get("website"), phone: get("phone"), email: get("email"),
      country: (get("country") || "")?.toUpperCase() || null,
      city: get("city"), products: get("products"),
      terminalSlug: get("terminalslug") || get("terminal"),
      source, sourceUrl: null, review: "PENDING" as const,
    });
  }
  if (!rows.length) return { error: "No valid rows found (each row needs a name)." };

  let n = 0;
  for (const r of rows) {
    await db.insert(stagingCompanies).values(r).onConflictDoUpdate({
      target: [stagingCompanies.source, stagingCompanies.name],
      set: { website: r.website, phone: r.phone, email: r.email, country: r.country, city: r.city, products: r.products, terminalSlug: r.terminalSlug },
    });
    n++;
  }
  revalidatePath("/admin/staging");
  return { ok: `Imported ${n} row${n === 1 ? "" : "s"} into review. Approve them under “Scraped review”.` };
}
