import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Reader } from "../../src/pages/Reader";
import { makeArticle, mockFetch, mockSpeechSynthesis, jsonResponse, errorResponse } from "./helpers";

function renderReader(id = "test-1") {
  return render(
    <MemoryRouter initialEntries={[`/read/${id}`]}>
      <Routes>
        <Route path="/read/:id" element={<Reader />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Reader", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows Loading before fetch resolves", () => {
    mockFetch(() => new Promise(() => {})); // never resolves
    renderReader();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders article title and metadata after fetch", async () => {
    const article = makeArticle();
    mockFetch(() => jsonResponse(article));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("测试文章")).toBeInTheDocument();
    });
    expect(screen.getByText(/Cè shì wén zhāng/)).toBeInTheDocument();
    expect(screen.getByText(/HSK 3/)).toBeInTheDocument();
  });

  it("renders clickable words and punctuation as plain text", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    expect(screen.getByText("好")).toBeInTheDocument();
    // Punctuation rendered as text node, not inside a .word span
    expect(screen.getByText("。")).toBeInTheDocument();
  });

  it("shows tooltip popup when clicking a word", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("你"));
    expect(screen.getByText("you")).toBeInTheDocument();
  });

  it("dismisses tooltip when clicking article container", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("你"));
    expect(screen.getByText("you")).toBeInTheDocument();
    // Click on the article container (parent div)
    fireEvent.click(screen.getByText("测试文章").closest("div")!);
    expect(screen.queryByText("you")).not.toBeInTheDocument();
  });

  it("switches tooltip when clicking a different word", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("你"));
    expect(screen.getByText("you")).toBeInTheDocument();
    fireEvent.click(screen.getByText("好"));
    expect(screen.getByText("good")).toBeInTheDocument();
    expect(screen.queryByText("you")).not.toBeInTheDocument();
  });

  it("toggles tooltip off when clicking same word again", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("你"));
    expect(screen.getByText("you")).toBeInTheDocument();
    fireEvent.click(screen.getByText("你"));
    expect(screen.queryByText("you")).not.toBeInTheDocument();
  });

  it("hides pinyin ruby annotations by default", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    // The rt elements should have the "hidden" class
    const rtElements = document.querySelectorAll("rt");
    rtElements.forEach((rt) => {
      expect(rt.className).toContain("hidden");
    });
  });

  it("shows pinyin when checkbox toggled", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    const rtElements = document.querySelectorAll("rt");
    rtElements.forEach((rt) => {
      expect(rt.className).not.toContain("hidden");
    });
  });

  it("shows error when fetch returns 404", async () => {
    mockFetch(() => errorResponse(404));
    renderReader("nonexistent");
    await waitFor(() => {
      expect(screen.getByText("Article not found.")).toBeInTheDocument();
    });
  });

  it("shows error when fetch rejects (network error)", async () => {
    mockFetch(() => Promise.reject(new Error("network error")));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("Article not found.")).toBeInTheDocument();
    });
  });

  it("speaks the word aloud when clicking the speaker button", async () => {
    const speak = mockSpeechSynthesis();
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("你"));
    fireEvent.click(screen.getByRole("button", { name: "Speak 你" }));
    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toBeInstanceOf(SpeechSynthesisUtterance);
    expect(speak.mock.calls[0][0].text).toBe("你");
    expect(speak.mock.calls[0][0].lang).toBe("zh-CN");
  });

  it("dismisses tooltip on click outside article container", async () => {
    mockFetch(() => jsonResponse(makeArticle()));
    renderReader();
    await waitFor(() => {
      expect(screen.getByText("你")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("你"));
    expect(screen.getByText("you")).toBeInTheDocument();
    // Click on document body (outside the article container)
    fireEvent.click(document.body);
    expect(screen.queryByText("you")).not.toBeInTheDocument();
  });
});
