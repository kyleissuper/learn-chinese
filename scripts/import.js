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

const rows = deck.cards.map((c) => ({
  id: randomUUID(),
  front: c.front,
  pinyin: c.pinyin,
  definition: c.definition,
  example: c.example ?? null,
  example_pinyin: c.examplePinyin ?? null,
  example_translation: c.exampleTranslation ?? null,
  source_article: deck.sourceArticle,
  due: now,
}));

// Safe to interpolate: JSON.stringify produces double-quoted strings so the only
// character that can break a SQL single-quoted literal is ' — which we escape to ''.
// SQLite's json_each then unescapes '' back to ' before parsing, yielding valid JSON.
const json = JSON.stringify(rows).replace(/'/g, "''");
const sql = `INSERT OR IGNORE INTO cards (id,front,pinyin,definition,example,example_pinyin,example_translation,source_article,due)
SELECT json_extract(value,'$.id'),json_extract(value,'$.front'),json_extract(value,'$.pinyin'),json_extract(value,'$.definition'),json_extract(value,'$.example'),json_extract(value,'$.example_pinyin'),json_extract(value,'$.example_translation'),json_extract(value,'$.source_article'),json_extract(value,'$.due')
FROM json_each('${json}');`;

const tmp = "/tmp/import-cards.sql";
writeFileSync(tmp, sql);
const target = flags.includes("--remote") ? "--remote" : "--local";
execSync(`npx wrangler d1 execute learn-mandarin ${target} --file=${tmp}`, {
  stdio: "inherit",
});
unlinkSync(tmp);
