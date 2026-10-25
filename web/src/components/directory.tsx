import { CompanyCard } from "@/components/company-card";
import { EmptyState, FilterBar, Pager } from "@/components/filters";
import { countsByCountry, listCategories, listCompanies, listTerminals } from "@/lib/queries";
import { getLocale, translator } from "@/lib/i18n";

type SP = { [key: string]: string | string[] | undefined };
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export async function Directory({
  role,
  sp,
  base,
  titleKey,
  introKey,
}: {
  role: "BUYER" | "SELLER";
  sp: SP;
  base: string;
  titleKey: string;
  introKey: string;
}) {
  const t = translator(await getLocale());
  const q = str(sp.q), country = str(sp.country), product = str(sp.product), terminal = str(sp.terminal);
  const page = Number(str(sp.page) ?? 1) || 1;

  const [result, countries, cats, terms] = await Promise.all([
    listCompanies({ role, q, country, product, terminal, page }),
    countsByCountry(role),
    listCategories(),
    role === "BUYER" ? listTerminals() : Promise.resolve([]),
  ]);

  const products = cats.all
    .filter((c) => c.parentId === null || cats.byParent.get(c.parentId)?.length)
    .map((c) => ({ value: c.slug, label: c.parentId ? `  ${c.name}` : c.name }));

  const qs = new URLSearchParams();
  if (q) qs.set("q", q); if (country) qs.set("country", country);
  if (product) qs.set("product", product); if (terminal) qs.set("terminal", terminal);
  const pagerBase = qs.toString() ? `${base}?${qs}` : base;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black">{t(titleKey)}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{t(introKey)}</p>
      <div className="mt-6">
        <FilterBar
          action={base} q={q} country={country} countries={countries} product={product} products={products}
          terminal={terminal}
          terminalOptions={role === "BUYER" ? terms.map((t) => ({ value: t.slug, label: `${t.city}: ${t.name}` })) : undefined}
        />
      </div>
      {result.rows.length === 0 ? (
        <EmptyState>
          <p className="font-semibold">{t("empty.noMatch")}</p>
          <p className="mt-1">{t("empty.tryWider")}</p>
        </EmptyState>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.rows.map((c) => <CompanyCard key={c.id} c={c} />)}
        </div>
      )}
      <Pager page={result.page} pageSize={result.pageSize} total={result.total} base={pagerBase} />
    </div>
  );
}
