"use client";

import { useActionState } from "react";
import { createCompanyAction, type FormState } from "@/lib/actions/company";

const field = "w-full rounded-sm border border-line bg-white px-3 py-2 text-ink focus:border-green";

export function CreateCompanyForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCompanyAction, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Company name</label>
        <input id="name" name="name" className={field} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="text-sm font-medium">We are a…</label>
          <select id="role" name="role" className={field} defaultValue="SELLER">
            <option value="SELLER">Exporter / grower (we sell)</option>
            <option value="BUYER">Buyer / importer (we buy)</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
        <div>
          <label htmlFor="country" className="text-sm font-medium">Country code (2 letters)</label>
          <input id="country" name="country" maxLength={2} placeholder="EG" className={`${field} uppercase`} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="text-sm font-medium">City</label>
          <input id="city" name="city" className={field} />
        </div>
        <div>
          <label htmlFor="website" className="text-sm font-medium">Website</label>
          <input id="website" name="website" placeholder="https://…" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">Company email</label>
        <input id="email" name="email" type="email" className={field} />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">Short description</label>
        <textarea id="description" name="description" rows={3} className={field} />
      </div>
      {state.error && <p className="rounded-sm bg-stamp/10 px-3 py-2 text-sm text-stamp">{state.error}</p>}
      <button disabled={pending}
        className="rounded-sm bg-green px-5 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">
        {pending ? "Creating…" : "Create listing"}
      </button>
    </form>
  );
}
