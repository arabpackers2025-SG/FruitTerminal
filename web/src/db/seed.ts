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

  // --- Europe ---
  { slug: "valencia-mercavalencia", name: "Mercavalencia", city: "Valencia", country: "ES", lat: 39.4556, lng: -0.3787, description: "Valencia's wholesale market, close to the Mediterranean citrus and vegetable region." },
  { slug: "lyon-corbas", name: "Marché de Gros de Lyon-Corbas", city: "Lyon", country: "FR", lat: 45.6667, lng: 4.9167, description: "The wholesale produce market serving Lyon and the Rhône-Alpes region." },
  { slug: "marseille-les-arnavaux", name: "Marché d'Intérêt National Les Arnavaux", city: "Marseille", country: "FR", lat: 43.3411, lng: 5.3860, description: "Marseille's wholesale market, a gateway for produce from the western Mediterranean and North Africa." },
  { slug: "rome-car", name: "CAR — Centro Agroalimentare Roma", city: "Rome", country: "IT", lat: 41.8333, lng: 12.6333, description: "Rome's agri-food wholesale centre, one of the largest in central Italy." },
  { slug: "bologna-caab", name: "CAAB — Centro Agroalimentare di Bologna", city: "Bologna", country: "IT", lat: 44.5190, lng: 11.3870, description: "The wholesale agri-food market for Bologna and Emilia-Romagna." },
  { slug: "naples-caan", name: "CAAN — Centro Agro Alimentare di Napoli", city: "Naples", country: "IT", lat: 40.9000, lng: 14.3000, description: "Naples' wholesale produce centre serving the Campania region." },
  { slug: "amsterdam-food-center", name: "Food Center Amsterdam", city: "Amsterdam", country: "NL", lat: 52.3850, lng: 4.8350, description: "Amsterdam's wholesale food market." },
  { slug: "hamburg-grossmarkt", name: "Großmarkt Hamburg", city: "Hamburg", country: "DE", lat: 53.5450, lng: 10.0300, description: "Hamburg's wholesale market, a major northern-European entry point for imported fruit." },
  { slug: "berlin-fruchthof", name: "Fruchthof Berlin (Großmarkt)", city: "Berlin", country: "DE", lat: 52.4700, lng: 13.4600, description: "Berlin's central wholesale fruit and vegetable market." },
  { slug: "munich-grossmarkthalle", name: "Großmarkthalle München", city: "Munich", country: "DE", lat: 48.1180, lng: 11.5470, description: "Munich's wholesale market hall, among the largest in Germany." },
  { slug: "frankfurt-frischezentrum", name: "FrischeZentrum Frankfurt", city: "Frankfurt", country: "DE", lat: 50.1100, lng: 8.7200, description: "Frankfurt's fresh-produce wholesale centre." },
  { slug: "london-western-international", name: "Western International Market", city: "London", country: "GB", lat: 51.4890, lng: -0.4100, description: "West London's wholesale fruit and vegetable market at Southall." },
  { slug: "manchester-new-smithfield", name: "New Smithfield Market", city: "Manchester", country: "GB", lat: 53.4660, lng: -2.1760, description: "Manchester's wholesale market, the main produce hub for north-west England." },
  { slug: "brussels-mabru", name: "Mabru — Brussels Early Market", city: "Brussels", country: "BE", lat: 50.8730, lng: 4.3690, description: "Brussels' wholesale fruit and vegetable market." },
  { slug: "warsaw-bronisze", name: "Warsaw Wholesale Market Bronisze", city: "Warsaw", country: "PL", lat: 52.2100, lng: 20.7800, description: "Poland's largest wholesale market for fruit, vegetables and flowers." },
  { slug: "lisbon-marl", name: "MARL — Mercado Abastecedor de Lisboa", city: "Lisbon", country: "PT", lat: 38.8300, lng: -9.0900, description: "The wholesale supply market for the Lisbon region." },
  { slug: "athens-central-market", name: "Athens Central Market (Varvakios / Rentis)", city: "Athens", country: "GR", lat: 37.9800, lng: 23.7000, description: "Athens' central wholesale produce market." },
  { slug: "vienna-grossmarkt", name: "Großmarkt Wien-Inzersdorf", city: "Vienna", country: "AT", lat: 48.1500, lng: 16.3400, description: "Vienna's wholesale market for fruit and vegetables." },

  // --- United States ---
  { slug: "philadelphia-psm", name: "Philadelphia Wholesale Produce Market", city: "Philadelphia", region: "PA", country: "US", lat: 39.9100, lng: -75.2200, description: "One of the largest fully enclosed, refrigerated wholesale produce markets in the world." },
  { slug: "boston-nepc", name: "New England Produce Center", city: "Chelsea", region: "MA", country: "US", lat: 42.3900, lng: -71.0400, description: "The wholesale produce market serving Boston and New England." },
  { slug: "chicago-ipm", name: "Chicago International Produce Market", city: "Chicago", region: "IL", country: "US", lat: 41.8500, lng: -87.6600, description: "Chicago's wholesale produce market." },
  { slug: "los-angeles-wholesale-produce", name: "Los Angeles Wholesale Produce Market", city: "Los Angeles", region: "CA", country: "US", lat: 34.0350, lng: -118.2300, description: "Downtown LA's wholesale produce market." },
  { slug: "san-francisco-wholesale-produce", name: "San Francisco Wholesale Produce Market", city: "San Francisco", region: "CA", country: "US", lat: 37.7400, lng: -122.4000, description: "The Bay Area's wholesale produce market." },
  { slug: "atlanta-state-farmers-market", name: "Atlanta State Farmers Market", city: "Forest Park", region: "GA", country: "US", lat: 33.6200, lng: -84.3700, description: "One of the largest farmers' and wholesale produce markets in the US South." },
  { slug: "dallas-farmers-wholesale", name: "Dallas Wholesale Produce District", city: "Dallas", region: "TX", country: "US", lat: 32.7800, lng: -96.7900, description: "Dallas-Fort Worth's wholesale produce distribution district." },

  // --- Far East & South Asia ---
  { slug: "singapore-pasir-panjang", name: "Pasir Panjang Wholesale Centre", city: "Singapore", country: "SG", lat: 1.2800, lng: 103.7700, description: "Singapore's main wholesale centre for fruit and vegetables and a regional re-export hub." },
  { slug: "guangzhou-jiangnan", name: "Jiangnan Fruit & Vegetable Wholesale Market", city: "Guangzhou", country: "CN", lat: 23.0800, lng: 113.2700, description: "One of the largest fruit wholesale markets in China and Asia." },
  { slug: "shanghai-huizhan", name: "Shanghai Huizhan Fruit Market", city: "Shanghai", country: "CN", lat: 31.2000, lng: 121.5000, description: "A major fruit wholesale market serving the Shanghai region." },
  { slug: "beijing-xinfadi", name: "Xinfadi Wholesale Market", city: "Beijing", country: "CN", lat: 39.8100, lng: 116.3200, description: "Beijing's largest wholesale market for agricultural produce." },
  { slug: "mumbai-vashi-apmc", name: "Vashi APMC Market", city: "Navi Mumbai", country: "IN", lat: 19.0700, lng: 73.0000, description: "The APMC wholesale market serving Mumbai, among India's largest." },
  { slug: "delhi-azadpur", name: "Azadpur Mandi", city: "Delhi", country: "IN", lat: 28.7070, lng: 77.1750, description: "Asia's largest wholesale market for fruit and vegetables." },
  { slug: "chennai-koyambedu", name: "Koyambedu Market", city: "Chennai", country: "IN", lat: 13.0700, lng: 80.1900, description: "One of Asia's largest perishable goods wholesale markets, serving South India." },
  { slug: "kuala-lumpur-selayang", name: "Selayang Wholesale Market", city: "Kuala Lumpur", country: "MY", lat: 3.2500, lng: 101.6500, description: "Malaysia's largest wholesale market for fruit and vegetables." },
  { slug: "jakarta-kramat-jati", name: "Kramat Jati Central Market", city: "Jakarta", country: "ID", lat: -6.2800, lng: 106.8700, description: "Jakarta's central wholesale market for fruit and vegetables." },
  { slug: "manila-balintawak", name: "Balintawak Market", city: "Quezon City", country: "PH", lat: 14.6570, lng: 121.0000, description: "Metro Manila's major wholesale market for produce." },
  { slug: "ho-chi-minh-thu-duc", name: "Thu Duc Wholesale Market", city: "Ho Chi Minh City", country: "VN", lat: 10.8500, lng: 106.7700, description: "Ho Chi Minh City's largest wholesale market for fruit and vegetables." },
  { slug: "bangkok-talaad-thai", name: "Talaad Thai", city: "Pathum Thani", country: "TH", lat: 14.0700, lng: 100.6200, description: "Thailand's largest wholesale market for agricultural produce, north of Bangkok." },

  // --- Australia ---
  { slug: "sydney-markets-flemington", name: "Sydney Markets (Flemington)", city: "Sydney", country: "AU", lat: -33.8700, lng: 151.0600, description: "Australia's largest fruit and vegetable wholesale market." },
  { slug: "melbourne-market-epping", name: "Melbourne Market", city: "Epping", country: "AU", lat: -37.6400, lng: 145.0200, description: "The wholesale fruit, vegetable and flower market for Victoria." },
  { slug: "brisbane-markets-rocklea", name: "Brisbane Markets (Rocklea)", city: "Brisbane", country: "AU", lat: -27.5500, lng: 153.0100, description: "Queensland's central fruit and vegetable wholesale market." },
  { slug: "perth-market-city", name: "Market City (Canning Vale)", city: "Perth", country: "AU", lat: -32.0700, lng: 115.9100, description: "Western Australia's wholesale fruit and vegetable market." },
  { slug: "adelaide-produce-market", name: "South Australian Produce Market", city: "Pooraka", country: "AU", lat: -34.8300, lng: 138.6200, description: "South Australia's central wholesale produce market." },

  // --- Gulf & Middle East ---
  { slug: "abu-dhabi-mina", name: "Mina Fruit & Vegetable Market", city: "Abu Dhabi", country: "AE", lat: 24.5100, lng: 54.3800, description: "Abu Dhabi's central wholesale market for fruit and vegetables." },
  { slug: "riyadh-central-market", name: "Riyadh Central Wholesale Market", city: "Riyadh", country: "SA", lat: 24.6300, lng: 46.7700, description: "Riyadh's wholesale market for fruit and vegetables." },
  { slug: "jeddah-central-market", name: "Jeddah Central Vegetable & Fruit Market", city: "Jeddah", country: "SA", lat: 21.5400, lng: 39.2000, description: "Jeddah's wholesale produce market, a Red Sea import hub." },
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
