import { useEffect, useState } from "preact/hooks";

interface Card {
  id: string;
  front: string;
  pinyin: string;
  definition: string;
  example: string;
  exampleTranslation: string;
}

const RATINGS = [
  { value: 1, label: "Again", style: "bg-red-100 text-red-700" },
  { value: 2, label: "Hard",  style: "bg-orange-100 text-orange-700" },
  { value: 3, label: "Good",  style: "bg-green-100 text-green-700" },
  { value: 4, label: "Easy",  style: "bg-blue-100 text-blue-700" },
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
    <div class="max-w-md mx-auto px-4 py-8 flex flex-col items-center">
      <a href="/" class="self-start text-stone-400 hover:text-stone-600 text-sm mb-4">&larr; Back</a>

      {!done && card && <>
        <p class="text-stone-400 text-sm mb-6">{cardIndex + 1} / {cards.length}</p>
        <div class="w-full bg-white rounded-2xl shadow-md border border-stone-200 p-8 text-center min-h-[240px] flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={() => setFlipped(true)}>
          {!flipped
            ? <p class="text-5xl font-bold">{card.front}</p>
            : <div>
                <p class="text-2xl text-blue-500 mb-2">{card.pinyin}</p>
                <p class="text-xl">{card.definition}</p>
                {card.example && <p class="text-stone-500 mt-4 text-lg">{card.example}</p>}
                {card.exampleTranslation && <p class="text-stone-400 text-sm mt-1">{card.exampleTranslation}</p>}
              </div>
          }
        </div>
        {!flipped && <p class="text-stone-400 text-sm mt-4">Tap card to reveal</p>}
        {flipped && (
          <div class="grid grid-cols-4 gap-3 w-full mt-6">
            {RATINGS.map(r => (
              <button key={r.value} onClick={() => rate(r.value)}
                class={`py-3 rounded-xl font-medium ${r.style}`}>
                {r.label}
              </button>
            ))}
          </div>
        )}
      </>}

      {done && (
        <div class="text-center mt-20">
          <p class="text-4xl mb-4">All caught up!</p>
          <p class="text-stone-500 mb-6">{reviewed ? `Reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}.` : "No cards due right now."}</p>
          <a href="/" class="text-blue-600 hover:underline">Back to articles</a>
        </div>
      )}
    </div>
  );
}
