"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { clean, isEmail } from "@/lib/validate";

export type AuthState = { error?: string };

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const name = clean(form.get("name"));
  const email = clean(form.get("email")).toLowerCase();
  const password = clean(form.get("password"));
  if (!name) return { error: "Please enter your name." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return { error: "An account with that email already exists. Try signing in." };

  const [u] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password), role: "OWNER" })
    .returning({ id: users.id });
  await createSession(u.id);
  redirect("/dashboard");
}

export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = clean(form.get("email")).toLowerCase();
  const password = clean(form.get("password"));
  if (!isEmail(email) || !password) return { error: "Enter your email and password." };

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Wrong email or password." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}
