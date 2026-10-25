import Link from "next/link";
import { countryName, flag } from "@/lib/countries";
import { getLocale, translator } from "@/lib/i18n";

type Status = "UNCLAIMED" | "CLAIMED" | "VERIFIED";
type Role = "BUYER" | "SELLER" | "BOTH";

type Company = {
  slug: string;
  name: string;
  role: Role;
  country: string;
  city: string | null;
  stall: string | null;
  status: Status;
  description: string | null;
  terminal?: { slug: string; name: string } | null;
  products?: { direction: "SELLS" | "BUYS"; category: { slug: string; name: string } }[];
};

export async function StatusBadge({ status }: { status: Status }) {
  const t = translator(await getLocale());
  if (status === "VERIFIED")
    return <span className="rounded-sm bg-citrus px-1.5 py-0.5 text-xs font-bold text-ink">{t("badge.verified")}</span>;
  if (status === "CLAIMED")
    return <span className="rounded-sm bg-green px-1.5 py-0.5 text-xs font-bold text-white">{t("badge.member")}</span>;
  return <span className="rounded-sm border border-line px-1.5 py-0.5 text-xs font-medium text-stone">{t("badge.unclaimed")}</span>;
}

export async function RoleLabel({ role }: { role: Role }) {
  const t = translator(await getLocale());
  const text = role === "BUYER" ? t("role.buyer") : role === "SELLER" ? t("role.exporter") : t("role.both");
  return <span className="text-xs font-semibold text-green">{text}</span>;
}

export async function CompanyCard({ c, showTerminal = true }: { c: Company; showTerminal?: boolean }) {
  const t = translator(await getLocale());
  const products = (c.products ?? []).slice(0, 4);
  const roleText = c.role === "BUYER" ? t("role.buyer") : c.role === "SELLER" ? t("role.exporter") : t("role.both");
  const badge =
    c.status === "VERIFIED" ? <span className="rounded-sm bg-citrus px-1.5 py-0.5 text-xs font-bold text-ink">{t("badge.verified")}</span>
    : c.status === "CLAIMED" ? <span className="rounded-sm bg-green px-1.5 py-0.5 text-xs font-bold text-white">{t("badge.member")}</span>
    : <span className="rounded-sm border border-line px-1.5 py-0.5 text-xs font-medium text-stone">{t("badge.unclaimed")}</span>;
  return (
    <article className={`tag p-4 tag--${c.status.toLowerCase()}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-green">{roleText}</span>
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
            <div className="text-[10px] font-semibold text-ink-2">{t("card.stall")}</div>
            <div className="text-base font-extrabold tabular-nums">{c.stall}</div>
          </div>
        ) : (
          badge
        )}
      </div>
      {showTerminal && c.terminal && (
        <p className="mt-2 text-sm text-ink-2">
          {t("card.at")}{" "}
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
            <li className="px-1 text-xs text-stone">{t("card.more", { n: (c.products?.length ?? 0) - 4 })}</li>
          )}
        </ul>
      )}
    </article>
  );
}
