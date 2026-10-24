import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-black">About Fruit Terminal</h1>
      <div className="mt-6 space-y-4 text-lg text-ink-2">
        <p>
          Fruit Terminal is a directory and marketplace for the fresh-produce trade. It lists the wholesale fruit
          terminals of the world, the wholesalers and importers who trade inside them, and the exporters and growers
          who can supply them.
        </p>
        <p>
          The platform is operated by Sagueny Group, an Egyptian group whose own export brands, Fraiza and Green
          Fields, are listed here as ordinary members. They buy the same plans and receive no advantage in search or
          placement over any other member.
        </p>
      </div>

      <h2 id="listings" className="mt-12 text-2xl font-extrabold">Where listings come from</h2>
      <div className="mt-3 space-y-3 text-ink-2">
        <p>
          Listings marked Unclaimed are compiled from public sources: terminal tenant directories, exporter and grower
          association member lists, and company websites. We store business contact details only, never personal
          mobile numbers or personal email addresses, and we record the source of every listing.
        </p>
        <p>
          If your company is listed and you want it corrected or removed, write to{" "}
          <a href="mailto:order@saguenygroup.com?subject=Listing%20correction" className="font-semibold text-green hover:underline">order@saguenygroup.com</a>{" "}
          with the listing's address. Corrections and removals are handled within 48 hours.
        </p>
      </div>

      <h2 id="terms" className="mt-12 text-2xl font-extrabold">Terms and privacy</h2>
      <div className="mt-3 space-y-3 text-ink-2">
        <p>
          Fruit Terminal is a directory and introduction service. It is not a party to any sale between members and
          does not verify goods, payments or deliveries. A Verified badge means the company has proved its identity to
          us, not that any transaction is guaranteed.
        </p>
        <p>
          Members may use contact details obtained here only for business-to-business trade inquiries relevant to the
          listed company's products. Bulk messaging, resale of the data, or use outside the produce trade ends the
          membership.
        </p>
        <p>Full terms and a privacy policy are published before paid plans open.</p>
      </div>
    </div>
  );
}
