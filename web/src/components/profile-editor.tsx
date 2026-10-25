"use client";

import { useActionState } from "react";
import { updateCompanyAction, setProductsAction, type FormState } from "@/lib/actions/company";

const field = "w-full rounded-sm border border-line bg-white px-3 py-2 text-ink focus:border-green";

type Company = {
  name: string; role: "BUYER" | "SELLER" | "BOTH"; country: string; city: string | null;
  address: string | null; website: string | null; email: string | null; phone: string | null; description: string | null;
};
type Profile = { certifications: string[]; exportMarkets: string[]; packingDetails: string | null; capacity: string | null; yearFounded: number | null } | null;
type Leaf = { slug: string; name: string; children: { slug: string; name: string }[] };
type Cat = { slug: string; name: string; children: Leaf[] };

export function ProfileEditor({
  company, profile, roots, sells, buys,
}: { company: Company; profile: Profile; roots: Cat[]; sells: string[]; buys: string[] }) {
  const [s1, saveDetails, p1] = useActionState<FormState, FormData>(updateCompanyAction, {});
  const [s2, saveProducts, p2] = useActionState<FormState, FormData>(setProductsAction, {});

  return (
    <div className="space-y-10">
      <form action={saveDetails} className="space-y-4">
        <h2 className="border-b-2 border-ink pb-2 text-xl font-extrabold">Company details</h2>
        <div><label className="text-sm font-medium">Name</label><input name="name" defaultValue={company.name} className={field} required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-sm font-medium">Role</label>
            <select name="role" defaultValue={company.role} className={field}>
              <option value="SELLER">Exporter / grower</option><option value="BUYER">Buyer / importer</option><option value="BOTH">Both</option>
            </select></div>
          <div><label className="text-sm font-medium">Country code</label><input name="country" maxLength={2} defaultValue={company.country} className={`${field} uppercase`} /></div>
          <div><label className="text-sm font-medium">City</label><input name="city" defaultValue={company.city ?? ""} className={field} /></div>
          <div><label className="text-sm font-medium">Phone</label><input name="phone" defaultValue={company.phone ?? ""} className={field} /></div>
          <div><label className="text-sm font-medium">Website</label><input name="website" defaultValue={company.website ?? ""} className={field} /></div>
          <div><label className="text-sm font-medium">Email</label><input name="email" type="email" defaultValue={company.email ?? ""} className={field} /></div>
        </div>
        <div><label className="text-sm font-medium">Address</label><input name="address" defaultValue={company.address ?? ""} className={field} /></div>
        <div><label className="text-sm font-medium">Description</label><textarea name="description" rows={3} defaultValue={company.description ?? ""} className={field} /></div>
        <h3 className="pt-2 font-extrabold">Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-sm font-medium">Certifications (comma-separated)</label><input name="certifications" defaultValue={profile?.certifications.join(", ") ?? ""} className={field} /></div>
          <div><label className="text-sm font-medium">Export markets (comma-separated)</label><input name="exportMarkets" defaultValue={profile?.exportMarkets.join(", ") ?? ""} className={field} /></div>
          <div><label className="text-sm font-medium">Capacity</label><input name="capacity" defaultValue={profile?.capacity ?? ""} className={field} /></div>
          <div><label className="text-sm font-medium">Year founded</label><input name="yearFounded" type="number" defaultValue={profile?.yearFounded ?? ""} className={field} /></div>
        </div>
        <div><label className="text-sm font-medium">Packing details</label><textarea name="packingDetails" rows={2} defaultValue={profile?.packingDetails ?? ""} className={field} /></div>
        <div className="flex items-center gap-3">
          <button disabled={p1} className="rounded-sm bg-green px-5 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">{p1 ? "Saving…" : "Save details"}</button>
          {s1.ok && <span className="text-sm text-green">{s1.ok}</span>}
          {s1.error && <span className="text-sm text-stamp">{s1.error}</span>}
        </div>
      </form>

      <form action={saveProducts} className="space-y-3">
        <h2 className="border-b-2 border-ink pb-2 text-xl font-extrabold">Products you sell</h2>
        <input type="hidden" name="direction" value="SELLS" />
        <ProductPicker roots={roots} selected={sells} />
        <div className="flex items-center gap-3">
          <button disabled={p2} className="rounded-sm bg-green px-5 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">{p2 ? "Saving…" : "Save products"}</button>
          {s2.ok && <span className="text-sm text-green">{s2.ok}</span>}
        </div>
      </form>
    </div>
  );
}

function ProductPicker({ roots, selected }: { roots: Cat[]; selected: string[] }) {
  const set = new Set(selected);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roots.map((r) => (
        <fieldset key={r.slug} className="rounded-sm border border-line p-3">
          <legend className="px-1 text-sm font-bold">{r.name}</legend>
          <label className="flex items-center gap-2 py-0.5 text-sm font-medium">
            <input type="checkbox" name="categories" value={r.slug} defaultChecked={set.has(r.slug)} /> All {r.name.toLowerCase()}
          </label>
          {r.children.map((c) => (
            <div key={c.slug}>
              <label className="flex items-center gap-2 py-0.5 text-sm font-medium text-ink-2">
                <input type="checkbox" name="categories" value={c.slug} defaultChecked={set.has(c.slug)} /> {c.name}
              </label>
              {c.children.map((g) => (
                <label key={g.slug} className="ml-5 flex items-center gap-2 py-0.5 text-sm text-stone">
                  <input type="checkbox" name="categories" value={g.slug} defaultChecked={set.has(g.slug)} /> {g.name}
                </label>
              ))}
            </div>
          ))}
        </fieldset>
      ))}
    </div>
  );
}
