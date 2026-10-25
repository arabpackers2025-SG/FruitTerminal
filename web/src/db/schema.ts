import {
  pgTable,
  pgEnum,
  text,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const id = () =>
  text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

export const companyRole = pgEnum("company_role", ["BUYER", "SELLER", "BOTH"]);
export const companyStatus = pgEnum("company_status", ["UNCLAIMED", "CLAIMED", "VERIFIED"]);
export const reviewStatus = pgEnum("review_status", ["PENDING", "APPROVED", "REJECTED"]);
export const direction = pgEnum("direction", ["SELLS", "BUYS"]);
export const leadStatus = pgEnum("lead_status", ["ACTIVE", "CLOSED", "EXPIRED"]);
export const userRole = pgEnum("user_role", ["OWNER", "STAFF", "ADMIN"]);
export const plan = pgEnum("plan", ["FREE", "SELLER_PRO", "BUYER_PRO"]);
export const subscriptionStatus = pgEnum("subscription_status", ["ACTIVE", "PAST_DUE", "CANCELED"]);
export const claimStatus = pgEnum("claim_status", ["PENDING", "APPROVED", "REJECTED"]);

export const terminals = pgTable(
  "terminals",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    region: text("region"),
    country: text("country").notNull(), // ISO 3166-1 alpha-2
    address: text("address"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    hours: text("hours"),
    website: text("website"),
    phone: text("phone"),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("terminals_country_idx").on(t.country)],
);

export const companies = pgTable(
  "companies",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    role: companyRole("role").notNull().default("BUYER"),
    country: text("country").notNull(),
    city: text("city"),
    address: text("address"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    logoUrl: text("logo_url"),
    description: text("description"),
    stall: text("stall"),
    status: companyStatus("status").notNull().default("UNCLAIMED"),
    source: text("source"),
    sourceUrl: text("source_url"),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }),
    terminalId: text("terminal_id").references(() => terminals.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("companies_country_idx").on(t.country),
    index("companies_role_idx").on(t.role),
    index("companies_terminal_idx").on(t.terminalId),
    index("companies_name_idx").on(t.name),
  ],
);

export const profiles = pgTable("profiles", {
  id: id(),
  companyId: text("company_id")
    .notNull()
    .unique()
    .references(() => companies.id, { onDelete: "cascade" }),
  photos: text("photos").array().notNull().default(sql`'{}'::text[]`),
  certifications: text("certifications").array().notNull().default(sql`'{}'::text[]`),
  packingDetails: text("packing_details"),
  exportMarkets: text("export_markets").array().notNull().default(sql`'{}'::text[]`),
  capacity: text("capacity"),
  yearFounded: integer("year_founded"),
  employees: text("employees"),
  updatedAt: updatedAt(),
});

export const productCategories = pgTable("product_categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
});

export const companyProducts = pgTable(
  "company_products",
  {
    id: id(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => productCategories.id),
    direction: direction("direction").notNull(),
    seasonFrom: integer("season_from"),
    seasonTo: integer("season_to"),
  },
  (t) => [
    uniqueIndex("company_products_unique").on(t.companyId, t.categoryId, t.direction),
    index("company_products_category_idx").on(t.categoryId),
  ],
);

export const offers = pgTable(
  "offers",
  {
    id: id(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => productCategories.id),
    title: text("title").notNull(),
    quantity: text("quantity"),
    origin: text("origin"),
    availableFrom: timestamp("available_from", { withTimezone: true }),
    availableTo: timestamp("available_to", { withTimezone: true }),
    priceTerms: text("price_terms"),
    details: text("details"),
    status: leadStatus("status").notNull().default("ACTIVE"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("offers_category_status_idx").on(t.categoryId, t.status)],
);

export const buyRequests = pgTable(
  "buy_requests",
  {
    id: id(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => productCategories.id),
    title: text("title").notNull(),
    quantity: text("quantity"),
    destination: text("destination"),
    neededBy: timestamp("needed_by", { withTimezone: true }),
    details: text("details"),
    status: leadStatus("status").notNull().default("ACTIVE"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("buy_requests_category_status_idx").on(t.categoryId, t.status)],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: id(),
    fromCompanyId: text("from_company_id")
      .notNull()
      .references(() => companies.id),
    toCompanyId: text("to_company_id")
      .notNull()
      .references(() => companies.id),
    offerId: text("offer_id").references(() => offers.id),
    requestId: text("request_id").references(() => buyRequests.id),
    message: text("message").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("inquiries_from_created_idx").on(t.fromCompanyId, t.createdAt),
    index("inquiries_to_idx").on(t.toCompanyId),
  ],
);

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  role: userRole("role").notNull().default("OWNER"),
  companyId: text("company_id").references(() => companies.id),
  createdAt: createdAt(),
});

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  companyId: text("company_id")
    .notNull()
    .unique()
    .references(() => companies.id, { onDelete: "cascade" }),
  plan: plan("plan").notNull().default("FREE"),
  status: subscriptionStatus("status").notNull().default("ACTIVE"),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubId: text("stripe_sub_id"),
  updatedAt: updatedAt(),
});

export const claimRequests = pgTable("claim_requests", {
  id: id(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  proof: text("proof"),
  status: claimStatus("status").notNull().default("PENDING"),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: id(), // the session token (random), stored in an httpOnly cookie
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Rows written by the scraper; an admin approves them into `companies`. */
export const stagingCompanies = pgTable(
  "staging_companies",
  {
    id: id(),
    name: text("name").notNull(),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    stall: text("stall"),
    products: text("products"),
    country: text("country"),
    city: text("city"),
    terminalSlug: text("terminal_slug"),
    source: text("source").notNull(),
    sourceUrl: text("source_url"),
    raw: jsonb("raw"),
    review: reviewStatus("review").notNull().default("PENDING"),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("staging_source_name_unique").on(t.source, t.name)],
);

// Relations
export const terminalsRelations = relations(terminals, ({ many }) => ({
  companies: many(companies),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  terminal: one(terminals, { fields: [companies.terminalId], references: [terminals.id] }),
  profile: one(profiles, { fields: [companies.id], references: [profiles.companyId] }),
  products: many(companyProducts),
  offers: many(offers),
  requests: many(buyRequests),
  subscription: one(subscriptions, { fields: [companies.id], references: [subscriptions.companyId] }),
  sentInquiries: many(inquiries, { relationName: "from" }),
  receivedInquiries: many(inquiries, { relationName: "to" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  company: one(companies, { fields: [profiles.companyId], references: [companies.id] }),
}));

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  parent: one(productCategories, {
    fields: [productCategories.parentId],
    references: [productCategories.id],
    relationName: "tree",
  }),
  children: many(productCategories, { relationName: "tree" }),
  companies: many(companyProducts),
}));

export const companyProductsRelations = relations(companyProducts, ({ one }) => ({
  company: one(companies, { fields: [companyProducts.companyId], references: [companies.id] }),
  category: one(productCategories, {
    fields: [companyProducts.categoryId],
    references: [productCategories.id],
  }),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  company: one(companies, { fields: [offers.companyId], references: [companies.id] }),
  category: one(productCategories, { fields: [offers.categoryId], references: [productCategories.id] }),
}));

export const buyRequestsRelations = relations(buyRequests, ({ one }) => ({
  company: one(companies, { fields: [buyRequests.companyId], references: [companies.id] }),
  category: one(productCategories, {
    fields: [buyRequests.categoryId],
    references: [productCategories.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  fromCompany: one(companies, { fields: [inquiries.fromCompanyId], references: [companies.id], relationName: "from" }),
  toCompany: one(companies, { fields: [inquiries.toCompanyId], references: [companies.id], relationName: "to" }),
  offer: one(offers, { fields: [inquiries.offerId], references: [offers.id] }),
  request: one(buyRequests, { fields: [inquiries.requestId], references: [buyRequests.id] }),
}));

export const claimRequestsRelations = relations(claimRequests, ({ one }) => ({
  company: one(companies, { fields: [claimRequests.companyId], references: [companies.id] }),
  user: one(users, { fields: [claimRequests.userId], references: [users.id] }),
}));
