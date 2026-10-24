import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-ink-2 sm:grid-cols-3">
        <div>
          <p className="font-extrabold text-ink">Fruit Terminal</p>
          <p className="mt-2 max-w-xs">
            The directory of wholesale fruit terminals and the exporters that supply them.
          </p>
          <p className="mt-2 text-stone">Operated by Sagueny Group.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/terminals">Terminals</Link>
          <Link href="/buyers">Buyers and importers</Link>
          <Link href="/exporters">Exporters and growers</Link>
          <Link href="/products">Products</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
          <Link href="/about#listings">Remove or correct a listing</Link>
          <Link href="/about#terms">Terms and privacy</Link>
        </div>
      </div>
    </footer>
  );
}
