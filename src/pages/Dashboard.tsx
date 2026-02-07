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
    <div class="max-w-2xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-semibold mb-1 tracking-tight text-zinc-100">Learn Mandarin</h1>
      <p class="text-zinc-500 mb-10">Read. Review. Repeat.</p>

      {dueCount > 0 && (
        <a href="/review" class="group mb-10 block rounded-2xl p-5 transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30">
          <span class="text-lg font-semibold text-white">{dueCount} cards due for review</span>
          <span class="block text-blue-200/70 text-sm mt-1 group-hover:text-blue-100/80 transition-colors">Tap to start &rarr;</span>
        </a>
      )}

      <h2 class="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-4">Articles</h2>
      <div class="space-y-2">
        {articles.length === 0 && <p class="text-zinc-600 italic">No articles yet.</p>}
        {articles.map(a => (
          <a key={a.id} href={`/read/${a.id}`} class="group block bg-zinc-900/60 rounded-xl p-4 transition-all border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/60 hover:-translate-y-px">
            <span class="text-lg font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">{a.title}</span>
            <span class="ml-2 text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{a.level}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
