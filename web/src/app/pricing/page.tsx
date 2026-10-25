import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing", description: "Free to browse. Seller Pro and Buyer Pro unlock contact details and unlimited inquiries." };

const rows: [string, string, string, string][] = [
  ["Browse terminals, companies and leads", "Yes", "Yes", "Yes"],
  ["Inquiries", "1 per day", "Unlimited", "Unlimited"],
  ["Phone, email and website on profiles", "No", "Yes", "Yes"],
  ["Profile", "Basic", "Enhanced with photos and certifications", "Enhanced"],
  ["Post offers or buy requests", "1 active", "Unlimited", "Unlimited"],
  ["Alerts for matching leads", "No", "Yes", "Yes"],
  ["Verified badge", "No", "After document check", "After document check"],
  ["Priority in search results", "No", "Yes", "Yes"],
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black">Pricing</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">
        Browsing is free. Paid plans open contact details and unlimited inquiries. Accounts and payments open with the
        next release; leave your email to be told first.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { name: "Free", price: "0", note: "Browse and claim your listing", cta: "Claim a listing" },
          { name: "Seller Pro", price: "49", note: "For exporters, packers and growers", cta: "Join as a seller", highlight: true },
          { name: "Buyer Pro", price: "29", note: "For importers and terminal wholesalers", cta: "Join as a buyer" },
        ].map((p) => (
          <div key={p.name} className={`tag p-6 ${p.highlight ? "tag--verified" : ""}`}>
            <h2 className="text-xl font-extrabold">{p.name}</h2>
            <p className="mt-2 text-4xl font-black tabular-nums">
              ${p.price}<span className="text-base font-medium text-ink-2"> / month</span>
            </p>
            <p className="mt-1 text-sm text-ink-2">{p.note}</p>
            <a href="/signup" className="mt-5 block rounded-sm bg-green px-4 py-2.5 text-center font-semibold text-white hover:bg-green-deep">
              {p.cta}
            </a>
          </div>
        ))}
      </div>

      <table className="mt-10 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-2 pr-4 font-extrabold">Feature</th>
            <th className="py-2 pr-4 font-extrabold">Free</th>
            <th className="py-2 pr-4 font-extrabold">Seller Pro</th>
            <th className="py-2 font-extrabold">Buyer Pro</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-line">
              <td className="py-2 pr-4 font-medium">{r[0]}</td>
              <td className="py-2 pr-4 text-ink-2">{r[1]}</td>
              <td className="py-2 pr-4 text-ink-2">{r[2]}</td>
              <td className="py-2 text-ink-2">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-stone">Annual plans: pay for 10 months, get 12.</p>
    </div>
  );
}
