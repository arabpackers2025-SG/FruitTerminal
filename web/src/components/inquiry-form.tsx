"use client";

import { useActionState } from "react";
import { sendInquiryAction, type LeadState } from "@/lib/actions/leads";

export function InquiryForm({ toCompanyId }: { toCompanyId: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(sendInquiryAction, {});
  if (state.ok) return <p className="rounded-sm bg-green/10 px-4 py-3 text-green">{state.ok}</p>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="toCompanyId" value={toCompanyId} />
      <textarea name="message" rows={5} required placeholder="Introduce your company and what you're after…"
        className="w-full rounded-sm border border-line bg-white px-3 py-2 text-ink focus:border-green" />
      {state.error && <p className="rounded-sm bg-stamp/10 px-3 py-2 text-sm text-stamp">{state.error}</p>}
      <button disabled={pending} className="rounded-sm bg-green px-5 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
