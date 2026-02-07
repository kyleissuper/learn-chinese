import { env } from "cloudflare:test";

await env.DB.batch([
  env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      front TEXT NOT NULL,
      pinyin TEXT,
      definition TEXT NOT NULL,
      example TEXT,
      example_pinyin TEXT,
      example_translation TEXT,
      source_article TEXT,
      due TEXT NOT NULL,
      stability REAL NOT NULL DEFAULT 0,
      difficulty REAL NOT NULL DEFAULT 0,
      elapsed_days INTEGER NOT NULL DEFAULT 0,
      scheduled_days INTEGER NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      state INTEGER NOT NULL DEFAULT 0,
      last_review TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `),
  env.DB.prepare(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_front_source ON cards (front, source_article)`
  ),
]);
