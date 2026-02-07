# Learn Mandarin

A free, self-hosted alternative to graded Chinese reading apps like The Chairman's Bao. An AI agent generates reading content and flashcards at your level; a minimal web app handles reading and spaced repetition review. Total hosting cost: $0.

Requires a technical background — you'll need to be comfortable with a terminal, npm, and deploying to Cloudflare. AI agents can also help with that. Built for heritage speakers who can speak but want to improve reading, though it works for any learner.

**Architecture:** The agent does the hard work (content generation, vocabulary grading, word segmentation) offline. The deployed app is just a reader + SRS reviewer — as little code as possible.

## How It Works

1. **Generate content** — run an AI agent (e.g. Claude Code) in this project. Ask it to generate an article on a topic. It reads the skill prompts in `agent/skills/` and your vocabulary in `agent/known_words.json`, then writes graded articles and flashcard decks as JSON.
2. **Import flashcards** — `npm run import -- agent/content/decks/<id>.json [--remote]` loads cards into the D1 database via wrangler.
3. **Deploy** — `git push`. Cloudflare Pages auto-deploys; articles are static JSON served directly.
4. **Read** — tap any word in the reader to see pinyin + definition.
5. **Review** — flashcards use [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) (the algorithm behind Anki) for spaced repetition scheduling.

## Setup

### Prerequisites

- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- An AI agent that can read markdown skill files (e.g. Claude Code, mini-swe-agent)

### 1. Install dependencies

```bash
npm install
```

### 2. Create the D1 database

```bash
npm run db:create
```

This prints a database ID. Paste it into `wrangler.toml`:

```toml
database_id = "your-database-id-here"
```

### 3. Run locally

```bash
npm run dev          # Vite + Wrangler (http://localhost:5173, API on :8788)
```

### 4. Deploy

```bash
npm run build && npx wrangler pages deploy dist
```

### 5. Set up auth (Cloudflare Access)

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) dashboard
2. Access → Applications → Add an application
3. Choose "Self-hosted", enter your Pages domain
4. Add a policy: Allow → Emails → `your-email@example.com`
5. Done. The entire app is now behind a login gate.

## Agent Skills

Skills are markdown files in `agent/skills/` that instruct an AI agent what to do. They're not code — they're prompts.

| Skill | What it does |
|-------|-------------|
| `generate-article` | Write a new graded article using mostly known words + some new ones |
| `create-flashcards` | Extract vocabulary from an article into importable flashcards |
| `track-known-words` | Sync `known_words.json` with your SRS mastery data |
| `grade-content` | Take real Chinese text and adapt it to your reading level |

### Example: generating a new lesson

From Claude Code (or any LLM) in the project directory:

```
Generate an article about going to the doctor, targeting HSK4.
Then create flashcards from it and import them.
```

The agent reads `agent/skills/generate-article.md` and `agent/skills/create-flashcards.md` for instructions, uses `agent/known_words.json` to gauge your level, writes the content to `agent/content/`, and runs `npm run import` to load cards into D1.

## License

MIT
