"use client";

import { useActionState } from "react";
import { claimCompanyAction, type FormState } from "@/lib/actions/company";

export function ClaimForm({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(claimCompanyAction, {});
  if (state.ok) return <p className="rounded-sm bg-green/10 px-4 py-3 text-green">{state.ok}</p>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="companyId" value={companyId} />
      <p className="text-ink-2">
        You're claiming <strong>{companyName}</strong>. If your account email is on the company's own domain,
        it's approved instantly; otherwise we review it by hand.
      </p>
      <div>
        <label htmlFor="note" className="text-sm font-medium">How can we verify you work here? (optional)</label>
        <textarea id="note" name="note" rows={3}
          placeholder="e.g. a link to your staff page, or your work email"
          className="w-full rounded-sm border border-line bg-white px-3 py-2 text-ink focus:border-green" />
      </div>
      {state.error && <p className="rounded-sm bg-stamp/10 px-3 py-2 text-sm text-stamp">{state.error}</p>}
      <button disabled={pending}
        className="rounded-sm bg-green px-4 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">
        {pending ? "Submitting…" : "Claim this company"}
      </button>
    </form>
  );
}
