import { db } from "@/db";
import { companies, terminals, productCategories, offers, buyRequests } from "@/db/schema";
import { countryName } from "@/lib/countries";
import { and, asc, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

export type CompanyFilter = {
  q?: string;
  country?: string;
  terminal?: string;
  product?: string;
  role?: "BUYER" | "SELLER";
  page?: number;
  pageSize?: number;
};

export async function listTerminals() {
  const rows = await db
    .select({
      id: terminals.id,
      slug: terminals.slug,
      name: terminals.name,
      city: terminals.city,
      country: terminals.country,
      companyCount: count(companies.id),
    })
    .from(terminals)
    .leftJoin(companies, eq(companies.terminalId, terminals.id))
    .groupBy(terminals.id)
    .orderBy(asc(terminals.city));
  return rows.sort((a, b) => countryName(a.country).localeCompare(countryName(b.country)));
}

export async function getTerminal(slug: string) {
  const t = await db.query.terminals.findFirst({ where: eq(terminals.slug, slug) });
  if (!t) return null;
  const members = await db.query.companies.findMany({
    where: eq(companies.terminalId, t.id),
    orderBy: [desc(companies.status), asc(companies.name)],
    with: { products: { with: { category: true } } },
  });
  return { ...t, members };
}

export async function listCompanies(f: CompanyFilter) {
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(60, f.pageSize ?? 24);
  const where: SQL[] = [];

  if (f.role === "BUYER") where.push(inArray(companies.role, ["BUYER", "BOTH"]));
  if (f.role === "SELLER") where.push(inArray(companies.role, ["SELLER", "BOTH"]));
  if (f.country) where.push(eq(companies.country, f.country.toUpperCase()));
  if (f.q) {
    const like = `%${f.q.trim()}%`;
    where.push(or(ilike(companies.name, like), ilike(companies.description, like), ilike(companies.city, like))!);
  }
  if (f.terminal) {
    where.push(
      sql`${companies.terminalId} in (select id from terminals where slug = ${f.terminal})`,
    );
  }
  if (f.product) {
    where.push(
      sql`${companies.id} in (
        select cp.company_id from company_products cp
        join product_categories c on c.id = cp.category_id
        where c.slug = ${f.product}
           or c.parent_id in (select id from product_categories where slug = ${f.product})
           or c.parent_id in (select id from product_categories where parent_id in (select id from product_categories where slug = ${f.product}))
      )`,
    );
  }

  const cond = where.length ? and(...where) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(companies).where(cond);
  const rows = await db.query.companies.findMany({
    where: cond,
    orderBy: [desc(companies.status), asc(companies.name)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: { terminal: true, products: { with: { category: true } } },
  });
  return { rows, total, page, pageSize };
}

export async function getCompany(slug: string) {
  return db.query.companies.findFirst({
    where: eq(companies.slug, slug),
    with: {
      terminal: true,
      profile: true,
      products: { with: { category: true } },
      offers: { where: eq(offers.status, "ACTIVE"), with: { category: true }, limit: 10 },
      requests: { where: eq(buyRequests.status, "ACTIVE"), with: { category: true }, limit: 10 },
    },
  });
}

export async function listCategories() {
  const all = await db.query.productCategories.findMany({ orderBy: asc(productCategories.name) });
  const byParent = new Map<string | null, typeof all>();
  for (const c of all) {
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }
  return { all, byParent };
}

export async function getCategory(slug: string) {
  const cat = await db.query.productCategories.findFirst({
    where: eq(productCategories.slug, slug),
    with: { children: true, parent: true },
  });
  return cat ?? null;
}

export async function countsByCountry(role: "BUYER" | "SELLER") {
  const roles: ("BUYER" | "SELLER" | "BOTH")[] = [role, "BOTH"];
  return db
    .select({ country: companies.country, n: count() })
    .from(companies)
    .where(inArray(companies.role, roles))
    .groupBy(companies.country)
    .orderBy(desc(count()));
}

export async function homeStats() {
  const [t] = await db.select({ n: count() }).from(terminals);
  const [b] = await db.select({ n: count() }).from(companies).where(inArray(companies.role, ["BUYER", "BOTH"]));
  const [s] = await db.select({ n: count() }).from(companies).where(inArray(companies.role, ["SELLER", "BOTH"]));
  return { terminals: t.n, buyers: b.n, sellers: s.n };
}

export async function latestLeads() {
  const o = await db.query.offers.findMany({
    where: eq(offers.status, "ACTIVE"),
    orderBy: desc(offers.createdAt),
    limit: 6,
    with: { company: true, category: true },
  });
  const r = await db.query.buyRequests.findMany({
    where: eq(buyRequests.status, "ACTIVE"),
    orderBy: desc(buyRequests.createdAt),
    limit: 6,
    with: { company: true, category: true },
  });
  return { offers: o, requests: r };
}
