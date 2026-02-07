import { render, screen, waitFor } from "@testing-library/preact";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "../../src/pages/Dashboard";
import { makeArticleIndex, makeCards, mockFetch, jsonResponse } from "./helpers";

describe("Dashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders heading and tagline", async () => {
    mockFetch((url) => {
      if (url.includes("index.json")) return jsonResponse([]);
      return jsonResponse([]);
    });
    render(<Dashboard />);
    expect(screen.getByText("Learn Mandarin")).toBeInTheDocument();
    expect(screen.getByText("Read. Review. Repeat.")).toBeInTheDocument();
  });

  it("renders article list", async () => {
    const articles = makeArticleIndex(2);
    mockFetch((url) => {
      if (url.includes("index.json")) return jsonResponse(articles);
      return jsonResponse([]);
    });
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Article 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Article 2")).toBeInTheDocument();
  });

  it("article links point to /read/:id", async () => {
    const articles = makeArticleIndex(1);
    mockFetch((url) => {
      if (url.includes("index.json")) return jsonResponse(articles);
      return jsonResponse([]);
    });
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Article 1")).toBeInTheDocument();
    });
    const link = screen.getByText("Article 1").closest("a");
    expect(link).toHaveAttribute("href", "/read/article-1");
  });

  it("shows due count CTA when cards due", async () => {
    mockFetch((url) => {
      if (url.includes("index.json")) return jsonResponse(makeArticleIndex(1));
      return jsonResponse(makeCards(5));
    });
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("5 cards due for review")).toBeInTheDocument();
    });
  });

  it("hides CTA when no cards due", async () => {
    mockFetch((url) => {
      if (url.includes("index.json")) return jsonResponse(makeArticleIndex(1));
      return jsonResponse([]);
    });
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Article 1")).toBeInTheDocument();
    });
    expect(screen.queryByText(/cards due for review/)).not.toBeInTheDocument();
  });

  it("empty state when no articles", async () => {
    mockFetch((url) => {
      if (url.includes("index.json")) return jsonResponse([]);
      return jsonResponse([]);
    });
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/No articles yet/)).toBeInTheDocument();
    });
  });

  it("handles cards API failure gracefully", async () => {
    mockFetch((url) => {
      if (url.includes("index.json")) return jsonResponse(makeArticleIndex(1));
      return Promise.reject(new Error("network error"));
    });
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Article 1")).toBeInTheDocument();
    });
    // Should not crash, CTA should not appear
    expect(screen.queryByText(/cards due for review/)).not.toBeInTheDocument();
  });
});
