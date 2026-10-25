import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return <AuthForm mode="signup" />;
}
