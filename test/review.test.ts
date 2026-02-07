import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { onRequestPost as importCards } from "../functions/api/cards";
import { onRequestPost as reviewCard } from "../functions/api/review";

function ctx(request: Request) {
  return { env, request } as any;
}

/** Import a single card and return its ID. */
async function seedCard(): Promise<string> {
  await importCards(ctx(
    new Request("http://localhost/api/cards", {
      method: "POST",
      body: JSON.stringify({
        cards: [{ front: "水", definition: "water", pinyin: "shuǐ", sourceArticle: "test" }],
      }),
    })
  ));
  const row = await env.DB.prepare("SELECT id FROM cards LIMIT 1").first<{ id: string }>();
  return row!.id;
}

beforeEach(async () => {
  await env.DB.exec("DELETE FROM cards");
});

describe("POST /api/review", () => {
  it("reviews a card with rating 3 (Good) — nextDue is in the future", async () => {
    const cardId = await seedCard();

    const res = await reviewCard(ctx(
      new Request("http://localhost/api/review", {
        method: "POST",
        body: JSON.stringify({ cardId, rating: 3 }),
      })
    ));
    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(new Date(body.nextDue).getTime()).toBeGreaterThan(Date.now());
  });

  it("updates FSRS state in DB after review", async () => {
    const cardId = await seedCard();

    // Check initial state
    const before = await env.DB.prepare("SELECT reps, due FROM cards WHERE id = ?").bind(cardId).first<{ reps: number; due: string }>();
    expect(before!.reps).toBe(0);

    await reviewCard(ctx(
      new Request("http://localhost/api/review", {
        method: "POST",
        body: JSON.stringify({ cardId, rating: 3 }),
      })
    ));

    const after = await env.DB.prepare("SELECT reps, due FROM cards WHERE id = ?").bind(cardId).first<{ reps: number; due: string }>();
    expect(after!.reps).toBe(1);
    expect(new Date(after!.due).getTime()).toBeGreaterThan(new Date(before!.due).getTime());
  });

  it("returns 400 when cardId is missing", async () => {
    const res = await reviewCard(ctx(
      new Request("http://localhost/api/review", {
        method: "POST",
        body: JSON.stringify({ rating: 3 }),
      })
    ));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid ratings (0, 5, abc)", async () => {
    const cardId = await seedCard();

    for (const rating of [0, 5, "abc"]) {
      const res = await reviewCard(ctx(
        new Request("http://localhost/api/review", {
          method: "POST",
          body: JSON.stringify({ cardId, rating }),
        })
      ));
      expect(res.status).toBe(400);
    }
  });

  it("returns 404 for non-existent cardId", async () => {
    const res = await reviewCard(ctx(
      new Request("http://localhost/api/review", {
        method: "POST",
        body: JSON.stringify({ cardId: crypto.randomUUID(), rating: 3 }),
      })
    ));
    expect(res.status).toBe(404);
  });

  it("handles reviewing the same card twice — state accumulates", async () => {
    const cardId = await seedCard();

    // First review
    const res1 = await reviewCard(ctx(
      new Request("http://localhost/api/review", {
        method: "POST",
        body: JSON.stringify({ cardId, rating: 3 }),
      })
    ));
    expect((await res1.json() as any).success).toBe(true);

    // Second review
    const res2 = await reviewCard(ctx(
      new Request("http://localhost/api/review", {
        method: "POST",
        body: JSON.stringify({ cardId, rating: 3 }),
      })
    ));
    const body2 = await res2.json() as any;
    expect(body2.success).toBe(true);

    const row = await env.DB.prepare("SELECT reps FROM cards WHERE id = ?").bind(cardId).first<{ reps: number }>();
    expect(row!.reps).toBe(2);
  });
});
