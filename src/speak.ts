export function speak(text: string) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";

  // TTS voice is configurable via localStorage. Set it once in the browser console:
  //   localStorage.setItem("voice", "Tingting")
  // Run speechSynthesis.getVoices().filter(v => v.lang.startsWith("zh")) to see options.
  const preferred = localStorage.getItem("voice");
  const match = preferred && speechSynthesis.getVoices().find((v) => v.name === preferred);
  if (match) u.voice = match;

  speechSynthesis.speak(u);
}
