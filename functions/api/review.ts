// POST /api/review — submit a review rating for a card
// Body: { cardId: string, rating: 1 | 2 | 3 | 4 }
// Ratings: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy

import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { fsrs, type Card, type Grade, type State } from "ts-fsrs";
import { z } from "zod";
import { cards } from "../db/schema";

const ReviewInput = z.object({
  cardId: z.string().min(1),
  rating: z.number().int().min(1).max(4) as z.ZodType<Grade>,
});

interface Env { DB: D1Database }

/** Map a Drizzle row to a ts-fsrs Card. */
function toFsrsCard(row: typeof cards.$inferSelect): Card {
  return {
    due:            new Date(row.due),
    stability:      row.stability,
    difficulty:     row.difficulty,
    elapsed_days:   row.elapsedDays,
    scheduled_days: row.scheduledDays,
    reps:           row.reps,
    lapses:         row.lapses,
    state:          row.state as State,
    last_review:    row.lastReview ? new Date(row.lastReview) : undefined,
    learning_steps: row.learningSteps,
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const parsed = ReviewInput.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid cardId or rating" }, { status: 400 });

  const { cardId, rating } = parsed.data;

  const db = drizzle(env.DB);
  const [row] = await db.select().from(cards).where(eq(cards.id, cardId));
  if (!row) return Response.json({ error: "Card not found" }, { status: 404 });

  const now = new Date();
  const next = fsrs().next(toFsrsCard(row), now, rating).card;

  await db.update(cards).set({
    due:           next.due.toISOString(),
    stability:     next.stability,
    difficulty:    next.difficulty,
    elapsedDays:   next.elapsed_days,
    scheduledDays: next.scheduled_days,
    reps:          next.reps,
    lapses:        next.lapses,
    state:         next.state,
    learningSteps: next.learning_steps,
    lastReview:    now.toISOString(),
  }).where(eq(cards.id, cardId));

  return Response.json({ success: true, nextDue: next.due });
};
