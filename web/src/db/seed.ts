/* Seed: product taxonomy, first terminals, and the two founding exporters.
   Run: npm run db:seed  (idempotent: upserts by slug) */
import "dotenv/config";
import { db } from "./index";
import { terminals, companies, productCategories, companyProducts, profiles } from "./schema";
import { sql } from "drizzle-orm";

type Cat = { slug: string; name: string; children?: Cat[] };

const taxonomy: Cat[] = [
  {
    slug: "fruit",
    name: "Fruit",
    children: [
      { slug: "citrus", name: "Citrus", children: [
        { slug: "oranges", name: "Oranges" },
        { slug: "mandarins", name: "Mandarins & Clementines" },
        { slug: "lemons", name: "Lemons & Limes" },
        { slug: "grapefruit", name: "Grapefruit" },
      ]},
      { slug: "stone-fruit", name: "Stone fruit", children: [
        { slug: "peaches", name: "Peaches & Nectarines" },
        { slug: "plums", name: "Plums" },
        { slug: "apricots", name: "Apricots" },
        { slug: "cherries", name: "Cherries" },
      ]},
      { slug: "pome-fruit", name: "Pome fruit", children: [
        { slug: "apples", name: "Apples" },
        { slug: "pears", name: "Pears" },
      ]},
      { slug: "grapes", name: "Table grapes" },
      { slug: "berries", name: "Berries", children: [
        { slug: "strawberries", name: "Strawberries" },
        { slug: "blueberries", name: "Blueberries" },
        { slug: "raspberries", name: "Raspberries & Blackberries" },
      ]},
      { slug: "tropical", name: "Tropical", children: [
        { slug: "mangoes", name: "Mangoes" },
        { slug: "bananas", name: "Bananas" },
        { slug: "pineapples", name: "Pineapples" },
        { slug: "avocados", name: "Avocados" },
        { slug: "papaya", name: "Papaya" },
        { slug: "dates", name: "Dates" },
        { slug: "figs", name: "Figs" },
      ]},
      { slug: "melons", name: "Melons & Watermelons" },
      { slug: "pomegranates", name: "Pomegranates" },
      { slug: "kiwifruit", name: "Kiwifruit" },
    ],
  },
  {
    slug: "vegetables",
    name: "Vegetables",
    children: [
      { slug: "onions-garlic", name: "Onions & Garlic" },
      { slug: "potatoes", name: "Potatoes & Sweet potatoes" },
      { slug: "tomatoes", name: "Tomatoes" },
      { slug: "peppers", name: "Peppers" },
      { slug: "cucumbers", name: "Cucumbers & Courgettes" },
      { slug: "leafy-greens", name: "Leafy greens & Lettuce" },
      { slug: "brassicas", name: "Cabbage, Broccoli & Cauliflower" },
      { slug: "root-vegetables", name: "Carrots, Beets & Root vegetables" },
      { slug: "beans-peas", name: "Beans & Peas" },
      { slug: "herbs", name: "Fresh herbs" },
    ],
  },
  { slug: "dried-fruit-nuts", name: "Dried fruit & Nuts" },
  { slug: "frozen-produce", name: "Frozen fruit & vegetables" },
];

const terminalSeed = [
  {
    slug: "toronto-ontario-food-terminal",
    name: "Ontario Food Terminal",
    city: "Toronto", region: "Ontario", country: "CA",
    address: "165 The Queensway, Toronto, ON M8Y 1H8",
    lat: 43.6253, lng: -79.4866,
    hours: "Mon–Sat from 2:00 am; closed Sundays",
    website: "https://www.oftb.com",
    description: "Canada's largest wholesale fruit and produce distribution centre, with a warehouse tenant building and a farmers' market. Over 20 warehouse tenants supply retailers and foodservice across Ontario and eastern Canada.",
  },
  {
    slug: "montreal-marche-central",
    name: "Marché Central (Montreal produce district)",
    city: "Montreal", region: "Quebec", country: "CA",
    lat: 45.5300, lng: -73.6400,
    description: "Montreal's wholesale produce importers and distributors, concentrated around Marché Central and the Saint-Laurent/Ahuntsic distribution zone.",
  },
  {
    slug: "rungis",
    name: "Marché International de Rungis",
    city: "Rungis (Paris)", country: "FR",
    address: "1 rue de la Tour, 94150 Rungis",
    lat: 48.7556, lng: 2.3525,
    website: "https://www.rungisinternational.com",
    description: "The largest wholesale food market in the world, south of Paris. The fruit and vegetable sector covers several pavilions with hundreds of wholesalers and importers.",
  },
  {
    slug: "mercabarna",
    name: "Mercabarna",
    city: "Barcelona", country: "ES",
    address: "Carrer Major de Mercabarna 76, 08040 Barcelona",
    lat: 41.3322, lng: 2.1241,
    website: "https://www.mercabarna.es",
    description: "Barcelona's wholesale food hub and one of Europe's largest fruit and vegetable markets, with over 150 fruit and vegetable wholesalers.",
  },
  {
    slug: "mercamadrid",
    name: "Mercamadrid",
    city: "Madrid", country: "ES",
    address: "Av. de Madrid s/n, 28053 Madrid",
    lat: 40.3717, lng: -3.6639,
    website: "https://www.mercamadrid.es",
    description: "The largest wholesale market in Spain and a main redistribution point for fruit and vegetables across the Iberian Peninsula.",
  },
  {
    slug: "milan-sogemi",
    name: "SogeMi Ortomercato Milano",
    city: "Milan", country: "IT",
    address: "Via Cesare Lombroso 54, 20137 Milano",
    lat: 45.4523, lng: 9.2260,
    website: "https://www.sogemispa.it",
    description: "Milan's wholesale fruit and vegetable market, the largest in Italy by traded volume.",
  },
  {
    slug: "rotterdam-fresh-port",
    name: "Rotterdam fresh produce cluster",
    city: "Rotterdam", country: "NL",
    lat: 51.9050, lng: 4.3650,
    description: "The Netherlands' main entry point for overseas fruit, with importers clustered around the port, Barendrecht and the Westland greenhouse region.",
  },
  {
    slug: "london-new-covent-garden",
    name: "New Covent Garden Market",
    city: "London", country: "GB",
    address: "Nine Elms, London SW8 5BH",
    lat: 51.4810, lng: -0.1310,
    website: "https://www.newcoventgardenmarket.com",
    description: "The UK's largest wholesale fruit, vegetable and flower market, supplying London's restaurants, retailers and caterers.",
  },
  {
    slug: "new-york-hunts-point",
    name: "Hunts Point Produce Market",
    city: "New York", region: "NY", country: "US",
    address: "Hunts Point Terminal Market, Bronx, NY 10474",
    lat: 40.8080, lng: -73.8780,
    website: "https://www.huntspointproducemkt.com",
    description: "The largest wholesale produce market in the United States, with about 30 merchant companies supplying the New York metropolitan area.",
  },
  {
    slug: "dubai-al-aweer",
    name: "Al Aweer Fruit & Vegetable Market",
    city: "Dubai", country: "AE",
    lat: 25.1850, lng: 55.4130,
    description: "Dubai's central fruit and vegetable wholesale market and the main re-export hub for produce into the Gulf.",
  },
];

const founders = [
  {
    slug: "fraiza",
    name: "Fraiza",
    role: "SELLER" as const,
    country: "EG", city: "Cairo",
    website: "https://fraiza.com",
    email: "order@saguenygroup.com",
    description: "Egyptian grower and exporter of fresh fruit and vegetables, part of Sagueny Group. Citrus, grapes, pomegranates, onions and more, packed to export standards.",
    status: "VERIFIED" as const,
    products: ["oranges", "mandarins", "lemons", "grapes", "pomegranates", "onions-garlic", "potatoes", "strawberries"],
    profile: {
      certifications: ["GlobalG.A.P.", "ISO 22000"],
      exportMarkets: ["EU", "Gulf", "Russia", "Canada"],
      packingDetails: "Telescopic cartons 15 kg (citrus), open-top 4.5 kg (grapes), 25 kg mesh bags (onions). Pallets 1.0 × 1.2 m, cold chain from packhouse.",
    },
  },
  {
    slug: "green-fields",
    name: "Green Fields Food Industries",
    role: "SELLER" as const,
    country: "EG", city: "Cairo",
    website: "https://www.green-fields.org",
    email: "order@saguenygroup.com",
    description: "Egyptian food industries group exporting fresh and processed produce, part of Sagueny Group.",
    status: "VERIFIED" as const,
    products: ["dates", "figs", "dried-fruit-nuts", "frozen-produce", "herbs", "oranges"],
    profile: {
      certifications: ["ISO 22000", "HACCP"],
      exportMarkets: ["EU", "Gulf", "North America"],
    },
  },
];

async function upsertCategories(cats: Cat[], parentId: string | null) {
  for (const c of cats) {
    const [row] = await db
      .insert(productCategories)
      .values({ slug: c.slug, name: c.name, parentId })
      .onConflictDoUpdate({ target: productCategories.slug, set: { name: c.name, parentId } })
      .returning({ id: productCategories.id });
    if (c.children) await upsertCategories(c.children, row.id);
  }
}

async function main() {
  await upsertCategories(taxonomy, null);

  for (const t of terminalSeed) {
    await db
      .insert(terminals)
      .values(t)
      .onConflictDoUpdate({ target: terminals.slug, set: { ...t, updatedAt: sql`now()` } });
  }

  for (const f of founders) {
    const { products, profile, ...company } = f;
    const [row] = await db
      .insert(companies)
      .values({ ...company, source: "founder" })
      .onConflictDoUpdate({ target: companies.slug, set: { ...company, updatedAt: sql`now()` } })
      .returning({ id: companies.id });

    await db
      .insert(profiles)
      .values({ companyId: row.id, ...profile })
      .onConflictDoUpdate({ target: profiles.companyId, set: profile });

    for (const slug of products) {
      const cat = await db.query.productCategories.findFirst({
        where: (c, { eq }) => eq(c.slug, slug),
      });
      if (!cat) continue;
      await db
        .insert(companyProducts)
        .values({ companyId: row.id, categoryId: cat.id, direction: "SELLS" })
        .onConflictDoNothing();
    }
  }

  console.log(
    `Seeded ${terminalSeed.length} terminals, ${founders.length} founding exporters, taxonomy ready.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
