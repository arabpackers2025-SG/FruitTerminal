"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { billingConfigured, priceId, stripe, currentSubscription, PLANS, type PaidPlan } from "@/lib/billing";
import { clean } from "@/lib/validate";

const SITE = process.env.SITE_URL || "https://ft.saguenygroup.com";

export type BillingState = { error?: string };

export async function startCheckoutAction(_prev: BillingState, form: FormData): Promise<BillingState> {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const plan = clean(form.get("plan")) as PaidPlan;
  if (!(plan in PLANS)) return { error: "Unknown plan." };
  const s = stripe();
  const price = priceId(plan);
  if (!s || !price) return { error: "Payments aren't configured yet. Please check back soon." };

  const existing = await currentSubscription(user.companyId);
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer: existing?.stripeCustomerId || undefined,
    customer_email: existing?.stripeCustomerId ? undefined : user.email,
    client_reference_id: user.companyId,
    metadata: { companyId: user.companyId, plan },
    subscription_data: { metadata: { companyId: user.companyId, plan } },
    success_url: `${SITE}/dashboard/billing?upgraded=1`,
    cancel_url: `${SITE}/dashboard/billing`,
  });
  if (!session.url) return { error: "Could not start checkout. Try again." };
  redirect(session.url);
}

export async function openPortalAction() {
  const user = await getSessionUser();
  if (!user?.companyId) redirect("/login");
  const s = stripe();
  const sub = await currentSubscription(user.companyId);
  if (!s || !sub?.stripeCustomerId) redirect("/dashboard/billing");
  const portal = await s.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${SITE}/dashboard/billing`,
  });
  redirect(portal.url);
}
