import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

const articlesDir = "agent/content/articles";

const articleFiles = readdirSync(articlesDir)
  .filter((f) => f !== "index.json" && f.endsWith(".json"));

describe("article content", () => {
  it("index.json is valid JSON array", () => {
    const index = JSON.parse(readFileSync(join(articlesDir, "index.json"), "utf8"));
    expect(Array.isArray(index)).toBe(true);
    for (const entry of index) {
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("title");
    }
  });

  for (const file of articleFiles) {
    it(`${file} is valid JSON with expected structure`, () => {
      const raw = readFileSync(join(articlesDir, file), "utf8");
      const article = JSON.parse(raw);
      expect(article).toHaveProperty("id");
      expect(article).toHaveProperty("title");
      expect(article).toHaveProperty("paragraphs");
      expect(Array.isArray(article.paragraphs)).toBe(true);
    });
  }

  it("every index entry has a matching article file", () => {
    const index = JSON.parse(readFileSync(join(articlesDir, "index.json"), "utf8"));
    for (const entry of index) {
      expect(articleFiles).toContain(`${entry.id}.json`);
    }
  });
});
