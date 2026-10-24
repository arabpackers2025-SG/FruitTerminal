# One-time VPS setup for Fruit Terminal

Run once on the Bluehost VPS (Ubuntu) as the deploy user used by the other sites.

```bash
# 1. Postgres
sudo apt install -y postgresql python3-venv
sudo -u postgres psql -c "CREATE USER fruitterminal WITH PASSWORD '<strong password>';"
sudo -u postgres psql -c "CREATE DATABASE fruitterminal OWNER fruitterminal;"

# 2. Directories and env
sudo mkdir -p /srv/fruitterminal/incoming && sudo chown -R $USER /srv/fruitterminal
cat > /srv/fruitterminal/.env <<ENV
DATABASE_URL=postgresql://fruitterminal:<strong password>@localhost:5432/fruitterminal
SITE_URL=https://ft.saguenygroup.com
PORT=3010
SCRAPE_DELAY=2
ENV

# 3. Caddy: append deploy/Caddyfile.snippet to /etc/caddy/Caddyfile, reload caddy.
#    Point the DNS A record for ft.saguenygroup.com at the VPS IP first.

# 4. Nightly scraper + backups (crontab -e)
15 3 * * * cd /srv/fruitterminal/current/scraper && /srv/fruitterminal/scraper-venv/bin/ft-scrape run all >> /var/log/ft-scrape.log 2>&1
45 3 * * * pg_dump fruitterminal | gzip > /srv/fruitterminal/backups/$(date +\%F).sql.gz
```

GitHub repository secrets needed by the workflow: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
(the same three used by the Fraiza and Green Fields repos).

After the first deploy, seed the database once:
```bash
cd /srv/fruitterminal/current/web && npx tsx src/db/seed.ts
```
