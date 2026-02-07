# Skill: Grade Content

Take existing Chinese text (from a news article, book, social media, etc.) and adapt it into a graded reader article at the learner's level.

## Inputs

- **Source text** — raw Chinese text, provided by the user
- `agent/known_words.json` — the learner's vocabulary
- A **target level** (optional; inferred from known_words if not specified)

## Process

1. Read the source text and identify its approximate difficulty.
2. Read `known_words.json` to understand the learner's level.
3. Rewrite the text to fit the learner's level:
   - Replace advanced vocabulary with simpler synonyms where possible
   - Simplify complex grammar structures
   - Keep the core meaning and narrative intact
   - Preserve interesting or culturally important words even if advanced — these become learning opportunities
4. Segment the adapted text word-by-word with pinyin and definitions (same format as generate-article).
5. Save as a new article in `agent/content/articles/`.
6. Update the article index.

## Output Format

Same as [generate-article.md](./generate-article.md) — standard article JSON.

## Guidelines

- Don't oversimplify to the point of losing the original's voice. The goal is comprehensible input, not baby talk.
- Mark the article's source in the JSON (add an optional `"source": "..."` field) so the learner knows where it came from.
- This skill is especially useful for heritage speakers who want to read real content (WeChat articles, news, subtitles) but need vocabulary support.
- If the source text is very long, break it into multiple articles.
