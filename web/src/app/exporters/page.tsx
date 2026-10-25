import type { Metadata } from "next";
import { Directory } from "@/components/directory";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Fruit and vegetable exporters and growers",
  description: "Exporters, packers and growers of fresh produce by country and product.",
};

export default async function ExportersPage({ searchParams }: PageProps<"/exporters">) {
  const sp = await searchParams;
  return (
    <Directory role="SELLER" sp={sp} base="/exporters" titleKey="exporters.title" introKey="exporters.intro" />
  );
}
