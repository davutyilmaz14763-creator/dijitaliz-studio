// Render edilen videoyu Instagram Graph API üzerinden Reels olarak yayınlar.
// Kullanım:
//   node scripts/ig-publish.mjs --get-id
//   node scripts/ig-publish.mjs --file out/dijitaliz-test.mp4 --caption "Açıklama #etiket"
//   node scripts/ig-publish.mjs --url "https://..." --caption "Açıklama #etiket"
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

const IG_USER_ID = process.env.IG_USER_ID || env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || env.IG_ACCESS_TOKEN;
const GRAPH = "https://graph.facebook.com/v21.0";

if (!IG_ACCESS_TOKEN) {
  throw new Error("IG_ACCESS_TOKEN eksik (.env dosyasını kontrol et)");
}

if (process.argv.includes("--get-id")) {
  const res = await fetch(
    `${GRAPH}/me/accounts?fields=name,instagram_business_account{id,username}&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`,
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`Facebook Pages hatası: ${JSON.stringify(json)}`);
  console.log("Bağlı Sayfalar ve Instagram Hesapları:");
  for (const page of json.data ?? []) {
    console.log(`- Sayfa: ${page.name} (${page.id}) -> IG:`, page.instagram_business_account ?? "Bağlı IG yok");
  }
  process.exit(0);
}

if (!IG_USER_ID) {
  throw new Error("IG_USER_ID eksik — önce 'node scripts/ig-publish.mjs --get-id' ile al ve .env içine yaz");
}

const getArg = (flag) => {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
};

let videoUrl = getArg("--url");
const fileArg = getArg("--file");
const coverArg = getArg("--cover");
const caption = getArg("--caption") ?? "";

const uploadTemp = (localPath) => {
  const abs = path.isAbsolute(localPath) ? localPath : path.join(root, localPath);
  if (!fs.existsSync(abs)) throw new Error(`Dosya bulunamadı: ${abs}`);
  console.log(`0/3 Geçici HTTPS sunucusuna yükleniyor (${path.basename(abs)})...`);
  const url = execFileSync("curl.exe", [
    "-sL",
    "-F", "reqtype=fileupload",
    "-F", "time=24h",
    "-F", `fileToUpload=@${abs}`,
    "https://litterbox.catbox.moe/resources/internals/api.php",
  ])
    .toString()
    .trim();
  if (!url.startsWith("https://")) {
    throw new Error(`Geçici yükleme hatası: ${url}`);
  }
  return url;
};

if (!videoUrl && fileArg) {
  videoUrl = uploadTemp(fileArg);
  console.log(`   Video URL: ${videoUrl}`);
}

const coverUrl = coverArg ? (coverArg.startsWith("http") ? coverArg : uploadTemp(coverArg)) : undefined;
if (coverUrl) console.log(`   Kapak URL: ${coverUrl}`);

if (!videoUrl) {
  throw new Error('Kullanım: node scripts/ig-publish.mjs --file out/video.mp4 --caption "..."');
}

// 1. Medya konteyneri oluştur
console.log("1/3 Reels konteyneri oluşturuluyor...");
const createRes = await fetch(`${GRAPH}/${IG_USER_ID}/media`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    media_type: "REELS",
    video_url: videoUrl,
    ...(coverUrl ? { cover_url: coverUrl } : {}),
    caption,
    share_to_feed: true,
    access_token: IG_ACCESS_TOKEN,
  }),
});
const createJson = await createRes.json();
if (!createRes.ok || !createJson.id) {
  throw new Error(`Konteyner hatası: ${JSON.stringify(createJson)}`);
}
const creationId = createJson.id;

// 2. İşlenmesini bekle
console.log(`2/3 Video işleniyor (id: ${creationId})...`);
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  const stRes = await fetch(`${GRAPH}/${creationId}?fields=status_code,status&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`);
  const st = await stRes.json();
  if (st.status_code === "FINISHED") break;
  if (st.status_code === "ERROR") throw new Error(`Instagram işleme hatası: ${JSON.stringify(st)}`);
}

// 3. Yayınla
console.log("3/3 Reels yayınlanıyor...");
const pubRes = await fetch(`${GRAPH}/${IG_USER_ID}/media_publish`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    creation_id: creationId,
    access_token: IG_ACCESS_TOKEN,
  }),
});
const pubJson = await pubRes.json();
if (!pubRes.ok || !pubJson.id) {
  throw new Error(`Yayınlama hatası: ${JSON.stringify(pubJson)}`);
}

console.log(`YAYINLANDI ✅ Instagram Media ID: ${pubJson.id}`);
