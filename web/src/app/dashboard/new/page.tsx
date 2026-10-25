import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { CreateCompanyForm } from "@/components/create-company-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add your company" };

export default async function NewCompanyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.companyId) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-black">Add your company</h1>
      <p className="mt-2 text-ink-2">
        Already listed? <Link href="/dashboard/claim" className="font-semibold text-green hover:underline">Claim your existing listing</Link> instead.
      </p>
      <div className="mt-8"><CreateCompanyForm /></div>
    </div>
  );
}
