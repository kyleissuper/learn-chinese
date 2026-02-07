import { speak } from "../speak";

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  return (
    <button
      className={`ml-2 text-zinc-500 hover:text-zinc-300 ${className ?? ""}`}
      aria-label={`Speak ${text}`}
      onClick={(e) => { e.stopPropagation(); speak(text); }}
    >🔊</button>
  );
}
