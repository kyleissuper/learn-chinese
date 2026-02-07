import { useEffect, useState } from "preact/hooks";
import { SpeakButton } from "../components/SpeakButton";

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

function Word({ seg, active, showPinyin, onTap }: WordProps) {
  const clamp = (el: HTMLDivElement | null) => {
    if (!el) return;
    const { left, right } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    if (left < 8) el.style.transform = `translateX(calc(-50% + ${8 - left}px))`;
    else if (right > vw - 8) el.style.transform = `translateX(calc(-50% - ${right - vw + 8}px))`;
  };

  return (
    <span class="word relative inline-block" onClick={(e) => { e.stopPropagation(); onTap(); }}>
      <ruby>
        {seg.text}
        <rt class={`text-xs text-zinc-500 font-normal ${showPinyin ? "" : "hidden"}`}>
          {seg.pinyin}
        </rt>
      </ruby>
      {active && (
        <div ref={clamp} class="popup">
          <span class="py">{seg.pinyin}</span>
          {seg.definition}
          <SpeakButton text={seg.text} />
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

  if (error) return <div class="max-w-2xl mx-auto px-4 py-12"><p class="text-zinc-600 italic">Article not found.</p></div>;
  if (!article) return (
    <div class="max-w-2xl mx-auto px-4 py-12 space-y-4">
      <p class="sr-only">Loading...</p>
      <div class="skeleton h-8 w-48" />
      <div class="skeleton h-4 w-64" />
      <div class="skeleton h-40 w-full mt-6" />
    </div>
  );

  return (
    <div class="max-w-2xl mx-auto px-4 py-12" onClick={() => setActiveWord(null)}>
      <a href="/" class="text-zinc-600 hover:text-zinc-400 text-sm mb-6 inline-block transition-colors">&larr; Back</a>
      <h1 class="text-3xl font-semibold mb-1 tracking-tight text-zinc-100">{article.title} <SpeakButton text={article.title} /></h1>
      <p class="text-zinc-500 text-sm mb-8">{article.titlePinyin} — {article.titleTranslation} · {article.level}</p>
      <label class="flex items-center gap-2 mb-8 text-sm text-zinc-500 select-none cursor-pointer">
        <input type="checkbox" checked={showPinyin} onChange={() => setShowPinyin(!showPinyin)} class="rounded accent-blue-500" />
        Show all pinyin
      </label>
      <article class="text-2xl leading-relaxed space-y-6 text-zinc-200">
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
