/* Admin review of scraped rows.
   npm run staging:list                 show pending rows
   npm run staging:approve -- all       approve every pending row
   npm run staging:approve -- <id> ...  approve selected rows
   npm run staging:reject  -- <id> ...  reject selected rows
   Approving upserts into `companies` as UNCLAIMED buyers linked to the terminal. */
import "dotenv/config";
import { db } from "./index";
import { companies, stagingCompanies, terminals } from "./schema";
import { eq, inArray } from "drizzle-orm";
import { slugify } from "../lib/slug";

async function uniqueSlug(base: string) {
  let slug = slugify(base) || "company";
  let i = 2;
  while (await db.query.companies.findFirst({ where: eq(companies.slug, slug) })) {
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

async function approve(ids: string[] | "all") {
  const rows = await db.query.stagingCompanies.findMany({
    where: ids === "all" ? eq(stagingCompanies.review, "PENDING") : inArray(stagingCompanies.id, ids),
  });
  let n = 0;
  for (const r of rows) {
    const terminal = r.terminalSlug
      ? await db.query.terminals.findFirst({ where: eq(terminals.slug, r.terminalSlug) })
      : null;
    const existing = await db.query.companies.findFirst({ where: eq(companies.sourceUrl, r.sourceUrl ?? "") });
    const raw = (r.raw ?? {}) as { description?: string };
    const values = {
      name: r.name,
      role: "BUYER" as const,
      country: r.country ?? terminal?.country ?? "XX",
      city: r.city ?? terminal?.city ?? null,
      address: r.address,
      website: r.website,
      phone: r.phone,
      email: r.email,
      stall: r.stall,
      description: raw.description ?? (r.products ? `Products: ${r.products}` : null),
      source: r.source,
      sourceUrl: r.sourceUrl,
      scrapedAt: r.scrapedAt,
      terminalId: terminal?.id ?? null,
    };
    if (existing && existing.status === "UNCLAIMED") {
      await db.update(companies).set(values).where(eq(companies.id, existing.id));
    } else if (!existing) {
      await db.insert(companies).values({ ...values, slug: await uniqueSlug(r.name) });
    } // claimed companies are never overwritten by the scraper
    await db.update(stagingCompanies).set({ review: "APPROVED" }).where(eq(stagingCompanies.id, r.id));
    n++;
  }
  console.log(`${n} rows approved into companies.`);
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "list") {
    const rows = await db.query.stagingCompanies.findMany({ where: eq(stagingCompanies.review, "PENDING") });
    for (const r of rows) console.log(`${r.id}  ${r.terminalSlug ?? "-"}  ${r.name}  ${r.phone ?? ""}  ${r.website ?? ""}`);
    console.log(`${rows.length} pending`);
  } else if (cmd === "approve") {
    await approve(args[0] === "all" ? "all" : args);
  } else if (cmd === "reject") {
    await db.update(stagingCompanies).set({ review: "REJECTED" }).where(inArray(stagingCompanies.id, args));
    console.log(`${args.length} rows rejected.`);
  } else {
    console.log("usage: list | approve all|<id...> | reject <id...>");
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
