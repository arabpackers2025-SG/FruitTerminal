import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { countryName } from "@/lib/countries";
import { markInquiryReadAction } from "@/lib/actions/leads";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inbox" };

function fmt(d: Date) { return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }); }

export default async function InboxPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.companyId) redirect("/dashboard");

  const [received, sent] = await Promise.all([
    db.query.inquiries.findMany({ where: eq(inquiries.toCompanyId, user.companyId), orderBy: desc(inquiries.createdAt), limit: 50, with: { fromCompany: true } }),
    db.query.inquiries.findMany({ where: eq(inquiries.fromCompanyId, user.companyId), orderBy: desc(inquiries.createdAt), limit: 50, with: { toCompany: true } }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-black">Inbox</h1>

      <section className="mt-6">
        <h2 className="border-b-2 border-ink pb-2 text-xl font-extrabold">Received</h2>
        {received.length === 0 ? (
          <p className="mt-4 text-ink-2">No inquiries received yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {received.map((i) => (
              <li key={i.id} className={`tag p-4 ${i.readAt ? "" : "tag--verified"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      <Link href={`/company/${i.fromCompany.slug}`} className="hover:underline">{i.fromCompany.name}</Link>
                      <span className="font-normal text-ink-2"> · {countryName(i.fromCompany.country)} · {fmt(i.createdAt)}</span>
                    </p>
                    <p className="mt-1">{i.message}</p>
                    <p className="mt-2 text-sm text-ink-2">
                      Reply to: {i.fromCompany.email ? <a href={`mailto:${i.fromCompany.email}`} className="font-medium text-green hover:underline">{i.fromCompany.email}</a> : "no email on file"}
                      {i.fromCompany.phone ? ` · ${i.fromCompany.phone}` : ""}
                    </p>
                  </div>
                  {!i.readAt && (
                    <form action={markInquiryReadAction}><input type="hidden" name="id" value={i.id} />
                      <button className="shrink-0 rounded-sm border border-line px-3 py-1.5 text-sm hover:bg-paper-2">Mark read</button></form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="border-b-2 border-ink pb-2 text-xl font-extrabold">Sent</h2>
        {sent.length === 0 ? (
          <p className="mt-4 text-ink-2">You haven't sent any inquiries yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-b border-line">
            {sent.map((i) => (
              <li key={i.id} className="py-3">
                <p className="font-semibold">To <Link href={`/company/${i.toCompany.slug}`} className="hover:underline">{i.toCompany.name}</Link> <span className="font-normal text-ink-2">· {fmt(i.createdAt)}</span></p>
                <p className="text-sm text-ink-2">{i.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
