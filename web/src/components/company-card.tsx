import Link from "next/link";
import { countryName, flag } from "@/lib/countries";

type Company = {
  slug: string;
  name: string;
  role: "BUYER" | "SELLER" | "BOTH";
  country: string;
  city: string | null;
  stall: string | null;
  status: "UNCLAIMED" | "CLAIMED" | "VERIFIED";
  description: string | null;
  terminal?: { slug: string; name: string } | null;
  products?: { direction: "SELLS" | "BUYS"; category: { slug: string; name: string } }[];
};

export function StatusBadge({ status }: { status: Company["status"] }) {
  if (status === "VERIFIED")
    return <span className="rounded-sm bg-citrus px-1.5 py-0.5 text-xs font-bold text-ink">Verified</span>;
  if (status === "CLAIMED")
    return <span className="rounded-sm bg-green px-1.5 py-0.5 text-xs font-bold text-white">Member</span>;
  return <span className="rounded-sm border border-line px-1.5 py-0.5 text-xs font-medium text-stone">Unclaimed</span>;
}

export function RoleLabel({ role }: { role: Company["role"] }) {
  const text = role === "BUYER" ? "Buyer" : role === "SELLER" ? "Exporter" : "Buyer and exporter";
  return <span className="text-xs font-semibold text-green">{text}</span>;
}

export function CompanyCard({ c, showTerminal = true }: { c: Company; showTerminal?: boolean }) {
  const products = (c.products ?? []).slice(0, 4);
  return (
    <article className={`tag p-4 tag--${c.status.toLowerCase()}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <RoleLabel role={c.role} />
          <h3 className="mt-0.5 truncate text-lg font-bold">
            <Link href={`/company/${c.slug}`} className="hover:underline">
              {c.name}
            </Link>
          </h3>
          <p className="text-sm text-ink-2">
            {flag(c.country)} {c.city ? `${c.city}, ` : ""}
            {countryName(c.country)}
          </p>
        </div>
        {c.stall ? (
          <div className="shrink-0 rounded-sm border border-ink px-2 py-1 text-center leading-none">
            <div className="text-[10px] font-semibold text-ink-2">Stall</div>
            <div className="text-base font-extrabold tabular-nums">{c.stall}</div>
          </div>
        ) : (
          <StatusBadge status={c.status} />
        )}
      </div>
      {showTerminal && c.terminal && (
        <p className="mt-2 text-sm text-ink-2">
          At{" "}
          <Link href={`/terminals/${c.terminal.slug}`} className="font-medium text-green hover:underline">
            {c.terminal.name}
          </Link>
        </p>
      )}
      {products.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {products.map((p) => (
            <li key={p.category.slug}>
              <Link
                href={`/products/${p.category.slug}`}
                className="rounded-sm bg-paper-2 px-2 py-0.5 text-xs font-medium text-ink-2 hover:bg-line"
              >
                {p.category.name}
              </Link>
            </li>
          ))}
          {(c.products?.length ?? 0) > 4 && (
            <li className="px-1 text-xs text-stone">+{(c.products?.length ?? 0) - 4} more</li>
          )}
        </ul>
      )}
    </article>
  );
}
