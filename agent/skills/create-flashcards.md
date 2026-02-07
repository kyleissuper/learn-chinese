# Skill: Create Flashcards

Generate a flashcard deck from an article's vocabulary, ready to import into the SRS system.

## Inputs

- An article file from `agent/content/articles/<id>.json`
- `agent/known_words.json` — to identify which words are new

## Process

1. Read the article and extract all unique words (segments with pinyin).
2. Cross-reference against `known_words.json`.
3. Select **new words** the learner hasn't mastered yet — typically 5–15 per article.
4. For each card, provide:
   - `front` — the Chinese word/phrase
   - `pinyin` — pronunciation with tone marks
   - `definition` — concise English meaning
   - `example` — a sentence using the word (ideally from the article or a simple new one)
   - `examplePinyin` — pinyin for the example sentence
   - `exampleTranslation` — English translation of the example
5. Save as `agent/content/decks/<article-id>.json`.
6. Update `agent/content/decks/index.json` with the new deck.

## Output Format

```json
{
  "id": "article-id",
  "name": "Deck Name - Vocabulary",
  "sourceArticle": "article-id",
  "cards": [
    {
      "front": "词语",
      "pinyin": "cíyǔ",
      "definition": "word; vocabulary",
      "example": "这个词语很常用。",
      "examplePinyin": "Zhège cíyǔ hěn chángyòng.",
      "exampleTranslation": "This word is very commonly used."
    }
  ]
}
```

## Importing

After creating the deck file, import the cards into the SRS database:

```bash
curl -X POST https://YOUR_DOMAIN/api/cards \
  -H "Content-Type: application/json" \
  -d @agent/content/decks/<article-id>.json
```

## Guidelines

- Prefer words that appear in context — the article gives the learner a memory hook.
- For multi-character words, don't also create cards for individual characters unless they're independently useful.
- Example sentences should be at or below the learner's level — don't introduce new unknowns in examples.
- Keep definitions concise. Prefer the meaning used in context over exhaustive dictionary entries.
