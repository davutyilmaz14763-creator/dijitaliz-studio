// Geçici ücretsiz Türkçe seslendirme (msedge-tts) + kelime zamanları.
// Kullanım: node scripts/tts-edge.mjs <reel>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1")), "..");
const reel = process.argv[2];
if (!reel) throw new Error("kullanım: node scripts/tts-edge.mjs <reel>");

const cfg = JSON.parse(fs.readFileSync(path.join(root, "src/reels", reel, "script.json"), "utf8"));
const sceneTexts = cfg.scenes.map((x) => (typeof x === "string" ? x : x.text));
const voiceName = cfg.voiceId || "tr-TR-AhmetNeural";

const outDir = path.join(root, "public", reel);
const tmpDir = path.join(outDir, "_edge_tmp");
fs.mkdirSync(tmpDir, { recursive: true });

const tts = new MsEdgeTTS();
await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
  wordBoundaryEnabled: true,
});

const GAP = 0.25;
const parts = [];
const allWords = [];
let offset = 0;

for (const [si, text] of sceneTexts.entries()) {
  const sceneDir = path.join(tmpDir, `s${si}`);
  fs.mkdirSync(sceneDir, { recursive: true });
  const { audioFilePath, metadataFilePath } = await tts.toFile(sceneDir, text);
  const dur = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audioFilePath])
      .toString()
      .trim(),
  );
  parts.push(audioFilePath);

  let usedMeta = false;
  if (metadataFilePath && fs.existsSync(metadataFilePath)) {
    try {
      const raw = fs.readFileSync(metadataFilePath, "utf8").trim();
      const meta = JSON.parse(raw);
      const list = Array.isArray(meta) ? meta : meta.Metadata ?? [];
      const wb = list.filter((m) => m.Type === "WordBoundary" && m.Data?.text?.Text);
      if (wb.length > 0) {
        const rawTokens = text.split(/\s+/).filter(Boolean);
        // Edge TTS ticks are 100ns units
        for (let i = 0; i < wb.length; i++) {
          const d = wb[i].Data;
          const start = offset + d.Offset / 1e7;
          const end = start + Math.max(0.08, d.Duration / 1e7);
          const wordText = rawTokens[i] ?? d.text.Text;
          allWords.push({ text: wordText, start: +start.toFixed(3), end: +end.toFixed(3), scene: si });
        }
        usedMeta = true;
      }
    } catch {
      usedMeta = false;
    }
  }

  if (!usedMeta) {
    const tokens = text.split(/\s+/).filter(Boolean);
    const totalChars = tokens.reduce((a, b) => a + b.length, 0) || 1;
    let cur = offset + 0.05;
    const usable = Math.max(0.2, dur - 0.1);
    for (const tok of tokens) {
      const wDur = (tok.length / totalChars) * usable;
      allWords.push({ text: tok, start: +cur.toFixed(3), end: +(cur + wDur).toFixed(3), scene: si });
      cur += wDur;
    }
  }

  console.log(`sahne ${si}: ${dur.toFixed(2)} s`);
  offset += dur + GAP;
}

tts.close();

const inputs = parts.flatMap((p) => ["-i", p]);
const filter =
  parts.map((_, i) => `[${i}:a]aresample=44100,aformat=channel_layouts=mono${i < parts.length - 1 ? `,apad=pad_dur=${GAP}` : ""}[a${i}];`).join("") +
  parts.map((_, i) => `[a${i}]`).join("") +
  `concat=n=${parts.length}:v=0:a=1[o]`;

execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", filter, "-map", "[o]", "-c:a", "libmp3lame", "-b:a", "160k", path.join(outDir, "voice.mp3")]);
fs.rmSync(tmpDir, { recursive: true, force: true });

const duration = allWords.length ? allWords.at(-1).end : 0;
const out = { fake: false, model: voiceName, duration: +duration.toFixed(3), words: allWords };
fs.writeFileSync(path.join(root, "src/reels", reel, "voice.json"), JSON.stringify(out, null, 1));
console.log(`EdgeTTS ${voiceName} · ${allWords.length} kelime · ${duration.toFixed(2)} s`);
