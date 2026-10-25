import type { Metadata } from "next";
import { CsvImportForm } from "@/components/csv-import-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Import companies" };

export default function AdminImport() {
  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-black">Import companies (CSV)</h1>
      <p className="mt-2 text-ink-2">
        Upload your own lists of importers or exporters. Rows land in “Scraped review” as Unclaimed listings for you to approve.
      </p>
      <div className="mt-4 rounded-sm bg-paper-2 p-4 text-sm text-ink-2">
        <p className="font-semibold text-ink">CSV columns (first row = header):</p>
        <code className="mt-1 block">name, website, phone, email, country, city, products, terminalSlug</code>
        <p className="mt-2">Only <strong>name</strong> is required. <code>country</code> is a 2-letter code; <code>terminalSlug</code> links the company to a terminal page (e.g. <code>toronto-ontario-food-terminal</code>).</p>
      </div>
      <div className="mt-6"><CsvImportForm /></div>
    </div>
  );
}
