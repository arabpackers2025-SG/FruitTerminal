import { countryName, flag } from "@/lib/countries";
import { getLocale, translator } from "@/lib/i18n";

type Opt = { value: string; label: string };

export async function FilterBar({
  action,
  q,
  country,
  countries,
  product,
  products,
  terminal,
  terminalOptions,
}: {
  action: string;
  q?: string;
  country?: string;
  countries: { country: string; n: number }[];
  product?: string;
  products: Opt[];
  terminal?: string;
  terminalOptions?: Opt[];
}) {
  const t = translator(await getLocale());
  const sel = "rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink focus:border-green";
  return (
    <form action={action} method="get" className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={t("filter.search")}
        className={sel}
        aria-label={t("home.search")}
      />
      <select name="country" defaultValue={country ?? ""} className={sel} aria-label={t("filter.allCountries")}>
        <option value="">{t("filter.allCountries")}</option>
        {countries.map((c) => (
          <option key={c.country} value={c.country}>
            {flag(c.country)} {countryName(c.country)} ({c.n})
          </option>
        ))}
      </select>
      <select name="product" defaultValue={product ?? ""} className={sel} aria-label={t("filter.allProducts")}>
        <option value="">{t("filter.allProducts")}</option>
        {products.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {terminalOptions && (
        <select name="terminal" defaultValue={terminal ?? ""} className={sel} aria-label={t("filter.allTerminals")}>
          <option value="">{t("filter.allTerminals")}</option>
          {terminalOptions.map((tt) => (
            <option key={tt.value} value={tt.value}>
              {tt.label}
            </option>
          ))}
        </select>
      )}
      <button className="rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-green-deep">
        {t("filter.apply")}
      </button>
    </form>
  );
}

export async function Pager({ page, pageSize, total, base }: { page: number; pageSize: number; total: number; base: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const t = translator(await getLocale());
  const link = (p: number) => `${base}${base.includes("?") ? "&" : "?"}page=${p}`;
  return (
    <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pages">
      <span className="text-stone">{t("pager.page", { page, pages, total })}</span>
      <div className="flex gap-2">
        {page > 1 && (
          <a href={link(page - 1)} className="rounded-sm border border-line px-3 py-1.5 hover:bg-paper-2">
            {t("pager.prev")}
          </a>
        )}
        {page < pages && (
          <a href={link(page + 1)} className="rounded-sm border border-line px-3 py-1.5 hover:bg-paper-2">
            {t("pager.next")}
          </a>
        )}
      </div>
    </nav>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="tag mt-6 p-8 text-center text-ink-2">{children}</div>;
}
