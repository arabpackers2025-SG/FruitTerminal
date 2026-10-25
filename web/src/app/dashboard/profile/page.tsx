import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, companyProducts } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { listCategories } from "@/lib/queries";
import { ProfileEditor } from "@/components/profile-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My listing" };

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.companyId) redirect("/dashboard");

  const [company, products, cats] = await Promise.all([
    db.query.companies.findFirst({ where: eq(companies.id, user.companyId), with: { profile: true } }),
    db.query.companyProducts.findMany({ where: eq(companyProducts.companyId, user.companyId), with: { category: true } }),
    listCategories(),
  ]);
  if (!company) redirect("/dashboard");

  const roots = (cats.byParent.get(null) ?? []).map((r) => ({
    slug: r.slug, name: r.name,
    children: (cats.byParent.get(r.id) ?? []).map((c) => ({
      slug: c.slug, name: c.name,
      children: (cats.byParent.get(c.id) ?? []).map((g) => ({ slug: g.slug, name: g.name })),
    })),
  }));
  const sells = products.filter((p) => p.direction === "SELLS").map((p) => p.category.slug);
  const buys = products.filter((p) => p.direction === "BUYS").map((p) => p.category.slug);

  return (
    <div>
      <h1 className="text-3xl font-black">My listing</h1>
      <p className="mt-2 text-ink-2">This is what buyers and sellers see on your public page.</p>
      <div className="mt-6">
        <ProfileEditor
          company={company}
          profile={company.profile ?? null}
          roots={roots}
          sells={sells}
          buys={buys}
        />
      </div>
    </div>
  );
}
