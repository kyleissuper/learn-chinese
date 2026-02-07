import { useEffect, useState } from "preact/hooks";
import { SpeakButton } from "../components/SpeakButton";

interface Card {
  id: string;
  front: string;
  pinyin: string;
  definition: string;
  example: string;
  exampleTranslation: string;
}

const RATINGS = [
  { value: 1, label: "Again", style: "bg-red-950 text-red-400 border border-red-900" },
  { value: 2, label: "Hard",  style: "bg-orange-950 text-orange-400 border border-orange-900" },
  { value: 3, label: "Good",  style: "bg-green-950 text-green-400 border border-green-900" },
  { value: 4, label: "Easy",  style: "bg-blue-950 text-blue-400 border border-blue-900" },
] as const;

export function Review() {
  const [cards, setCards] = useState<Card[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Fetch due cards on mount ([] = run once)
  useEffect(() => {
    fetch("/api/cards?due=true")
      .then(r => r.json())
      .then(c => { setCards(c); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  // Keyboard shortcuts: space to flip, 1-4 to rate.
  // Re-registers on every render (no deps) so the handler sees fresh state.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setFlipped(true);
      }
      const r = RATINGS.find(r => String(r.value) === e.key);
      if (r && flipped) rate(r.value);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  });

  function rate(rating: number) {
    const c = cards[cardIndex];
    fetch("/api/review", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: c.id, rating }),
    });
    setReviewed(r => r + 1);
    setCardIndex(i => i + 1);
    setFlipped(false);
  }

  const done = loaded && (cards.length === 0 || cardIndex >= cards.length);
  const card = cards[cardIndex];

  return (
    <div class="page-enter max-w-md mx-auto px-4 py-12 flex flex-col items-center">
      <a href="/" class="self-start text-zinc-600 hover:text-zinc-400 text-sm mb-6 transition-colors">&larr; Back</a>

      {!done && card && <>
        {/* Progress bar */}
        <div class="w-full mb-6 flex items-center gap-3">
          <div class="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${((cardIndex) / cards.length) * 100}%` }} />
          </div>
          <span class="text-zinc-600 text-xs tabular-nums">{cardIndex + 1}/{cards.length}</span>
        </div>

        <div key={card.id} class="card-enter w-full bg-zinc-900/80 rounded-2xl border border-zinc-800/60 p-8 text-center min-h-[260px] flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={() => setFlipped(true)}>
          {!flipped
            ? <p class="text-5xl font-semibold text-zinc-100">{card.front}</p>
            : <div class="card-enter">
                <p class="text-2xl text-blue-400 mb-2">
                  {card.pinyin}
                  <SpeakButton text={card.front} />
                </p>
                <p class="text-xl text-zinc-200">{card.definition}</p>
                {card.example && <p class="text-zinc-400 mt-4 text-lg">
                  {card.example}
                  <SpeakButton text={card.example} class="text-base" />
                </p>}
                {card.exampleTranslation && <p class="text-zinc-600 text-sm mt-1">{card.exampleTranslation}</p>}
              </div>
          }
        </div>
        {!flipped && <p class="text-zinc-600 text-sm mt-4">Tap to reveal</p>}
        {flipped && (
          <div class="grid grid-cols-4 gap-2 w-full mt-6">
            {RATINGS.map(r => (
              <button key={r.value} onClick={() => rate(r.value)}
                class={`py-3 rounded-xl font-medium transition-all hover:scale-[1.03] active:scale-[0.97] ${r.style}`}>
                {r.label}
              </button>
            ))}
          </div>
        )}
      </>}

      {done && (
        <div class="page-enter text-center mt-20">
          <p class="text-4xl font-medium mb-3 text-zinc-100">All caught up!</p>
          <p class="text-zinc-500 mb-8">{reviewed ? `Reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}.` : "No cards due right now."}</p>
          <a href="/" class="inline-block px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-all text-sm">Back to articles</a>
        </div>
      )}
    </div>
  );
}
