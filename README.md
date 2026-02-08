# Learn Mandarin

[![Deploy](https://github.com/kyleissuper/learn-chinese/actions/workflows/deploy.yml/badge.svg)](https://github.com/kyleissuper/learn-chinese/actions/workflows/deploy.yml)

Free, self-hosted graded Chinese reader + flashcards. Your own AI agent generates content at your level; a Cloudflare Pages app handles reading and [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) spaced repetition. Hosting cost: $0.

## Setup

Requires Node.js 18+ and a [Cloudflare account](https://dash.cloudflare.com/sign-up) (free).

```bash
npm install
bash scripts/setup.sh    # creates D1 databases, updates wrangler.toml, runs migrations
npm run dev              # local dev (http://localhost:5173)
```

Deploy: `npm run build && npx wrangler pages deploy dist`

Then lock it down with [Cloudflare Access](https://one.dash.cloudflare.com/) (Zero Trust → Applications → add a self-hosted app for your Pages domain).

## Generating Content

Point an AI coding agent at this project and tell it what you want to learn. It adapts to your level automatically.

## License

MIT
