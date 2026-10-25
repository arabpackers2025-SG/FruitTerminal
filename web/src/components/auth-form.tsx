"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, signUpAction, type AuthState } from "@/lib/actions/auth";

const field = "w-full rounded-sm border border-line bg-white px-3 py-2.5 text-ink focus:border-green";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "signup" ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-black">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
      <p className="mt-2 text-ink-2">
        {mode === "signup"
          ? "List your company, claim a listing, and send inquiries."
          : "Welcome back to Fruit Terminal."}
      </p>
      <form action={formAction} className="mt-6 space-y-3">
        {mode === "signup" && (
          <div>
            <label className="text-sm font-medium" htmlFor="name">Your name</label>
            <input id="name" name="name" autoComplete="name" className={field} required />
          </div>
        )}
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className={field} required />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" name="password" type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"} className={field} required />
        </div>
        {state.error && <p className="rounded-sm bg-stamp/10 px-3 py-2 text-sm text-stamp">{state.error}</p>}
        <button disabled={pending}
          className="w-full rounded-sm bg-green px-4 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">
          {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-2">
        {mode === "signup" ? (
          <>Already have an account? <Link href="/login" className="font-semibold text-green hover:underline">Sign in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="font-semibold text-green hover:underline">Create an account</Link></>
        )}
      </p>
    </div>
  );
}
