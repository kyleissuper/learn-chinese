import { vi } from "vitest";

export function makeArticle(overrides = {}) {
  return {
    title: "测试文章",
    titlePinyin: "Cè shì wén zhāng",
    titleTranslation: "Test Article",
    level: "HSK 3",
    paragraphs: [
      [
        { text: "你", pinyin: "nǐ", definition: "you" },
        { text: "好", pinyin: "hǎo", definition: "good" },
        { text: "。" },
      ],
    ],
    ...overrides,
  };
}

export function makeCards(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i + 1}`,
    front: `字${i + 1}`,
    pinyin: `zì${i + 1}`,
    definition: `meaning ${i + 1}`,
    example: `example ${i + 1}`,
    exampleTranslation: `translation ${i + 1}`,
  }));
}

export function makeArticleIndex(count = 2) {
  return Array.from({ length: count }, (_, i) => ({
    id: `article-${i + 1}`,
    title: `Article ${i + 1}`,
    level: "HSK 3",
  }));
}

/**
 * Install a mock for global fetch. Returns the mock function.
 * Caller provides a handler: (url, init) => Response-like value.
 */
export function mockFetch(handler: (url: string, init?: RequestInit) => unknown) {
  const fn = vi.fn((url: string, init?: RequestInit) => {
    const result = handler(url, init);
    return Promise.resolve(result);
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

/** Shorthand: resolve JSON response */
export function jsonResponse(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) };
}

/** Stub the Web Speech API (jsdom doesn't provide it). Returns the speak mock. */
export function mockSpeechSynthesis() {
  vi.stubGlobal("SpeechSynthesisUtterance", class {
    text = ""; lang = "";
    constructor(text: string) { this.text = text; }
  });
  const speak = vi.fn();
  vi.stubGlobal("speechSynthesis", { speak, cancel: vi.fn() });
  return speak;
}

/** Shorthand: error response */
export function errorResponse(status = 404) {
  return { ok: false, status, json: () => Promise.reject(new Error("error")) };
}
