/* Create or promote an admin user.
   npm run create-admin -- admin@example.com "Full Name" a-strong-password */
import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const [email, name, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> "<name>" <password>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (existing) {
    await db.update(users).set({ role: "ADMIN", passwordHash: hash, name: name ?? existing.name }).where(eq(users.id, existing.id));
    console.log(`Updated ${email} to ADMIN.`);
  } else {
    await db.insert(users).values({ email: email.toLowerCase(), name: name ?? null, passwordHash: hash, role: "ADMIN" });
    console.log(`Created admin ${email}.`);
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
