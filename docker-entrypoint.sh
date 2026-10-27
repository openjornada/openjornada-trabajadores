#!/bin/sh
# Write runtime environment configuration for the Vite app.
# NOTE: VITE_BASE_PATH is fixed at build time because Vite uses it for asset URLs.

set -e

js_escape() {
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

{
    printf 'window.__APP_CONFIG__ = {\n'
    printf '  apiUrl: "%s",\n' "$(js_escape "${VITE_API_URL:-}")"
    printf '  apiUsername: "%s",\n' "$(js_escape "${VITE_API_USERNAME:-}")"
    printf '  apiPassword: "%s",\n' "$(js_escape "${VITE_API_PASSWORD:-}")"
    printf '  appName: "%s",\n' "$(js_escape "${VITE_APP_NAME:-OpenJornada}")"
    printf '  appLogo: "%s"\n' "$(js_escape "${VITE_APP_LOGO:-/logo.png}")"
    printf '};\n'
} > /usr/share/nginx/html/config.js

echo "Runtime configuration generated"

# Execute nginx
exec "$@"
