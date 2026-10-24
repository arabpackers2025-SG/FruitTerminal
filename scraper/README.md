# Fruit Terminal scraper

Collects wholesale fruit terminal member lists and writes them to the
`staging_companies` table. Nothing goes live until an admin approves it.

```
python -m venv .venv && . .venv/bin/activate
pip install -e .
cp .env.example .env            # set DATABASE_URL
ft-scrape list
ft-scrape run toronto-ontario-food-terminal --dry   # print, don't save
ft-scrape run toronto-ontario-food-terminal         # save to staging
```

Add a terminal: create `fruitterminal_scraper/terminals/<name>.py` with
`SLUG` and `scrape()`, then register it in `terminals/__init__.py`.
Use `http.get()` for every request (it rate-limits per host) and keep
business contacts only.

Nightly run on the VPS (cron):
```
15 3 * * * cd /srv/fruitterminal/scraper && .venv/bin/ft-scrape run all >> /var/log/ft-scrape.log 2>&1
```
