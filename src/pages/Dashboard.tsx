import { useEffect, useState } from "preact/hooks";

interface Article {
  id: string;
  title: string;
  level: string;
}

export function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    fetch("/content/articles/index.json")
      .then(r => r.json())
      .then(setArticles);
    fetch("/api/cards?due=true")
      .then(r => r.json())
      .then(c => setDueCount(c.length))
      .catch(() => {});
  }, []);

  return (
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-2">Learn Mandarin</h1>
      <p class="text-stone-500 mb-8">Read. Review. Repeat.</p>

      {dueCount > 0 && (
        <a href="/review" class="mb-8 block bg-blue-600 text-white rounded-xl p-4 hover:bg-blue-700 transition">
          <span class="text-lg font-semibold">{dueCount} cards due for review</span>
          <span class="block text-blue-200 text-sm mt-1">Tap to start</span>
        </a>
      )}

      <h2 class="text-xl font-semibold mb-4">Articles</h2>
      <div class="space-y-3">
        {articles.length === 0 && <p class="text-stone-400">No articles yet. Run the agent to generate some!</p>}
        {articles.map(a => (
          <a key={a.id} href={`/read/${a.id}`} class="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-stone-200">
            <span class="text-lg font-medium">{a.title}</span>
            <span class="ml-2 text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{a.level}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
