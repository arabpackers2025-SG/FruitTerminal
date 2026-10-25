import Link from "next/link";
import type { Metadata } from "next";
import { listCategories } from "@/lib/queries";
import { getLocale, translator } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products", description: "Fresh produce categories: find exporters and buyers for each." };

export default async function ProductsPage() {
  const [{ byParent }, locale] = await Promise.all([listCategories(), getLocale()]);
  const tr = translator(locale);
  const roots = byParent.get(null) ?? [];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black">{tr("products.title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{tr("products.intro")}</p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {roots.map((r) => (
          <section key={r.id}>
            <h2 className="border-b-2 border-ink pb-1 text-xl font-extrabold">
              <Link href={`/products/${r.slug}`} className="hover:underline">{r.name}</Link>
            </h2>
            <ul className="mt-2">
              {(byParent.get(r.id) ?? []).map((c) => (
                <li key={c.id}>
                  <Link href={`/products/${c.slug}`} className="block py-1 font-medium hover:underline">{c.name}</Link>
                  {(byParent.get(c.id) ?? []).length > 0 && (
                    <ul className="mb-1 ml-4 flex flex-wrap gap-x-3 text-sm text-ink-2">
                      {(byParent.get(c.id) ?? []).map((g) => (
                        <li key={g.id}><Link href={`/products/${g.slug}`} className="hover:underline">{g.name}</Link></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
