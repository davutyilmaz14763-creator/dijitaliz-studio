# Kanal Ana Formatı ve Kalıcı Üretim Kuralları (v3 — Stilize 3D Dünya + 2D Aktör)

Bu proje için onaylanan kalıcı ana format: **Konturlu Stilize 3D Mekânlar (`src/reels/three/`) + 3D Uzayda Yaşayan 2D `Arda` Aktörü + Kayan 3D Kamera + Viral HUD/Altyazı (`ViralHeadline`, `ViralCaptions`, `BgMusic`, Mixkit `Sfx`)**.

## 0. Kanal Adı, Karakter Kadrosu ve Seslendirme
- **Kanal Adı:** `Dijitalİz` (`@dijitaliz.ai`)
- **Ana Aktör (`Arda`):** #7 Siber Dedektif — 3D sahnenin zemininde, tezgâh arkasında veya koridor içinde konumlanan, yürüyen ve tepki veren 2D billboard/plane aktörü (`Arda3D`). Havada asılı sticker gibi durmaz.
- **Yardımcılar:** Küçük yardımcı robot kafalar (`MiniBot`) gerektiğinde sahnede eşlik eder; başka insan karakter kullanılmaz.
- **Seslendirme (ElevenLabs — Tek Doğal Erkek Ses):**
  - `.env` içindeki `ELEVEN_VOICE_ID` (**George** `JBFqnCBsd6RMkjVDRZzb`, yedek **Will** `bIHbv24MWmeRgasZH58o`) ve `ELEVEN_MODEL` (`eleven_multilingual_v2` / `eleven_v3`).
  - Kısa, nefesli, hızlı tempolu cümleler (`23–27 sn`).

## 1. Stilize 3D Dünya ve Stok Fotoğraf Kuralı
- **Stok Fotoğraf Yok:** Gerçek stok fotoğraflar (`RealPhotoBg`) ana arka plan olarak **kullanılmaz**. Yalnızca gerçek belge/kanıt gereken özel anlarda ekrana inen insert kart (`InsertCard`) içinde kullanılabilir.
- **Konturlu Stilize 3D Mekân (`@sonpart.dizi` tarzı):** Tüm sahneler konturlu/cel-shaded kutular, zemin karoları, raflar, ışıklar ve 3D nesnelerle (`src/reels/three/`) kurulur.
- **Kayan 3D Kamera:** Her sahnede `interpolate` tabanlı kayan 3D kamera (`wide`, `corridor fly-through`, `close-up`) ile açı değişir.

## 2. 6 Vuruşlu Akış, Altyazı ve Kapanış
- **İlk 0.5 sn Kancası:** Frame 0'dan itibaren 3D mekân + kayan kamera + büyük `ViralHeadline` + `Arda` + kısa `Sfx` başlar.
- **Altyazı (`ViralCaptions`):** 2–3 kelimelik akıcı gruplar halinde en alt güvenli alanda yer alır; yalnızca 1 anahtar kelime altın renkle (`#FACC15`) vurgulanır ve hiçbir panel başlığıyla çakışmaz.
- **Final İkilemi & Ses:** Konuşma altında net duyulan `BgMusic` (`0.14–0.18`), bayat CTA olmadan vurucu üst–alt `SplitScreen` finali ve son kelimeden `+0.5 sn` sonra kesilir.

## 3. Doğrulama, Çıktı ve Render
- `npx tsc --noEmit` + 5 yerel kontrol karesi (0., 6., 13., 19., 24. sn) doğrulaması yapılır.
- GitHub Actions (`render.yml` `--gl=swiftshader`) üzerinden Full HD `.mp4` Artifact alınır; `publish_ig` onay olmadan `false` kalır.
- İndirilen/üretilen her `.mp4` mutlaka `C:\Users\Davut Can\Desktop\Kanal-Studio\out\` klasörüne kaydedilir.
