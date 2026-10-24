import type { MetadataRoute } from "next";
import { db } from "@/db";
import { companies, productCategories, terminals } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "https://fruitterminal.com";
  const [t, c, p] = await Promise.all([
    db.select({ slug: terminals.slug, u: terminals.updatedAt }).from(terminals),
    db.select({ slug: companies.slug, u: companies.updatedAt }).from(companies),
    db.select({ slug: productCategories.slug }).from(productCategories),
  ]);
  return [
    { url: base, priority: 1 },
    ...["/terminals", "/buyers", "/exporters", "/products", "/pricing", "/about"].map((u) => ({ url: base + u, priority: 0.8 })),
    ...t.map((x) => ({ url: `${base}/terminals/${x.slug}`, lastModified: x.u, priority: 0.9 })),
    ...c.map((x) => ({ url: `${base}/company/${x.slug}`, lastModified: x.u, priority: 0.6 })),
    ...p.map((x) => ({ url: `${base}/products/${x.slug}`, priority: 0.7 })),
  ];
}
