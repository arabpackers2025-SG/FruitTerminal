import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-black">Nothing at this address.</h1>
      <p className="mt-3 text-lg text-ink-2">The page may have moved, or the listing was removed.</p>
      <Link href="/terminals" className="mt-6 inline-block rounded-sm bg-green px-5 py-3 font-semibold text-white">Browse terminals</Link>
    </div>
  );
}
