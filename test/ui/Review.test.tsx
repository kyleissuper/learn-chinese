import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Review } from "../../src/pages/Review";
import { makeCards, mockFetch, jsonResponse, mockSpeechSynthesis, renderWithRouter } from "./helpers";

describe("Review", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows completion screen when no cards due", async () => {
    mockFetch(() => jsonResponse([]));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("All caught up!")).toBeInTheDocument();
    });
    expect(screen.getByText("No cards due right now.")).toBeInTheDocument();
  });

  it("shows first card front (not flipped)", async () => {
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    // Definition should not be visible
    expect(screen.queryByText("meaning 1")).not.toBeInTheDocument();
  });

  it("shows card counter", async () => {
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });
  });

  it("flips card on click", async () => {
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("字1"));
    expect(screen.getByText("meaning 1")).toBeInTheDocument();
  });

  it("flips card on spacebar", async () => {
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.keyDown(document, { key: " " });
    expect(screen.getByText("meaning 1")).toBeInTheDocument();
  });

  it("rating buttons visible only when flipped", async () => {
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    expect(screen.queryByText("Again")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("字1"));
    expect(screen.getByText("Again")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("advances to next card after rating", async () => {
    const fetchMock = mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("字1"));
    fireEvent.click(screen.getByText("Good"));
    await waitFor(() => {
      expect(screen.getByText("字2")).toBeInTheDocument();
    });
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("fires POST /api/review with correct body", async () => {
    const fetchMock = mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("字1"));
    fireEvent.click(screen.getByText("Good"));
    expect(fetchMock).toHaveBeenCalledWith("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: "card-1", rating: 3 }),
    });
  });

  it("number key 1 rates card when flipped", async () => {
    const fetchMock = mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("字1"));
    fireEvent.keyDown(document, { key: "1" });
    await waitFor(() => {
      expect(screen.getByText("字2")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: "card-1", rating: 1 }),
    });
  });

  it("number keys ignored when not flipped", async () => {
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.keyDown(document, { key: "1" });
    // Still on card 1
    expect(screen.getByText("字1")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("completion screen after all cards rated (singular)", async () => {
    mockFetch(() => jsonResponse(makeCards(1)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("字1"));
    fireEvent.click(screen.getByText("Good"));
    await waitFor(() => {
      expect(screen.getByText("All caught up!")).toBeInTheDocument();
    });
    expect(screen.getByText("Reviewed 1 card.")).toBeInTheDocument();
  });

  it("completion screen plural wording", async () => {
    mockFetch(() => jsonResponse(makeCards(2)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    // Rate card 1
    fireEvent.click(screen.getByText("字1"));
    fireEvent.click(screen.getByText("Good"));
    await waitFor(() => {
      expect(screen.getByText("字2")).toBeInTheDocument();
    });
    // Rate card 2
    fireEvent.click(screen.getByText("字2"));
    fireEvent.click(screen.getByText("Good"));
    await waitFor(() => {
      expect(screen.getByText("All caught up!")).toBeInTheDocument();
    });
    expect(screen.getByText("Reviewed 2 cards.")).toBeInTheDocument();
  });

  it("speaks the word when clicking speaker button on back", async () => {
    const speak = mockSpeechSynthesis();
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("字1"));
    fireEvent.click(screen.getByRole("button", { name: "Speak 字1" }));
    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0].text).toBe("字1");
    expect(speak.mock.calls[0][0].lang).toBe("zh-CN");
  });

  it("speaks the example sentence when clicking its speaker button", async () => {
    const speak = mockSpeechSynthesis();
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("字1"));
    fireEvent.click(screen.getByRole("button", { name: "Speak example 1" }));
    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0].text).toBe("example 1");
    expect(speak.mock.calls[0][0].lang).toBe("zh-CN");
  });

  it("back link to home", async () => {
    mockFetch(() => jsonResponse(makeCards(3)));
    renderWithRouter(<Review />);
    await waitFor(() => {
      expect(screen.getByText("字1")).toBeInTheDocument();
    });
    const backLink = screen.getByText("← Back");
    expect(backLink).toHaveAttribute("href", "/");
  });
});
