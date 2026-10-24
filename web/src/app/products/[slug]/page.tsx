import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CompanyCard } from "@/components/company-card";
import { getCategory, listCompanies } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return {};
  return { title: `${cat.name}: exporters and buyers`, description: `Exporters, growers and importers of ${cat.name.toLowerCase()}.` };
}

export default async function CategoryPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();
  const [sellers, buyers] = await Promise.all([
    listCompanies({ role: "SELLER", product: slug, pageSize: 12 }),
    listCompanies({ role: "BUYER", product: slug, pageSize: 12 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-ink-2">
        <Link href="/products" className="hover:underline">Products</Link>
        {cat.parent && <> / <Link href={`/products/${cat.parent.slug}`} className="hover:underline">{cat.parent.name}</Link></>}
      </p>
      <h1 className="mt-2 text-4xl font-black">{cat.name}</h1>
      {cat.children.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {cat.children.map((c) => (
            <li key={c.id}><Link href={`/products/${c.slug}`} className="rounded-sm bg-paper-2 px-2 py-1 text-sm font-medium hover:bg-line">{c.name}</Link></li>
          ))}
        </ul>
      )}

      <section className="mt-10">
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
          <h2 className="text-2xl font-extrabold">Exporters of {cat.name.toLowerCase()}</h2>
          <Link href={`/exporters?product=${slug}`} className="text-sm font-semibold text-green hover:underline">All {sellers.total}</Link>
        </div>
        {sellers.rows.length === 0 ? <p className="mt-4 text-ink-2">No exporters listed for this product yet.</p> : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{sellers.rows.map((c) => <CompanyCard key={c.id} c={c} />)}</div>
        )}
      </section>
      <section className="mt-12">
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
          <h2 className="text-2xl font-extrabold">Buyers of {cat.name.toLowerCase()}</h2>
          <Link href={`/buyers?product=${slug}`} className="text-sm font-semibold text-green hover:underline">All {buyers.total}</Link>
        </div>
        {buyers.rows.length === 0 ? <p className="mt-4 text-ink-2">No buyers listed for this product yet.</p> : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{buyers.rows.map((c) => <CompanyCard key={c.id} c={c} />)}</div>
        )}
      </section>
    </div>
  );
}
