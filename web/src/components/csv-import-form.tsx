"use client";

import { useActionState } from "react";
import { importCsvAction, type ImportState } from "@/lib/actions/admin";

export function CsvImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importCsvAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="file" name="file" accept=".csv,text/csv" required
        className="block w-full text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-green file:px-4 file:py-2 file:font-semibold file:text-white" />
      {state.error && <p className="rounded-sm bg-stamp/10 px-3 py-2 text-sm text-stamp">{state.error}</p>}
      {state.ok && <p className="rounded-sm bg-green/10 px-3 py-2 text-sm text-green">{state.ok}</p>}
      <button disabled={pending} className="rounded-sm bg-green px-5 py-2.5 font-semibold text-white hover:bg-green-deep disabled:opacity-60">
        {pending ? "Importing…" : "Import CSV"}
      </button>
    </form>
  );
}
