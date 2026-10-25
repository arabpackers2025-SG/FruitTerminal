import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, companies, subscriptions } from "@/db/schema";

const COOKIE = "ft_session";
const DAYS = 30;

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DAYS * 864e5);
  await db.insert(sessions).values({ id: token, userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  jar.delete(COOKIE);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "OWNER" | "STAFF" | "ADMIN";
  companyId: string | null;
  company: typeof companies.$inferSelect | null;
  plan: "FREE" | "SELLER_PRO" | "BUYER_PRO";
};

/** The signed-in user with their company and plan, or null. Cached per request. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const row = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const user = row[0]?.user;
  if (!user) return null;

  let company: typeof companies.$inferSelect | null = null;
  let plan: SessionUser["plan"] = "FREE";
  if (user.companyId) {
    company = (await db.query.companies.findFirst({ where: eq(companies.id, user.companyId) })) ?? null;
    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.companyId, user.companyId),
    });
    if (sub && sub.status === "ACTIVE" && (sub.plan === "SELLER_PRO" || sub.plan === "BUYER_PRO")) {
      plan = sub.plan;
    }
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    company,
    plan,
  };
}
