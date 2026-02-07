import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const Segment = z.object({
  text: z.string(),
  pinyin: z.string().optional(),
  definition: z.string().optional(),
});

const Article = z.object({
  id: z.string(),
  title: z.string(),
  titlePinyin: z.string(),
  titleTranslation: z.string(),
  level: z.string(),
  date: z.string().date(),
  paragraphs: z.array(z.array(Segment)).min(1),
});

const IndexEntry = z.object({
  id: z.string(),
  title: z.string(),
  level: z.string(),
  date: z.string().date(),
});

const dir = "agent/content/articles";
const files = readdirSync(dir).filter((f) => f !== "index.json" && f.endsWith(".json"));
const read = (f: string) => JSON.parse(readFileSync(join(dir, f), "utf8"));

describe("article content", () => {
  it("index.json matches schema and all files exist", () => {
    const index = z.array(IndexEntry).parse(read("index.json"));
    for (const entry of index) {
      expect(files).toContain(`${entry.id}.json`);
    }
  });

  for (const file of files) {
    it(`${file} matches schema`, () => Article.parse(read(file)));
  }
});
