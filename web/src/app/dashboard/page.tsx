import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { memberDashboard } from "@/lib/member";
import { StatusBadge } from "@/components/company-card";
import { countryName } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = (await getSessionUser())!;

  if (!user.companyId) {
    return (
      <div>
        <h1 className="text-3xl font-black">Welcome to Fruit Terminal</h1>
        <p className="mt-2 max-w-prose text-ink-2">
          Link your company to post offers and buy requests, receive inquiries, and manage your profile.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/claim" className="tag block p-5 hover:bg-paper-2">
            <h2 className="text-lg font-extrabold">Claim your listing</h2>
            <p className="mt-1 text-sm text-ink-2">Already in our directory? Find it and claim it, free.</p>
          </Link>
          <Link href="/dashboard/new" className="tag block p-5 hover:bg-paper-2">
            <h2 className="text-lg font-extrabold">Add a new company</h2>
            <p className="mt-1 text-sm text-ink-2">Not listed yet? Create your company page.</p>
          </Link>
        </div>
      </div>
    );
  }

  const d = await memberDashboard(user.companyId, user.plan);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-black">{user.company!.name}</h1>
        <StatusBadge status={user.company!.status} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Unread inquiries", d.unread],
          ["Inquiries today", `${d.sentToday}/${d.dailyLimit === Infinity ? "∞" : d.dailyLimit}`],
          ["Active offers", d.activeOffers],
          ["Active requests", d.activeRequests],
        ].map(([label, val]) => (
          <div key={label as string} className="tag p-4">
            <div className="text-sm text-ink-2">{label}</div>
            <div className="text-2xl font-black tabular-nums">{val}</div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
          <h2 className="text-xl font-extrabold">Latest inquiries</h2>
          <Link href="/dashboard/inbox" className="text-sm font-semibold text-green hover:underline">Open inbox</Link>
        </div>
        {d.recentInquiries.length === 0 ? (
          <p className="mt-4 text-ink-2">No inquiries yet. Post an offer or buy request so buyers and sellers can find you.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-b border-line">
            {d.recentInquiries.map((i) => (
              <li key={i.id} className="py-3">
                <p className="font-semibold">{i.fromCompany.name} <span className="font-normal text-ink-2">· {countryName(i.fromCompany.country)}</span></p>
                <p className="text-sm text-ink-2 line-clamp-1">{i.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {d.matchingLeads.length > 0 && (
        <section className="mt-8">
          <h2 className="border-b-2 border-ink pb-2 text-xl font-extrabold">Leads that match your products</h2>
          <ul className="mt-3 divide-y divide-line border-b border-line">
            {d.matchingLeads.map((l) => (
              <li key={l.id} className="py-3">
                <p className="font-semibold">{l.kind === "offer" ? "Offer" : "Wanted"}: {l.title}</p>
                <p className="text-sm text-ink-2">{l.categoryName} · {l.companyName}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
