import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/offers", label: "Offers" },
  { href: "/dashboard/requests", label: "Buy requests" },
  { href: "/dashboard/profile", label: "My listing" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const linked = !!user.companyId;
  return (
    <div className="mx-auto max-w-6xl gap-8 px-4 py-8 md:grid md:grid-cols-[200px_1fr]">
      <aside className="mb-6 md:mb-0">
        <p className="text-sm text-ink-2">Signed in as</p>
        <p className="truncate font-semibold">{user.company?.name ?? user.name ?? user.email}</p>
        {linked && (
          <nav className="mt-4 flex gap-2 overflow-x-auto md:flex-col md:gap-1">
            {items.map((i) => (
              <Link key={i.href} href={i.href}
                className="whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2 hover:text-ink">
                {i.label}
              </Link>
            ))}
            {user.company && (
              <Link href={`/company/${user.company.slug}`}
                className="whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium text-green hover:bg-paper-2">
                View public page →
              </Link>
            )}
          </nav>
        )}
      </aside>
      <section>{children}</section>
    </div>
  );
}
