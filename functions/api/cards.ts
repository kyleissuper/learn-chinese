// GET  /api/cards         — list all cards (add ?due=true for due only)
// POST /api/cards         — bulk-import cards from a deck

import { drizzle } from "drizzle-orm/d1";
import { lte, desc } from "drizzle-orm";
import { createEmptyCard } from "ts-fsrs";
import { cards } from "../db/schema";

interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = drizzle(env.DB);
  const dueOnly = new URL(request.url).searchParams.get("due") === "true";
  const now = new Date().toISOString();

  const rows = dueOnly
    ? await db.select().from(cards).where(lte(cards.due, now)).orderBy(cards.due).limit(50)
    : await db.select().from(cards).orderBy(desc(cards.createdAt));

  return Response.json(rows);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const { cards: input } = await request.json<{ cards: any[] }>();
  if (!input?.length) return Response.json({ error: "No cards" }, { status: 400 });

  const db = drizzle(env.DB);
  const empty = createEmptyCard(new Date());

  const sourceArticle = input[0]?.sourceArticle ?? null;

  await db.insert(cards).values(
    input.map((c) => ({
      id: crypto.randomUUID(),
      front: c.front,
      pinyin: c.pinyin ?? null,
      definition: c.definition,
      example: c.example ?? null,
      examplePinyin: c.examplePinyin ?? null,
      exampleTranslation: c.exampleTranslation ?? null,
      sourceArticle: c.sourceArticle ?? sourceArticle,
      due: empty.due.toISOString(),
      stability: empty.stability,
      difficulty: empty.difficulty,
      elapsedDays: empty.elapsed_days,
      scheduledDays: empty.scheduled_days,
      reps: empty.reps,
      lapses: empty.lapses,
      state: empty.state,
    })),
  ).onConflictDoNothing();

  return Response.json({ imported: input.length });
};
