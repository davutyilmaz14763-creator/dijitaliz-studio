// ElevenLabs seslendirme + kelime zamanları.
//   node scripts/tts-eleven.mjs <reel>            -> public/<reel>/voice.mp3 + src/reels/<reel>/voice.json
//   node scripts/tts-eleven.mjs <reel> --fake     -> sadece tahmini zamanlar (anahtar yokken önizleme için)
//   node scripts/tts-eleven.mjs --voices          -> hesaptaki sesleri listeler
// Anahtar: reels-studio/.env içinde ELEVENLABS_API_KEY=...  (.env git'e girmez)
// Metin: src/reels/<reel>/script.json  { voiceId, model?, voiceSettings?, scenes: ["cümle" | { text, ... }] }
// eleven_v3 duygu etiketleri ([excited], [laughs], [whispers] ...) metne yazılabilir; zamanlamadan çıkarılır.
// Uzun metinler sahne sınırlarından parçalara bölünür (v3: ~2400 karakter), sonra birleştirilir.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1")), "..");
const env = Object.fromEntries(
  (fs.existsSync(path.join(root, ".env")) ? fs.readFileSync(path.join(root, ".env"), "utf8") : "")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const KEY = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
const VOICE_ENV = process.env.ELEVENLABS_VOICE_ID || env.ELEVENLABS_VOICE_ID;
const args = process.argv.slice(2);

if (args[0] === "--voices") {
  if (!KEY) throw new Error("ELEVENLABS_API_KEY yok (.env)");
  const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": KEY } });
  const j = await r.json();
  for (const v of j.voices ?? []) console.log(v.voice_id, "|", v.name, "|", v.labels?.gender ?? "", v.labels?.accent ?? "", v.labels?.description ?? "", "|", v.category);
  process.exit(0);
}

const reel = args[0];
if (!reel) throw new Error("kullanım: node scripts/tts-eleven.mjs <reel> [--fake]");
const fake = args.includes("--fake");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "src/reels", reel, "script.json"), "utf8"));
const sceneTexts = cfg.scenes.map((x) => (typeof x === "string" ? x : x.text));
const defaultVoice = cfg.voiceId || VOICE_ENV || "IKne3meq5aSn9XLyUdCD";
const sceneVoices = cfg.scenes.map((x) => (typeof x === "object" && x.voiceId ? x.voiceId : defaultVoice));
const model = cfg.model || "eleven_multilingual_v2";
const isV3 = model === "eleven_v3";
const settings = isV3
  ? { stability: 0.5, similarity_boost: 1.0, ...(cfg.voiceSettings ?? {}) }
  : { stability: 0.4, similarity_boost: 0.85, style: 0.25, use_speaker_boost: true, speed: 1.12, ...(cfg.voiceSettings ?? {}) };
const outDir = path.join(root, "public", reel);
fs.mkdirSync(outDir, { recursive: true });

/** chars + times -> words (skips [audio tags]) */
const toWords = (chars, starts, ends, sceneOfChar, offset) => {
  const words = [];
  let cur = null;
  let depth = 0;
  chars.forEach((ch, i) => {
    if (ch === "[") depth++;
    if (depth > 0 || /\s/.test(ch)) {
      if (ch === "]") depth = Math.max(0, depth - 1);
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { text: "", start: starts[i] + offset, end: ends[i] + offset, scene: sceneOfChar[i] };
    cur.text += ch;
    cur.end = ends[i] + offset;
  });
  if (cur) words.push(cur);
  return words;
};

// chunk scenes (split on character limit OR voiceId change)
const LIMIT = isV3 ? 2400 : 4500;
const chunks = [];
let curChunk = [];
let len = 0;
sceneTexts.forEach((t, i) => {
  const voiceChanged = curChunk.length && sceneVoices[i] !== sceneVoices[curChunk[0]];
  if ((curChunk.length && len + t.length + 1 > LIMIT) || voiceChanged) {
    chunks.push(curChunk);
    curChunk = [];
    len = 0;
  }
  curChunk.push(i);
  len += t.length + 1;
});
if (curChunk.length) chunks.push(curChunk);

const GAP = 0.25;
const allWords = [];
const parts = [];
let offset = 0;
for (const [ci, idxs] of chunks.entries()) {
  const text = idxs.map((i) => sceneTexts[i]).join(" ");
  const sceneOfChar = [];
  idxs.forEach((i) => {
    for (let k = 0; k <= sceneTexts[i].length; k++) sceneOfChar.push(i);
  });
  let chars, starts, ends, dur;
  if (fake) {
    chars = [...text];
    starts = [];
    ends = [];
    let t = 0.15;
    for (const ch of chars) {
      starts.push(t);
      t += /[.?!:]/.test(ch) ? 0.32 : /,/.test(ch) ? 0.16 : 0.058;
      ends.push(t);
    }
    dur = t + 0.2;
  } else {
    if (!KEY) throw new Error("ELEVENLABS_API_KEY yok — reels-studio/.env dosyasına ekle (ya da --fake ile önizle)");
    const chunkVoice = sceneVoices[idxs[0]];
    const body = { text, model_id: model, voice_settings: settings, ...(cfg.language ? { language_code: cfg.language } : {}) };
    if (!isV3) {
      const prev = chunks[ci - 1]?.map((i) => sceneTexts[i]).join(" ");
      const next = chunks[ci + 1]?.map((i) => sceneTexts[i]).join(" ");
      if (prev) body.previous_text = prev.slice(-600);
      if (next) body.next_text = next.slice(0, 600);
    }
    let r;
    for (let attempt = 0; attempt < 3; attempt++) {
      r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${chunkVoice}/with-timestamps?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) break;
      console.log(`parça ${ci + 1}: ${r.status}, tekrar deneniyor…`);
      await new Promise((res) => setTimeout(res, 4000));
    }
    if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const file = path.join(outDir, `_part${ci}.mp3`);
    fs.writeFileSync(file, Buffer.from(j.audio_base64, "base64"));
    parts.push(file);
    ({ characters: chars, character_start_times_seconds: starts, character_end_times_seconds: ends } = j.alignment);
    dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
  }
  allWords.push(...toWords(chars, starts, ends, sceneOfChar, offset));
  console.log(`parça ${ci + 1}/${chunks.length}: sahne ${idxs[0]}–${idxs.at(-1)}, ${text.length} karakter, ${dur.toFixed(1)} s`);
  offset += dur + GAP;
}

if (!fake) {
  // concat parts with GAP seconds of silence between them
  const inputs = parts.flatMap((p) => ["-i", p]);
  const filter =
    parts.map((_, i) => `[${i}:a]aresample=44100,aformat=channel_layouts=mono${i < parts.length - 1 ? `,apad=pad_dur=${GAP}` : ""}[a${i}];`).join("") +
    parts.map((_, i) => `[a${i}]`).join("") +
    `concat=n=${parts.length}:v=0:a=1[o]`;
  execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", filter, "-map", "[o]", "-c:a", "libmp3lame", "-b:a", "160k", path.join(outDir, "voice.mp3")]);
  for (const p of parts) fs.unlinkSync(p);
}

const duration = allWords.length ? allWords.at(-1).end : 0;
const out = { fake, model, duration: +duration.toFixed(3), words: allWords.map((w) => ({ ...w, start: +w.start.toFixed(3), end: +w.end.toFixed(3) })) };
fs.writeFileSync(path.join(root, "src/reels", reel, "voice.json"), JSON.stringify(out, null, 1));
console.log(`${fake ? "TAHMİNİ" : "ElevenLabs " + model} · ${allWords.length} kelime · ${duration.toFixed(2)} s`);
