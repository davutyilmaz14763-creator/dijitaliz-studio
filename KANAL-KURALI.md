# Kanal Ana Formatı ve Kalıcı Üretim Kuralları (v4 — 3D Mini Dizi Motoru)

Bu proje için onaylanan kalıcı ana format: **2. Tekil Şahıs ("Sen") Hikâye Akışlı, Aksiyonlu 3D `Arda` Aktörlü + 6 Farklı Sinema Kamera Açılı Stilize 3D Mini Dizi (`src/reels/three/`)**.

## 0. Kanal Adı, Aktör ve Seslendirme
- **Kanal Adı:** `Dijitalİz` (`@dijitaliz.ai`)
- **Aksiyonlu Ana Aktör (`Arda3D`):** Sabit sticker yasaktır. 3D sahnenin gerçek derinliğinde (otoparkta, araba arkasında, raflar arasında, kasa önünde) yürüyen ve iş yapan **5 aksiyon pozu** kullanılır: `front`, `back`, `pushCart`, `holdReceipt`, `closeupShock`.
- **Seslendirme & Fon Müziği:**
  - `.env` içindeki `ELEVEN_VOICE_ID` (**George** `JBFqnCBsd6RMkjVDRZzb`, yedek **Will** `bIHbv24MWmeRgasZH58o`), `speed: 1.06–1.08`.
  - Konuşma altında net duyulan `BgMusic` (`0.14–0.18`) ve sahneye uygun foley Mixkit `Sfx` (kapı zili, sepet düşüş *pop*, kasa *bip*, fiş açılışı).

## 1. Anlatım, Kamera ve Tam Ekran Kuralı
- **2. Tekil Şahıs ("Sen") Mini Dizi:** İzleyiciyi hikâyenin içine çeken *"girdin, baktın, fark ettin"* kurgusu (~28–33 sn).
- **Üst Başlık Kalabalığı Yok:** Tepede dev başlık veya sabit bilgi kutuları konmaz; ekranın %100'ü 3D mini dizi sahnesine aittir.
- **En Az 5–6 Farklı Kamera Açısı:** Dış giriş → 45° yan takip → omuz üstü / arkadan koridor → üst çapraz yakın plan → kasa tezgâhı → yakın yüz şoku → temiz tam ekran üst–alt ikilem finali.
- **Kadraj Kuralı:** `Arda3D` hiçbir karede sol/sağ kenardan kesilmez.

## 2. Altyazı, Doğrulama ve Çıktı
- **Altyazı (`ViralCaptions`):** En alt güvenli alanda 2–3 kelimelik akıcı gruplar; yalnızca 1 anahtar kelime altın renkte (`#FACC15`).
- **Stok Fotoğraf Yok:** Tüm sahneler siyah `#161616` konturlu sıcak stilize 3D dünyadır (`EdgesGeometry`).
- **Doğrulama & Çıktı:** `npx tsc --noEmit` + her sahneden 1 adet olmak üzere 6 kontrol karesi (PNG) doğrulanır → GitHub Actions (`--gl=swangle`, `publish_ig: false`) → `.mp4` mutlaka `C:\Users\Davut Can\Desktop\Kanal-Studio\out\` klasörüne kaydedilir.

### Kalite Önceliği (Hız Uğruna Kaliteden Ödün Yok)
- **Render süresi kısıtımız yok:** Tüm Full HD render'lar bulutta (GitHub Actions) alındığı için "hızlı render alsın" diye düşük detay, sadeleştirilmiş kutu/küp, dokusuz düz yüzey, gölgesiz ışık veya eksik animasyon kesinlikle kullanma.
- **Maksimum görsel gerçekçilik ve sürükleyicilik:**
  - 3D sahnelerde tam detaylı objeler, gerçekçi etiketli Canvas dokular, antialiasing, yumuşak gölgeler (`shadows` + `castShadow`/`receiveShadow`), atmosfer sisi (`fog`), ışık parlamaları ve doğal sinematik kamera ivmeleri (`Easing`) kullan.
  - Karakter (`Arda` ve gerekiyorsa yan karakterler) her sahnede gerçek aksiyon, doğal yürüyüş adımı, göz kırpma, el/kol hareketi ve anlık duygu tepkileriyle canlı olsun.
  - Her bölümde en az 5–6 farklı sinema kamera açısı, temiz foley ses efektleri ve sinematik ses dengesi (konuşma + fon müziği + SFX) eksiksiz kurulsun.
- **Çıktı kalitesi:** `remotion.config.ts` ve `render.yml` tarafında yüksek görüntü kalitesi (`setVideoImageFormat("png")`, `setCrf(15)`) korunur.
