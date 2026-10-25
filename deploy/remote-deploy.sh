#!/usr/bin/env bash
# Runs ON THE SERVER after the source has been synced to $APP_DIR/app by the "Deploy to VPS" workflow.
# First run provisions (Node, PM2, env file, web front); later runs rebuild and reload without downtime.
# App-specific settings live in deploy/app.conf next to this file (name, port, build and start commands, env).
#   APP_DIR=/var/www/<app> DOMAIN=<domain> bash deploy/remote-deploy.sh
set -euo pipefail
APP_DIR="${APP_DIR:?APP_DIR is required}"
DOMAIN="${DOMAIN:?DOMAIN is required}"
cd "$APP_DIR/app"
# shellcheck source=app.conf
. deploy/app.conf
: "${APP_NAME:?app.conf must set APP_NAME}" "${APP_PORT:?app.conf must set APP_PORT}" "${START_SCRIPT:?app.conf must set START_SCRIPT}"
APP_SUBDIR="${APP_SUBDIR:-}"; START_ARGS="${START_ARGS:-}"; HEALTH_PATH="${HEALTH_PATH:-/}"; MAX_BODY="${MAX_BODY:-50MiB}"; BUILD_CMD="${BUILD_CMD:-npm ci --no-audit --no-fund}"
export DEBIAN_FRONTEND=noninteractive
# www.<domain> only for an apex domain (example.com); a staging host like new.example.com gets no www.
case "$DOMAIN" in *.*.*) WWW="";; *) WWW="www.$DOMAIN";; esac
pkg() { if command -v apt-get >/dev/null; then apt-get install -y -qq "$@"; else dnf install -y -q "$@"; fi; }

echo "==> Runtime"
if ! command -v node >/dev/null; then
  if command -v apt-get >/dev/null; then apt-get update -y -qq; pkg curl git build-essential; curl -fsSL https://deb.nodesource.com/setup_22.x | bash -; pkg nodejs
  else pkg curl git gcc-c++ make; curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -; pkg nodejs; fi
fi
command -v pm2 >/dev/null || npm install -g pm2 >/dev/null
echo "node $(node -v), pm2 $(pm2 -v)"

echo "==> Environment"
mkdir -p "$APP_DIR/data"
ENV_FILE="$APP_DIR/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  { echo "NODE_ENV=production"; echo "PORT=$APP_PORT"; echo "HOST=0.0.0.0"; echo "APP_URL=https://$DOMAIN"; } > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi
# app.conf may add settings (generated secrets, data paths); only lines whose key is missing are appended.
if declare -F env_defaults >/dev/null; then
  env_defaults | while IFS= read -r line; do
    key="${line%%=*}"; [ -n "$key" ] || continue
    grep -q "^$key=" "$ENV_FILE" || echo "$line" >> "$ENV_FILE"
  done
fi
if declare -F pre_build >/dev/null; then echo "==> Pre-build hook"; pre_build; fi

echo "==> Dependencies and build"
( cd "$APP_DIR/app/$APP_SUBDIR" && bash -c "$BUILD_CMD" )

if declare -F pre_start >/dev/null; then echo "==> Pre-start hook"; pre_start; fi

echo "==> Starting / reloading $APP_NAME under PM2 on port $APP_PORT"
APP_DIR="$APP_DIR" APP_NAME="$APP_NAME" APP_PORT="$APP_PORT" APP_SUBDIR="$APP_SUBDIR" START_SCRIPT="$START_SCRIPT" START_ARGS="$START_ARGS" pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save >/dev/null
pm2 startup systemd -u "$(whoami)" --hp "$HOME" >/dev/null 2>&1 || true
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:$APP_PORT$HEALTH_PATH" || true)
  case "$code" in 2*|3*|401|403) break;; esac; sleep 1
done
echo "app http://127.0.0.1:$APP_PORT$HEALTH_PATH -> ${code:-no answer}"
case "${code:-}" in 2*|3*|401|403) ;; *) echo "!! The app did not answer. Last log lines:"; pm2 logs "$APP_NAME" --nostream --lines 40 || true; exit 1;; esac

echo "==> Web front"
# 1) The server's shared web front (/opt/proxy with the `proxy` command): one Caddy for every site, managed only
#    through `proxy site add <name> <file>`, which validates with the other sites and reloads without downtime.
if command -v proxy >/dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^proxy-caddy$'; then
  caddy_c=proxy-caddy
  # Let Caddy's container reach the app on the host: open the port to Docker's networks in ufw and find the gateway.
  if command -v ufw >/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
    for subnet in $(docker network inspect $(docker network ls -q) -f '{{range .IPAM.Config}}{{.Subnet}} {{end}}' 2>/dev/null); do
      ufw allow from "$subnet" to any port "$APP_PORT" proto tcp >/dev/null 2>&1 || true
    done
  fi
  gw=""
  for cand in $(docker inspect -f '{{range .NetworkSettings.Networks}}{{.Gateway}} {{end}}' "$caddy_c") 172.17.0.1; do
    code=$(docker exec "$caddy_c" wget -q -O /dev/null -S --timeout=5 "http://$cand:$APP_PORT$HEALTH_PATH" 2>&1 | awk '/HTTP\//{print $2; exit}' || true)
    echo "probe $cand:$APP_PORT from caddy -> ${code:-no response}"
    case "$code" in 2*|3*|401|403) gw="$cand"; break;; esac
  done
  [ -n "$gw" ] || { echo "!! Caddy cannot reach the app on the host."; ufw status 2>/dev/null | head -20; exit 1; }
  site="$APP_DIR/$APP_NAME.caddy"
  cat > "$site" <<CADDY
# $APP_NAME ($APP_DIR, PM2 on the host). Installed by deploy/remote-deploy.sh with: proxy site add $APP_NAME $site
$DOMAIN {
	import common
	request_body {
		max_size $MAX_BODY
	}
	reverse_proxy $gw:$APP_PORT
}
CADDY
  if [ -n "$WWW" ]; then printf '\n%s {\n\tredir https://%s{uri} permanent\n}\n' "$WWW" "$DOMAIN" >> "$site"; fi
  installed="/opt/proxy/caddy/sites/$APP_NAME.caddy"
  if [ -f "$installed" ] && cmp -s "$site" "$installed"; then
    echo "Web front: $DOMAIN already routed to $gw:$APP_PORT (unchanged)."
  else
    # `proxy site add` validates, installs and reloads, then checks every site. A site whose DNS is not pointed here
    # yet (no certificate possible) fails that last check; that is a warning, not a failed deploy, once installed.
    if ! proxy site add "$APP_NAME" "$site"; then
      if [ -f "$installed" ] && cmp -s "$site" "$installed"; then
        echo "::warning::Caddy block for $DOMAIN is installed, but the proxy's site check reported a problem (often: DNS for $DOMAIN does not point at this server yet, so no certificate)."
      else
        echo "!! proxy site add failed and the block was not installed."; exit 1
      fi
    fi
  fi
  sleep 3
  dns=$(getent ahostsv4 "$DOMAIN" | awk '{print $1; exit}' || true)
  me=$(curl -fsS -4 --max-time 10 https://api.ipify.org 2>/dev/null || true)
  if [ -n "$me" ] && [ "$dns" != "$me" ]; then
    echo "::warning::DNS for $DOMAIN points to '${dns:-nothing}', this server is $me. Add an A record for $DOMAIN -> $me; Caddy then issues the certificate by itself."
  fi
else
  # 2) No shared front: the usual single-server options (another Dockerised Caddy, Apache, or nginx + certbot).
  holder=$(ss -ltnp 2>/dev/null | awk '$4 ~ /:80$/ {print $NF}' | head -1 || true)
  caddy_c=$(docker ps --format '{{.Names}} {{.Image}}' 2>/dev/null | awk '$2 ~ /caddy/ {print $1; exit}' || true)
  if [ -n "$caddy_c" ] && echo "$holder" | grep -qi docker; then
    cf=$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}' "$caddy_c")
    [ -n "$cf" ] && [ -f "$cf" ] || { echo "!! A Caddy container owns port 80 but its Caddyfile was not found. Mounts:"; docker inspect -f '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}' "$caddy_c"; exit 1; }
    if command -v ufw >/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
      for subnet in $(docker network inspect $(docker network ls -q) -f '{{range .IPAM.Config}}{{.Subnet}} {{end}}' 2>/dev/null); do ufw allow from "$subnet" to any port "$APP_PORT" proto tcp >/dev/null 2>&1 || true; done
    fi
    gw=""
    for cand in $(docker inspect -f '{{range .NetworkSettings.Networks}}{{.Gateway}} {{end}}' "$caddy_c") 172.17.0.1; do
      code=$(docker exec "$caddy_c" wget -q -O /dev/null -S --timeout=5 "http://$cand:$APP_PORT$HEALTH_PATH" 2>&1 | awk '/HTTP\//{print $2; exit}' || true)
      case "$code" in 2*|3*|401|403) gw="$cand"; break;; esac
    done
    [ -n "$gw" ] || { echo "!! Caddy cannot reach the app on the host."; exit 1; }
    if grep -qE "(^|[[:space:],])(www\.)?$DOMAIN([[:space:],:{]|$)" "$cf" || grep -rqsE "(^|[[:space:],])(www\.)?$DOMAIN([[:space:],:{]|$)" "$(dirname "$cf")"; then
      echo "$DOMAIN is already configured in the Caddy config; keeping it."
    else
      mkdir -p "$APP_DIR/caddy-backups"; backup="$APP_DIR/caddy-backups/Caddyfile.$(date +%Y%m%d%H%M%S)"; cp "$cf" "$backup"
      common=""; grep -q "^(common)" "$cf" && common="    import common"
      printf '\n%s {\n%s\n    request_body {\n        max_size %s\n    }\n    reverse_proxy %s:%s\n}\n' "$DOMAIN" "$common" "$MAX_BODY" "$gw" "$APP_PORT" >> "$cf"
      if [ -n "$WWW" ]; then printf '\n%s {\n    redir https://%s{uri} permanent\n}\n' "$WWW" "$DOMAIN" >> "$cf"; fi
      if docker exec "$caddy_c" caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1; then docker exec "$caddy_c" caddy reload --config /etc/caddy/Caddyfile
      else docker exec "$caddy_c" caddy validate --config /etc/caddy/Caddyfile 2>&1 | tail -3; cp "$backup" "$cf"; echo "!! Restored the Caddyfile"; exit 1; fi
      sleep 3
    fi
  elif systemctl is-active --quiet apache2 2>/dev/null || systemctl is-active --quiet httpd 2>/dev/null; then
    pkg certbot python3-certbot-apache >/dev/null 2>&1 || true
    conf_dir=$([ -d /etc/apache2/sites-available ] && echo /etc/apache2/sites-available || echo /etc/httpd/conf.d)
    if [ ! -f "$conf_dir/$APP_NAME.conf" ]; then
      printf '<VirtualHost *:80>\n  ServerName %s\n  %b  ProxyPreserveHost On\n  ProxyPass / http://127.0.0.1:%s/\n  ProxyPassReverse / http://127.0.0.1:%s/\n</VirtualHost>\n' "$DOMAIN" "${WWW:+  ServerAlias $WWW\n}" "$APP_PORT" "$APP_PORT" > "$conf_dir/$APP_NAME.conf"
      if command -v a2enmod >/dev/null; then a2enmod -q proxy proxy_http headers rewrite >/dev/null; a2ensite -q "$APP_NAME.conf" >/dev/null; fi
      (apachectl configtest && systemctl reload apache2 2>/dev/null) || systemctl reload httpd
    fi
    grep -q "SSLCertificateFile" "$conf_dir"/$APP_NAME*.conf 2>/dev/null || certbot --apache -d "$DOMAIN" ${WWW:+-d "$WWW"} --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect || echo "!! certbot failed (DNS not propagated yet?). Re-run the deploy later."
  else
    pkg nginx certbot python3-certbot-nginx >/dev/null 2>&1 || true
    [ -f /etc/nginx/sites-enabled/default ] && rm -f /etc/nginx/sites-enabled/default || true
    printf 'server {\n  listen 80;\n  server_name %s %s;\n  client_max_body_size %s;\n  location / {\n    proxy_pass http://127.0.0.1:%s;\n    proxy_http_version 1.1;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    proxy_set_header X-Forwarded-Proto $scheme;\n    proxy_read_timeout 120s;\n  }\n}\n' "$DOMAIN" "$WWW" "${MAX_BODY%iB}" "$APP_PORT" > "/etc/nginx/conf.d/$APP_NAME.conf"
    nginx -t && systemctl enable --now nginx >/dev/null 2>&1 && systemctl reload nginx
    grep -q "ssl_certificate" "/etc/nginx/conf.d/$APP_NAME.conf" || certbot --nginx -d "$DOMAIN" ${WWW:+-d "$WWW"} --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect || echo "!! certbot failed (DNS not propagated yet?). Re-run the deploy later."
  fi
fi

echo "==> Certificate status for $DOMAIN"
echo "DNS: $(getent ahostsv4 "$DOMAIN" | awk '{print $1; exit}')"
docker logs --since 30m proxy-caddy 2>&1 | grep -i "$DOMAIN" | grep -iE "certificate|obtain|error|challenge|acme" | tail -6 | cut -c1-260 || true
echo "==> Deployed. Health check:"
curl -s -o /dev/null -w "https://$DOMAIN$HEALTH_PATH -> %{http_code}\n" --max-time 20 "https://$DOMAIN$HEALTH_PATH" || true
