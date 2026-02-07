#!/usr/bin/env bash
set -euo pipefail

PROJECT="learn-mandarin"
WRANGLER="npx wrangler"

# 1. Ensure logged in
if $WRANGLER whoami 2>&1 | grep -q "not authenticated"; then
  echo "Not logged in. Run 'npx wrangler login' first, then rerun this script."
  exit 1
fi

# 2. D1 databases (production + preview)
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

# 3. Update wrangler.toml with real database IDs
sed -i '' "s/database_id = .*/database_id = \"$DB_ID\"/" wrangler.toml
if grep -q "preview_database_id" wrangler.toml; then
  sed -i '' "s/preview_database_id = .*/preview_database_id = \"$PREVIEW_DB_ID\"/" wrangler.toml
else
  sed -i '' "/database_id = /a\\
preview_database_id = \"$PREVIEW_DB_ID\"" wrangler.toml
fi

# 4. Run migrations (IF NOT EXISTS makes this idempotent)
$WRANGLER d1 execute "$PROJECT" --remote --file migrations/0001_init.sql
$WRANGLER d1 execute "${PROJECT}-preview" --remote --file migrations/0001_init.sql

# 5. Pages project (errors if exists, that's fine)
$WRANGLER pages project create "$PROJECT" 2>/dev/null || true

echo ""
echo "Done. For CI/CD, add these GitHub repo secrets (Settings > Secrets > Actions):"
echo "  CLOUDFLARE_ACCOUNT_ID  — dash.cloudflare.com > Workers & Pages > right sidebar"
echo "  CLOUDFLARE_API_TOKEN   — dash.cloudflare.com > My Profile > API Tokens > Create Token"
echo "                           Use template 'Edit Cloudflare Workers', then pare down to:"
echo "                           - Account > Cloudflare Pages > Edit"
echo "                           - Account > D1 > Edit"
echo "                           Leave IP filtering and TTL blank (GitHub Actions IPs rotate)."
