import { useEffect, useState } from "preact/hooks";

interface Segment {
  text: string;
  pinyin?: string;
  definition?: string;
}

interface Article {
  title: string;
  titlePinyin: string;
  titleTranslation: string;
  level: string;
  paragraphs: Segment[][];
}

interface WordProps {
  seg: Segment;
  active: boolean;
  showPinyin: boolean;
  onTap: () => void;
}

function speak(text: string) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  speechSynthesis.speak(u);
}

function Word({ seg, active, showPinyin, onTap }: WordProps) {
  return (
    <span class="word relative inline-block" onClick={(e) => { e.stopPropagation(); onTap(); }}>
      <ruby>
        {seg.text}
        <rt class={`text-xs text-stone-400 font-normal ${showPinyin ? "" : "hidden"}`}>
          {seg.pinyin}
        </rt>
      </ruby>
      {active && (
        <div class="popup">
          <span class="py">{seg.pinyin}</span>
          {seg.definition}
          <button
            class="speak-btn ml-2 text-stone-400 hover:text-stone-600"
            aria-label={`Speak ${seg.text}`}
            onClick={(e) => { e.stopPropagation(); speak(seg.text); }}
          >🔊</button>
        </div>
      )}
    </span>
  );
}

export function Reader({ id }: { id?: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [showPinyin, setShowPinyin] = useState(false);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/content/articles/${id}.json`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(setArticle)
      .catch(() => setError(true));
  }, [id]);

  useEffect(() => {
    const dismiss = () => setActiveWord(null);
    document.addEventListener("click", dismiss);
    return () => document.removeEventListener("click", dismiss);
  }, []);

  if (error) return <div class="max-w-2xl mx-auto px-4 py-8"><p class="text-stone-400">Article not found.</p></div>;
  if (!article) return <div class="max-w-2xl mx-auto px-4 py-8"><p class="text-stone-400">Loading...</p></div>;

  return (
    <div class="max-w-2xl mx-auto px-4 py-8" onClick={() => setActiveWord(null)}>
      <a href="/" class="text-stone-400 hover:text-stone-600 text-sm mb-4 inline-block">&larr; Back</a>
      <h1 class="text-3xl font-bold mb-1">{article.title}</h1>
      <p class="text-stone-500 text-sm mb-6">{article.titlePinyin} — {article.titleTranslation} · {article.level}</p>
      <label class="flex items-center gap-2 mb-6 text-sm text-stone-500 select-none">
        <input type="checkbox" checked={showPinyin} onChange={() => setShowPinyin(!showPinyin)} class="rounded" />
        Show all pinyin
      </label>
      <article class="text-2xl leading-relaxed space-y-6">
        {article.paragraphs.map((para, i) => (
          <p key={i}>
            {para.map((seg, j) => {
              const key = `${i}-${j}`;
              return seg.pinyin
                ? <Word key={key} seg={seg} active={activeWord === key} showPinyin={showPinyin} onTap={() => setActiveWord(activeWord === key ? null : key)} />
                : seg.text;
            })}
          </p>
        ))}
      </article>
    </div>
  );
}
