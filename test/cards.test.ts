import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { onRequestGet, onRequestPost } from "../functions/api/cards";

function ctx(request: Request) {
  return { env, request } as any;
}

function makeCards(overrides: Partial<{ front: string; definition: string; pinyin: string; example: string; sourceArticle: string }>[] = []) {
  const defaults = [
    { front: "你好", definition: "hello", pinyin: "nǐ hǎo", example: "你好吗？", sourceArticle: "lesson-1" },
    { front: "谢谢", definition: "thank you", pinyin: "xiè xiè", example: "谢谢你", sourceArticle: "lesson-1" },
    { front: "再见", definition: "goodbye", pinyin: "zài jiàn", example: "再见了", sourceArticle: "lesson-1" },
  ];
  if (overrides.length) return overrides;
  return defaults;
}

beforeEach(async () => {
  await env.DB.exec("DELETE FROM cards");
});

describe("POST /api/cards — import", () => {
  it("imports a deck and cards appear in GET", async () => {
    const cards = makeCards();
    const res = await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
    ));
    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.imported).toBe(3);

    const listRes = await onRequestGet(ctx(new Request("http://localhost/api/cards")));
    const listBody = await listRes.json() as any[];
    expect(listBody).toHaveLength(3);
  });

  it("returns 400 when cards array is missing", async () => {
    const res = await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({}),
      })
    ));
    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toBeDefined();
  });

  it("stores null for optional fields when omitted", async () => {
    const cards = [{ front: "猫", definition: "cat" }];
    const res = await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
    ));
    expect(res.status).toBe(200);

    const listRes = await onRequestGet(ctx(new Request("http://localhost/api/cards")));
    const listBody = await listRes.json() as any[];
    expect(listBody).toHaveLength(1);
    expect(listBody[0].pinyin).toBeNull();
    expect(listBody[0].example).toBeNull();
  });

  it("deduplicates on reimport via unique index", async () => {
    const cards = makeCards();

    // First import
    await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
    ));

    // Second import — same cards
    const res = await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
    ));
    const body = await res.json() as any;
    expect(body.imported).toBe(3); // reports input length

    const listRes = await onRequestGet(ctx(new Request("http://localhost/api/cards")));
    const listBody = await listRes.json() as any[];
    expect(listBody).toHaveLength(3); // no duplicates
  });
});

describe("GET /api/cards — list", () => {
  it("returns all cards when no query param", async () => {
    const cards = makeCards();
    await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
    ));

    const res = await onRequestGet(ctx(new Request("http://localhost/api/cards")));
    const body = await res.json() as any[];
    expect(res.status).toBe(200);
    expect(body).toHaveLength(3);
    expect(body[0].front).toBeDefined();
    expect(body[0].definition).toBeDefined();
  });

  it("?due=true returns only cards with due <= now", async () => {
    const cards = makeCards();
    await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
    ));

    // Push one card's due date far into the future
    const allCards = await (await onRequestGet(ctx(new Request("http://localhost/api/cards")))).json() as any[];
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare("UPDATE cards SET due = ? WHERE id = ?").bind(futureDate, allCards[0].id).run();

    const res = await onRequestGet(ctx(new Request("http://localhost/api/cards?due=true")));
    const body = await res.json() as any[];
    expect(body).toHaveLength(2);
  });

  it("?due=true returns empty when no cards are due", async () => {
    const cards = makeCards();
    await onRequestPost(ctx(
      new Request("http://localhost/api/cards", {
        method: "POST",
        body: JSON.stringify({ cards }),
      })
    ));

    // Push all cards' due dates far into the future
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare("UPDATE cards SET due = ?").bind(futureDate).run();

    const res = await onRequestGet(ctx(new Request("http://localhost/api/cards?due=true")));
    const body = await res.json() as any[];
    expect(body).toHaveLength(0);
  });
});
