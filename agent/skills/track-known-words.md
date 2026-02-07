# Skill: Track Known Words

Update `known_words.json` based on the learner's SRS review progress.

## When to Run

Periodically (e.g. weekly), or whenever the learner asks to refresh their word list.

## Process

1. Fetch all cards from the local database:
   ```bash
   npx wrangler d1 execute learn-mandarin --local --command "SELECT * FROM cards"
   ```
   For production data, add `--remote` instead of `--local`.
2. A word is considered **known** when its FSRS state indicates mastery:
   - `state` = 2 (Review) — the card has graduated from the learning phase
   - `stability` >= 10 — the card has high retention probability
   - `reps` >= 3 — the learner has reviewed it multiple times
3. Read the current `agent/known_words.json`.
4. Add newly mastered words. Remove words that have lapsed (`state` = 3 with high `lapses` count).
5. Update `lastUpdated` to today's date.
6. Write the updated `agent/known_words.json`.

## Notes

- This is a rough heuristic. The learner can always manually edit `known_words.json`.
- Heritage speakers may want to seed this file with words they already know from speaking but haven't reviewed as cards — that's fine, just add them directly.
- The word list doesn't need to be perfect. It's used by the generate-article and create-flashcards skills to estimate the learner's reading level. A few wrong entries won't hurt much.
