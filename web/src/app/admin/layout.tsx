import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 flex gap-4 border-b border-line pb-3 text-sm font-semibold">
        <Link href="/admin" className="hover:text-green">Overview</Link>
        <Link href="/admin/claims" className="hover:text-green">Claims</Link>
        <Link href="/admin/staging" className="hover:text-green">Scraped review</Link>
      </nav>
      {children}
    </div>
  );
}
