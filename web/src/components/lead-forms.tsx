"use client";

import { useActionState } from "react";
import { createOfferAction, createRequestAction, type LeadState } from "@/lib/actions/leads";

const field = "w-full rounded-sm border border-line bg-white px-3 py-2 text-ink focus:border-green";
type Opt = { slug: string; label: string };

function CategorySelect({ options }: { options: Opt[] }) {
  return (
    <select name="category" className={field} defaultValue="" required>
      <option value="" disabled>Choose a product…</option>
      {options.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}
    </select>
  );
}

export function OfferForm({ options }: { options: Opt[] }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(createOfferAction, {});
  return (
    <form action={action} className="tag space-y-3 p-4">
      <h2 className="font-extrabold">Post an offer</h2>
      <input name="title" placeholder="e.g. Valencia oranges, 15kg cartons" className={field} required />
      <CategorySelect options={options} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="quantity" placeholder="Quantity (e.g. 3 x 40ft/week)" className={field} />
        <input name="origin" placeholder="Origin (e.g. Egypt)" className={field} />
      </div>
      <input name="priceTerms" placeholder="Price / terms (e.g. FOB Alexandria)" className={field} />
      <textarea name="details" rows={2} placeholder="Details (optional)" className={field} />
      {state.error && <p className="text-sm text-stamp">{state.error}</p>}
      {state.ok && <p className="text-sm text-green">{state.ok}</p>}
      <button disabled={pending} className="rounded-sm bg-green px-4 py-2 font-semibold text-white hover:bg-green-deep disabled:opacity-60">{pending ? "Posting…" : "Post offer"}</button>
    </form>
  );
}

export function RequestForm({ options }: { options: Opt[] }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(createRequestAction, {});
  return (
    <form action={action} className="tag space-y-3 p-4">
      <h2 className="font-extrabold">Post a buy request</h2>
      <input name="title" placeholder="e.g. Looking for seedless grapes" className={field} required />
      <CategorySelect options={options} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="quantity" placeholder="Quantity needed" className={field} />
        <input name="destination" placeholder="Destination (e.g. Toronto)" className={field} />
      </div>
      <textarea name="details" rows={2} placeholder="Details (optional)" className={field} />
      {state.error && <p className="text-sm text-stamp">{state.error}</p>}
      {state.ok && <p className="text-sm text-green">{state.ok}</p>}
      <button disabled={pending} className="rounded-sm bg-green px-4 py-2 font-semibold text-white hover:bg-green-deep disabled:opacity-60">{pending ? "Posting…" : "Post request"}</button>
    </form>
  );
}
