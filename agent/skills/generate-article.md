# Skill: Generate Article

Generate a graded Chinese reading article tailored to the learner's current level.

## Inputs

- `agent/known_words.json` — the learner's known vocabulary
- A **topic** (provided by the user or chosen by the agent)
- A **target level** (e.g. HSK3, HSK4)

## Process

1. Read `known_words.json` to understand the learner's current vocabulary.
2. Write a short article (3–5 paragraphs, ~150–300 characters) on the given topic.
3. Use **mostly known words** (~80%) with a handful of **new words** (~20%) to create comprehensible input.
4. Keep grammar at or slightly above the target level.
5. Segment the article word-by-word. For each word, provide:
   - `text` — the Chinese characters
   - `pinyin` — the pronunciation with tone marks
   - `definition` — a short English definition
   - Punctuation gets only `text`, no pinyin or definition.
6. Save the article as `agent/content/articles/<id>.json`.
7. Update `agent/content/articles/index.json` to include the new article.

## Output Format

```json
{
  "id": "topic-slug",
  "title": "中文标题",
  "titlePinyin": "Zhōngwén Biāotí",
  "titleTranslation": "English Title",
  "level": "HSK3",
  "date": "2025-01-15",
  "paragraphs": [
    [
      { "text": "今天", "pinyin": "jīntiān", "definition": "today" },
      { "text": "，" },
      ...
    ],
    ...
  ]
}
```

## Guidelines

- Write natural, conversational Chinese — not textbook-stiff.
- Prefer concrete, everyday scenarios (ordering food, asking directions, daily routines).
- For heritage speakers: lean toward vocabulary they might hear at home but not read, and include some formal/written register words they might be missing.
- Each paragraph should be self-contained enough to be readable even if the learner doesn't finish.
- Double-check pinyin tone marks. Common errors: 一 changes tone depending on context.
