#!/bin/sh
set -e
cd /app/api
node dist/db/migrate.js
node dist/server.js &
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
