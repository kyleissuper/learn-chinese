import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
      .then(r => { if (!r.ok) throw r; return r.json(); })
      .then(setArticles)
      .catch(() => {});
    fetch("/api/cards?due=true")
      .then(r => { if (!r.ok) throw r; return r.json(); })
      .then(c => setDueCount(c.length))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-1 tracking-tight text-zinc-100">Learn Mandarin</h1>
      <p className="text-zinc-500 mb-10">Read. Review. Repeat.</p>

      {dueCount > 0 && (
        <Link to="/review" className="group mb-10 block rounded-2xl p-5 transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30">
          <span className="text-lg font-semibold text-white">{dueCount} cards due for review</span>
          <span className="block text-blue-200/70 text-sm mt-1 group-hover:text-blue-100/80 transition-colors">Tap to start &rarr;</span>
        </Link>
      )}

      <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-4">Articles</h2>
      <div className="space-y-2">
        {articles.length === 0 && <p className="text-zinc-600 italic">No articles yet.</p>}
        {articles.map(a => (
          <Link key={a.id} to={`/read/${a.id}`} className="group block bg-zinc-900/60 rounded-xl p-4 transition-all border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/60 hover:-translate-y-px">
            <span className="text-lg font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">{a.title}</span>
            <span className="ml-2 text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{a.level}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
