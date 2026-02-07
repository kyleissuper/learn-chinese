# Learn Mandarin

A personal Mandarin learning app for heritage speakers. An AI agent generates graded reading content and flashcards; a minimal web app handles reading and spaced repetition review.

**Architecture:** The agent does the hard work (content generation, vocabulary grading, word segmentation) offline. The deployed app is just a reader + SRS reviewer — as little code as possible.

## How It Works

```
┌──────────────┐     git push     ┌────────────────────────┐
│  AI Agent    │ ──────────────>  │  Cloudflare Pages      │
│  (local)     │                  │                        │
│  Reads skills│  articles/decks  │  Static reader         │
│  Generates   │  as JSON files   │  + SRS review UI       │
│  content     │                  │  + D1 database (cards) │
└──────────────┘                  │  + Access (auth)       │
                                  └────────────────────────┘
```

1. **You run the agent** locally with a skill like `generate-article`. It reads your `known_words.json`, writes a pre-segmented article with pinyin/definitions, and pushes to the repo.
2. **Cloudflare Pages** auto-deploys. Articles are static JSON served directly.
3. **You read** articles in the reader — tap any word to see pinyin + definition.
4. **You review** flashcards in the SRS reviewer. Card scheduling uses [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) (the algorithm Anki uses) backed by Cloudflare D1.
5. **Cloudflare Access** gates the whole app to your email. Zero auth code.

## Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Preact + Vite + Tailwind CSS | — |
| API | Cloudflare Pages Functions (2 files, 3 routes) | Free |
| Database | Cloudflare D1 (SQLite) | Free |
| Auth | Cloudflare Access (Zero Trust) | Free |
| SRS Algorithm | [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | — |
| Content | AI agent + markdown skills | — |

Total hosting cost: **$0**

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
npm run dev          # Frontend only (Vite, http://localhost:5173)
npm run dev:api      # Full stack with API (Wrangler, http://localhost:8788)
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

## Project Structure

```
learn-mandarin/
├── agent/                     # AI agent workspace
│   ├── skills/                # Agent skill files (markdown prompts)
│   │   ├── generate-article.md
│   │   ├── create-flashcards.md
│   │   ├── track-known-words.md
│   │   └── grade-content.md
│   ├── known_words.json       # Your vocabulary (agent-managed)
│   └── content/               # Agent-generated content (static JSON)
│       ├── articles/
│       │   ├── index.json     # Article manifest
│       │   └── *.json         # Pre-segmented articles
│       └── decks/
│           ├── index.json     # Deck manifest
│           └── *.json         # Card definitions
├── src/                       # Preact frontend
│   ├── main.tsx               # Entry point + router
│   ├── app.css                # Tailwind + custom styles
│   └── pages/
│       ├── Dashboard.tsx      # Article list + due card count
│       ├── Reader.tsx         # Tap-to-reveal reader with pinyin toggle
│       └── Review.tsx         # SRS flashcard review with keyboard shortcuts
├── functions/                 # Cloudflare Pages Functions
│   ├── api/
│   │   ├── cards.ts           # GET + POST /api/cards
│   │   └── review.ts         # POST /api/review
│   └── db/
│       └── schema.ts          # Drizzle ORM schema (source of truth)
├── vite.config.ts             # Vite + Preact + Tailwind
├── wrangler.toml              # Cloudflare D1 binding
└── package.json
```

## Agent Skills

Skills are markdown files in `agent/skills/` that instruct an AI agent what to do. They're not code — they're prompts.

| Skill | What it does |
|-------|-------------|
| `generate-article` | Write a new graded article using mostly known words + some new ones |
| `create-flashcards` | Extract vocabulary from an article into importable flashcards |
| `track-known-words` | Sync `known_words.json` with your SRS mastery data |
| `grade-content` | Take real Chinese text and adapt it to your reading level |

### Example: generating a new article

```
Agent, run the generate-article skill. Topic: going to the doctor. Target: HSK4.
```

The agent reads `agent/known_words.json`, writes a segmented article JSON, and saves it to `agent/content/articles/`. Push to deploy.

## Content Formats

### Article JSON

Articles are pre-segmented by the agent. Each word has pinyin and a definition so the frontend doesn't need any NLP or dictionary lookup.

```json
{
  "id": "article-slug",
  "title": "中文标题",
  "titlePinyin": "Zhōngwén Biāotí",
  "titleTranslation": "English Title",
  "level": "HSK3",
  "date": "2025-01-15",
  "paragraphs": [
    [
      { "text": "今天", "pinyin": "jīntiān", "definition": "today" },
      { "text": "，" }
    ]
  ]
}
```

Words get `text`, `pinyin`, and `definition`. Punctuation gets only `text`.

### Deck JSON

```json
{
  "id": "deck-slug",
  "name": "Deck Name",
  "sourceArticle": "article-slug",
  "cards": [
    {
      "front": "词语",
      "pinyin": "cíyǔ",
      "definition": "word",
      "example": "Example sentence.",
      "examplePinyin": "Pinyin for example.",
      "exampleTranslation": "English translation."
    }
  ]
}
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cards` | List all cards. Add `?due=true` for due only. |
| POST | `/api/cards` | Import cards from a deck. Body: `{ "cards": [...] }` |
| POST | `/api/review` | Submit a review. Body: `{ "cardId": "...", "rating": 3 }` |

Ratings: 1=Again, 2=Hard, 3=Good, 4=Easy (standard FSRS).

## Keyboard Shortcuts (Review)

| Key | Action |
|-----|--------|
| Space | Flip card |
| 1 | Again |
| 2 | Hard |
| 3 | Good |
| 4 | Easy |

## Why This Architecture

- **No backend logic** — the AI agent does all the NLP (segmentation, grading, definitions) at authoring time
- **Tiny frontend** — 3 Preact components, ~170 lines total, builds in <100ms
- **No auth code** — Cloudflare Access handles it at the network layer
- **No ops** — D1 is managed SQLite, Pages auto-deploys on push
- **Content is just files** — articles and decks are JSON in the repo, version-controlled for free

## License

MIT
