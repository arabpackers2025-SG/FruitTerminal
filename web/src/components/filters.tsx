import { countryName, flag } from "@/lib/countries";

type Opt = { value: string; label: string };

export function FilterBar({
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
  const sel =
    "rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink focus:border-green";
  return (
    <form action={action} method="get" className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Company, city or keyword"
        className={sel}
        aria-label="Search"
      />
      <select name="country" defaultValue={country ?? ""} className={sel} aria-label="Country">
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c.country} value={c.country}>
            {flag(c.country)} {countryName(c.country)} ({c.n})
          </option>
        ))}
      </select>
      <select name="product" defaultValue={product ?? ""} className={sel} aria-label="Product">
        <option value="">All products</option>
        {products.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {terminalOptions && (
        <select name="terminal" defaultValue={terminal ?? ""} className={sel} aria-label="Terminal">
          <option value="">All terminals</option>
          {terminalOptions.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      )}
      <button className="rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-green-deep">
        Filter
      </button>
    </form>
  );
}

export function Pager({ page, pageSize, total, base }: { page: number; pageSize: number; total: number; base: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const link = (p: number) => `${base}${base.includes("?") ? "&" : "?"}page=${p}`;
  return (
    <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pages">
      <span className="text-stone">
        Page {page} of {pages} · {total} companies
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <a href={link(page - 1)} className="rounded-sm border border-line px-3 py-1.5 hover:bg-paper-2">
            Previous
          </a>
        )}
        {page < pages && (
          <a href={link(page + 1)} className="rounded-sm border border-line px-3 py-1.5 hover:bg-paper-2">
            Next
          </a>
        )}
      </div>
    </nav>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="tag mt-6 p-8 text-center text-ink-2">{children}</div>;
}
