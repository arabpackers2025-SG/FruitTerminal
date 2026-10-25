"use client";

import { useActionState } from "react";
import { startCheckoutAction, type BillingState } from "@/lib/actions/billing";

export function UpgradeButton({ plan, label, price }: { plan: string; label: string; price: string }) {
  const [state, action, pending] = useActionState<BillingState, FormData>(startCheckoutAction, {});
  return (
    <form action={action} className="tag flex flex-col p-5">
      <input type="hidden" name="plan" value={plan} />
      <h3 className="text-lg font-extrabold">{label}</h3>
      <p className="mt-1 text-2xl font-black">{price}</p>
      <button disabled={pending}
        className="mt-4 rounded-sm bg-green px-4 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">
        {pending ? "Starting…" : `Upgrade to ${label}`}
      </button>
      {state.error && <p className="mt-2 text-sm text-stamp">{state.error}</p>}
    </form>
  );
}
