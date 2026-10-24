#!/usr/bin/env bash
# Runs on the VPS after each push to main. Expects /srv/fruitterminal/.env to exist.
set -euo pipefail
ROOT=/srv/fruitterminal
IN=$ROOT/incoming
REL=$ROOT/releases/$(date +%Y%m%d%H%M%S)

mkdir -p "$REL/web" "$ROOT/releases"
tar xzf "$IN/web-bundle.tgz" -C "$REL/web"
tar xzf "$IN/scraper.tgz" -C "$REL"
cp "$ROOT/.env" "$REL/web/.env"

cd "$REL/web"
# The standalone bundle carries production deps; drizzle-kit/tsx are needed for migrations and db scripts.
npm install --no-save --omit=dev drizzle-kit tsx dotenv >/dev/null 2>&1
npx drizzle-kit migrate

ln -sfn "$REL" "$ROOT/current"
cd "$ROOT/current/web"
pm2 describe fruitterminal >/dev/null 2>&1 \
  && pm2 restart fruitterminal --update-env \
  || pm2 start server.js --name fruitterminal --cwd "$ROOT/current/web" -- --port "${PORT:-3010}"
pm2 save

# Scraper venv is rebuilt only when its dependencies change.
cd "$ROOT/current/scraper"
if [ ! -d "$ROOT/scraper-venv" ] || ! cmp -s pyproject.toml "$ROOT/scraper-venv/pyproject.toml"; then
  python3 -m venv "$ROOT/scraper-venv"
  "$ROOT/scraper-venv/bin/pip" install -q -e .
  cp pyproject.toml "$ROOT/scraper-venv/pyproject.toml"
fi
ln -sfn "$ROOT/.env" "$ROOT/current/scraper/.env"

# Keep the last 5 releases.
ls -1dt "$ROOT"/releases/* | tail -n +6 | xargs -r rm -rf
echo "Released $REL"
