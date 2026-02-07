#!/usr/bin/env node
const { readFileSync, writeFileSync, unlinkSync } = require("fs");
const { execSync } = require("child_process");
const { randomUUID } = require("crypto");

const [, , file, ...flags] = process.argv;
if (!file) {
  console.error("Usage: node scripts/import.js <deck.json> [--remote]");
  process.exit(1);
}

const deck = JSON.parse(readFileSync(file, "utf8"));
const now = new Date().toISOString();
const esc = (s) => (s != null ? `'${s.replace(/'/g, "''")}'` : "NULL");

const sql = deck.cards
  .map(
    (c) =>
      `INSERT INTO cards (id, front, pinyin, definition, example, example_pinyin, example_translation, source_article, due) VALUES ('${randomUUID()}', ${esc(c.front)}, ${esc(c.pinyin)}, ${esc(c.definition)}, ${esc(c.example)}, ${esc(c.examplePinyin)}, ${esc(c.exampleTranslation)}, ${esc(deck.sourceArticle)}, '${now}') ON CONFLICT DO NOTHING;`,
  )
  .join("\n");

const tmp = "/tmp/import-cards.sql";
writeFileSync(tmp, sql);
const target = flags.includes("--remote") ? "--remote" : "--local";
execSync(`npx wrangler d1 execute learn-mandarin ${target} --file=${tmp}`, {
  stdio: "inherit",
});
unlinkSync(tmp);
