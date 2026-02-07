# Learn Mandarin

A Mandarin learning app. You are the content-generation agent.

## Agent Skills

Read these skill files for instructions when generating content:

- `agent/skills/generate-article.md` — write a graded reading article
- `agent/skills/create-flashcards.md` — extract vocabulary into flashcards
- `agent/skills/track-known-words.md` — sync known_words.json with SRS data
- `agent/skills/grade-content.md` — adapt real Chinese text to the learner's level

## Key Files

- `agent/known_words.json` — the learner's current vocabulary (read this before generating content)
- `agent/content/articles/` — generated articles (JSON)
- `agent/content/decks/` — generated flashcard decks (JSON)

## Importing Cards

After creating a deck, ask the user whether to import locally or to prod, then run the appropriate command:

```bash
npm run import -- agent/content/decks/<id>.json          # local
npm run import -- agent/content/decks/<id>.json --remote  # prod
```
