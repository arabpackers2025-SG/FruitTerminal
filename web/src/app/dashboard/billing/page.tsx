import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { billingConfigured, currentSubscription, PLANS } from "@/lib/billing";
import { UpgradeButton } from "@/components/upgrade-buttons";
import { openPortalAction } from "@/lib/actions/billing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.companyId) redirect("/dashboard");
  const sub = await currentSubscription(user.companyId);
  const paid = sub && (sub.plan === "SELLER_PRO" || sub.plan === "BUYER_PRO") && sub.status === "ACTIVE";
  const configured = billingConfigured();

  return (
    <div>
      <h1 className="text-3xl font-black">Billing</h1>
      <p className="mt-2 text-ink-2">
        Your plan: <strong>{paid ? PLANS[sub!.plan as "SELLER_PRO" | "BUYER_PRO"].label : "Free"}</strong>
        {sub?.status === "PAST_DUE" && <span className="text-stamp"> · payment past due</span>}
        {paid && sub?.periodEnd && <> · renews {new Date(sub.periodEnd).toLocaleDateString("en-CA")}</>}
      </p>

      {!configured ? (
        <div className="tag mt-6 p-5 text-ink-2">
          <p className="font-semibold text-ink">Paid plans are coming shortly.</p>
          <p className="mt-1">Online payments aren't switched on yet. For early access, email{" "}
            <a href="mailto:order@saguenygroup.com" className="font-semibold text-green hover:underline">order@saguenygroup.com</a>.</p>
        </div>
      ) : paid ? (
        <form action={openPortalAction} className="mt-6">
          <button className="rounded-sm bg-green px-5 py-2.5 font-semibold text-white hover:bg-green-deep">Manage subscription</button>
          <p className="mt-2 text-sm text-ink-2">Change plan, update your card or cancel in the billing portal.</p>
        </form>
      ) : (
        <>
          <p className="mt-6 text-ink-2">Upgrade to see every company's contact details and send unlimited inquiries.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <UpgradeButton plan="SELLER_PRO" label={PLANS.SELLER_PRO.label} price={PLANS.SELLER_PRO.price} />
            <UpgradeButton plan="BUYER_PRO" label={PLANS.BUYER_PRO.label} price={PLANS.BUYER_PRO.price} />
          </div>
          <p className="mt-4 text-sm text-stone">Secure payment by Stripe. Cancel anytime.</p>
        </>
      )}
    </div>
  );
}
