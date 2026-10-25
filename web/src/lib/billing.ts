import "server-only";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export const PLANS = {
  SELLER_PRO: { label: "Seller Pro", priceEnv: "STRIPE_PRICE_SELLER_PRO", price: "$49/mo" },
  BUYER_PRO: { label: "Buyer Pro", priceEnv: "STRIPE_PRICE_BUYER_PRO", price: "$29/mo" },
} as const;
export type PaidPlan = keyof typeof PLANS;

let _stripe: Stripe | null | undefined;
export function stripe(): Stripe | null {
  if (_stripe === undefined) {
    const key = process.env.STRIPE_SECRET_KEY;
    _stripe = key ? new Stripe(key) : null;
  }
  return _stripe;
}
export function billingConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}
export function priceId(plan: PaidPlan): string | null {
  return process.env[PLANS[plan].priceEnv] || null;
}

/** The single place a company's plan changes. Safe to call from webhooks and tests. */
export async function applySubscription(companyId: string, data: {
  plan: "FREE" | PaidPlan;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  stripeCustomerId?: string | null;
  stripeSubId?: string | null;
  periodEnd?: Date | null;
}) {
  const set = {
    plan: data.plan,
    status: data.status,
    stripeCustomerId: data.stripeCustomerId ?? null,
    stripeSubId: data.stripeSubId ?? null,
    periodEnd: data.periodEnd ?? null,
  };
  await db
    .insert(subscriptions)
    .values({ companyId, ...set })
    .onConflictDoUpdate({ target: subscriptions.companyId, set });
}

function planFromPriceId(id: string | undefined | null): PaidPlan | null {
  if (!id) return null;
  if (id === process.env.STRIPE_PRICE_SELLER_PRO) return "SELLER_PRO";
  if (id === process.env.STRIPE_PRICE_BUYER_PRO) return "BUYER_PRO";
  return null;
}

/** Translate a verified Stripe event into a subscription change. Returns a short note. */
export async function handleStripeEvent(event: Stripe.Event): Promise<string> {
  const s = stripe();
  switch (event.type) {
    case "checkout.session.completed": {
      const sess = event.data.object as Stripe.Checkout.Session;
      const companyId = sess.metadata?.companyId;
      const plan = (sess.metadata?.plan as PaidPlan) || null;
      if (!companyId || !plan) return "checkout: missing metadata";
      let periodEnd: Date | null = null;
      let subId = (sess.subscription as string) || null;
      if (subId && s) {
        const sub = await s.subscriptions.retrieve(subId);
        periodEnd = sub.items.data[0]?.current_period_end
          ? new Date(sub.items.data[0].current_period_end * 1000) : null;
      }
      await applySubscription(companyId, {
        plan, status: "ACTIVE",
        stripeCustomerId: (sess.customer as string) || null,
        stripeSubId: subId, periodEnd,
      });
      return `checkout complete: ${companyId} -> ${plan}`;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const companyId = sub.metadata?.companyId;
      if (!companyId) return "subscription event: no companyId";
      const canceled = event.type === "customer.subscription.deleted" || sub.status === "canceled";
      const plan = planFromPriceId(sub.items.data[0]?.price?.id);
      await applySubscription(companyId, {
        plan: canceled || !plan ? "FREE" : plan,
        status: canceled ? "CANCELED" : sub.status === "past_due" ? "PAST_DUE" : "ACTIVE",
        stripeCustomerId: (sub.customer as string) || null,
        stripeSubId: sub.id,
        periodEnd: sub.items.data[0]?.current_period_end ? new Date(sub.items.data[0].current_period_end * 1000) : null,
      });
      return `subscription ${event.type}: ${companyId} -> ${canceled ? "FREE" : plan}`;
    }
    default:
      return `ignored ${event.type}`;
  }
}

export async function currentSubscription(companyId: string) {
  return db.query.subscriptions.findFirst({ where: eq(subscriptions.companyId, companyId) });
}
