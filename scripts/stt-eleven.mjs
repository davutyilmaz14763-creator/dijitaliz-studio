// ElevenLabs konuşma→metin (kelime zamanlı). Ham çekimlerin transkripti için.
//   node scripts/stt-eleven.mjs <ses.mp3> <cikti.json> [dil=tur]
// Anahtar: reels-studio/.env içindeki ELEVENLABS_API_KEY.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1")), "..");
const env = Object.fromEntries(
  (fs.existsSync(path.join(root, ".env")) ? fs.readFileSync(path.join(root, ".env"), "utf8") : "")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const KEY = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
const [inp, out, lang = "tur"] = process.argv.slice(2);
if (!out) throw new Error("kullanım: node scripts/stt-eleven.mjs <ses> <cikti.json> [dil]");
if (!KEY) throw new Error("ELEVENLABS_API_KEY yok (.env)");

const form = new FormData();
form.append("model_id", "scribe_v1");
form.append("language_code", lang);
form.append("timestamps_granularity", "word");
form.append("tag_audio_events", "false");
form.append("file", new Blob([fs.readFileSync(inp)], { type: "audio/mpeg" }), path.basename(inp));
const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": KEY }, body: form });
if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
const j = await r.json();
const words = (j.words ?? []).filter((w) => w.type === "word").map((w) => ({ text: w.text, start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
fs.writeFileSync(out, JSON.stringify({ text: j.text, words }, null, 1));
console.log(path.basename(inp), "·", words.length, "kelime ·", j.text);
