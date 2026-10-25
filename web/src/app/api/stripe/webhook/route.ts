import { NextRequest } from "next/server";
import { stripe, handleStripeEvent } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return new Response("billing not configured", { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = s.webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    return new Response(`signature verification failed: ${(err as Error).message}`, { status: 400 });
  }
  try {
    const note = await handleStripeEvent(event);
    console.log(`[stripe] ${note}`);
  } catch (err) {
    console.error("[stripe] handler error", err);
    return new Response("handler error", { status: 500 });
  }
  return Response.json({ received: true });
}
