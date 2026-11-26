// Render edilen videoyu Gemini (gemini-2.5-flash) ile görsel + işitsel kontrol eder.
// Kullanım: node scripts/gemini-review.mjs out/<video>.mp4
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const root = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1")), "..");
const env = Object.fromEntries(
  (fs.existsSync(path.join(root, ".env")) ? fs.readFileSync(path.join(root, ".env"), "utf8") : "")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GOOGLE_API_KEY yok (.env)");

const videoArg = process.argv[2];
if (!videoArg) throw new Error("Kullanım: node scripts/gemini-review.mjs <video-yolu>");
const videoPath = path.isAbsolute(videoArg) ? videoArg : path.join(root, videoArg);
if (!fs.existsSync(videoPath)) throw new Error(`Dosya bulunamadı: ${videoPath}`);

const ai = new GoogleGenAI({ apiKey });

console.log(`Yükleniyor: ${path.basename(videoPath)}...`);
let file = await ai.files.upload({
  file: videoPath,
  config: { mimeType: "video/mp4" },
});

while (file.state === "PROCESSING") {
  await new Promise((r) => setTimeout(r, 3000));
  file = await ai.files.get({ name: file.name });
}
if (file.state !== "ACTIVE") {
  throw new Error(`Gemini dosya işleme hatası: ${file.state}`);
}

const prompt = `Bu dikey (9:16) Türkçe YouTube Shorts / Instagram Reels videosunu hem görüntü hem ses açısından incele ve kısa, net bir rapor ver:
1. Görsel Yerleşim: Kartlar, damgalar, başlıklar veya altyazılar karakterlerin üstüne biniyor mu ya da ekran kenarından taşıyor mu?
2. Ses ve Senkron: Türkçe telaffuz anlaşılır mı, ses-altyazı senkronu ve ses efektleri dengeli mi?
3. Tempo ve Kanca: İlk 2 saniye dikkat çekiyor mu, tempo sıkıcı mı akıcı mı, kapanış nasıl?
4. Düzeltilmesi Gerekenler: Varsa somut zaman damgasıyla (ör. 00:12) 1-3 maddede listele; sorun yoksa "Yayınlanmaya hazır" de.`;

try {
  const models = ["gemini-3.8-flash", "gemini-3.8-flash", "gemini-3.8-flash", "gemini-3.8-flash-lite"];
  let res = null;
  let lastErr = null;
  for (const model of models) {
    try {
      res = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { fileData: { fileUri: file.uri, mimeType: file.mimeType } },
              { text: prompt },
            ],
          },
        ],
      });
      break;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 6000));
    }
  }
  if (!res) throw lastErr;
  console.log("\n=== GEMİNİ VİDEO KONTROL RAPORU ===\n");
  console.log(res.text);
} finally {
  await ai.files.delete({ name: file.name }).catch(() => {});
}
