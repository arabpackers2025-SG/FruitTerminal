import type { Metadata } from "next";
import { Directory } from "@/components/directory";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Fruit importers and terminal wholesalers",
  description: "Buyers of fresh fruit and vegetables: terminal wholesalers, importers and distributors, by country, terminal and product.",
};

export default async function BuyersPage({ searchParams }: PageProps<"/buyers">) {
  const sp = await searchParams;
  return (
    <Directory role="BUYER" sp={sp} base="/buyers" titleKey="buyers.title" introKey="buyers.intro" />
  );
}
