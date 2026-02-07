export function speak(text: string) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";

  // TTS voice is configurable via localStorage. Set it once in the browser console:
  //   localStorage.setItem("voice", "Tingting")
  // Run speechSynthesis.getVoices().filter(v => v.lang.startsWith("zh")) to see options.
  const preferred = localStorage.getItem("voice");
  const match = preferred && voices.find((v) => v.name === preferred);
  if (match) u.voice = match;

  speechSynthesis.speak(u);
}

// Voices load asynchronously — cache them once ready so speak() always finds the match.
let voices: SpeechSynthesisVoice[] = [];
if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.addEventListener("voiceschanged", () => { voices = speechSynthesis.getVoices(); });
  voices = speechSynthesis.getVoices();
}
