#!/usr/bin/env bash
set -euo pipefail

PROJECT="learn-mandarin"
WRANGLER="npx wrangler"

# 1. Check dependencies
if ! command -v jq &>/dev/null; then
  echo "jq is required but not installed. Install it from https://jqlang.github.io/jq/download/"
  exit 1
fi

# 2. Ensure logged in
if ! $WRANGLER whoami &>/dev/null; then
  echo "Not logged in. Run 'npx wrangler login' first, then rerun this script."
  exit 1
fi

# 3. D1 databases (production + preview)
D1_LIST=$($WRANGLER d1 list --json)

DB_ID=$(echo "$D1_LIST" | jq -r ".[] | select(.name == \"$PROJECT\") | .uuid")
if [ -z "$DB_ID" ]; then
  echo "Creating production D1 database..."
  $WRANGLER d1 create "$PROJECT"
  D1_LIST=$($WRANGLER d1 list --json)
  DB_ID=$(echo "$D1_LIST" | jq -r ".[] | select(.name == \"$PROJECT\") | .uuid")
fi
echo "Production D1 database ID: $DB_ID"

PREVIEW_DB_ID=$(echo "$D1_LIST" | jq -r ".[] | select(.name == \"${PROJECT}-preview\") | .uuid")
if [ -z "$PREVIEW_DB_ID" ]; then
  echo "Creating preview D1 database..."
  $WRANGLER d1 create "${PROJECT}-preview"
  D1_LIST=$($WRANGLER d1 list --json)
  PREVIEW_DB_ID=$(echo "$D1_LIST" | jq -r ".[] | select(.name == \"${PROJECT}-preview\") | .uuid")
fi
echo "Preview D1 database ID:    $PREVIEW_DB_ID"

# 4. Update wrangler.toml with real database IDs
if [[ "$OSTYPE" == darwin* ]]; then
  SED=(sed -i '')
else
  SED=(sed -i)
fi

"${SED[@]}" "s/^database_id = .*/database_id = \"$DB_ID\"/" wrangler.toml
if grep -q "preview_database_id" wrangler.toml; then
  "${SED[@]}" "s/^preview_database_id = .*/preview_database_id = \"$PREVIEW_DB_ID\"/" wrangler.toml
else
  "${SED[@]}" "/^database_id = /a\\
preview_database_id = \"$PREVIEW_DB_ID\"" wrangler.toml
fi

# 5. Run migrations (production + preview + local)
$WRANGLER d1 migrations apply --remote
$WRANGLER d1 migrations apply --remote --preview
$WRANGLER d1 migrations apply --local

# 6. Pages project (ignore "already exists", fail on anything else)
OUTPUT=$($WRANGLER pages project create "$PROJECT" 2>&1) || {
  if ! echo "$OUTPUT" | grep -qi "already exists"; then
    echo "Failed to create Pages project: $OUTPUT"
    exit 1
  fi
}

# 7. Seed preview with sample cards so demo users always have content
echo "Seeding preview database with flashcard decks..."
for deck in agent/content/decks/*.json; do
  [ "$(basename "$deck")" = "index.json" ] && continue
  node scripts/import.js "$deck" --remote --preview
done

echo ""
echo "Done. For CI/CD, add these GitHub repo secrets (Settings > Secrets > Actions):"
echo "  CLOUDFLARE_ACCOUNT_ID  — dash.cloudflare.com > Workers & Pages > right sidebar"
echo "  CLOUDFLARE_API_TOKEN   — dash.cloudflare.com > My Profile > API Tokens > Create Token"
echo "                           Use template 'Edit Cloudflare Workers', then pare down to:"
echo "                           - Account > Cloudflare Pages > Edit"
echo "                           - Account > D1 > Edit"
echo "                           Leave IP filtering and TTL blank (GitHub Actions IPs rotate)."
