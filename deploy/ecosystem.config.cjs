// PM2 process definition, started by deploy/remote-deploy.sh. The app's environment comes from
// $APP_DIR/.env.production (written on the first deploy) plus $APP_DIR/app-secrets.env (the APP_* GitHub secrets).
const fs = require("node:fs");
const path = require("node:path");

const appDir = process.env.APP_DIR || "/var/www/app";
const subdir = process.env.APP_SUBDIR || "";
const env = { NODE_ENV: "production", PORT: process.env.APP_PORT || "3000" };
for (const file of [".env.production", "app-secrets.env"]) {
  const p = path.join(appDir, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    let v = m[2];
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1).replace(/\\(['"\\$])/g, "$1");
    env[m[1]] = v;
  }
}

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME || "app",
      cwd: path.join(appDir, "app", subdir),
      script: process.env.START_SCRIPT || "src/index.js",
      args: process.env.START_ARGS || "",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "700M",
      env,
    },
  ],
};
