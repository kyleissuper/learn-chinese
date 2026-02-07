import { speak } from "../speak";

export function SpeakButton({ text, class: cls }: { text: string; class?: string }) {
  return (
    <button
      class={`ml-2 text-stone-400 hover:text-stone-600 ${cls ?? ""}`}
      aria-label={`Speak ${text}`}
      onClick={(e) => { e.stopPropagation(); speak(text); }}
    >🔊</button>
  );
}
