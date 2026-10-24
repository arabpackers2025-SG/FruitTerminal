# Fruit Terminal

B2B marketplace linking fruit and vegetable exporters with the wholesale fruit
terminals and importers that buy from them. Operated by Sagueny Group.

| Folder | What it is |
| --- | --- |
| `web/` | Next.js app (public directory, member area, admin). Postgres via Drizzle ORM. |
| `scraper/` | Python service using Scrapling. Collects terminal member lists into `staging_companies` for admin approval. |
| `deploy/` | Release script, Caddy snippet and one-time VPS setup notes. |
| `.github/workflows/deploy.yml` | Push to `main` → build → upload to the VPS → migrate → restart under PM2. |

## Run locally

```bash
cd web
cp .env.example .env            # Postgres connection string
npm install
npm run db:migrate
npm run db:seed                 # taxonomy, first terminals, Fraiza and Green Fields
npm run dev                     # http://localhost:3000
```

Scraper: see `scraper/README.md`. Approve scraped rows with
`npm run staging:list` / `npm run staging:approve -- all` inside `web/`.

## Status

Phase 1 (public site) is built: terminal pages, buyer and exporter directories
with filters, company profiles with masked contacts, product category pages,
pricing and about pages, sitemap. Phases 2–4 (accounts and claims, paid plans,
data scale-out) follow the foundation document.
