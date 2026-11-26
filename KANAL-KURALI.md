# Kanal Ana Formatı ve Kalıcı Üretim Kuralları

Bu proje için onaylanan kalıcı ana format: **`cizgi` (Ana Sunucu: `Arda` + Robot/İnsan Yardımcılar + Mixkit SFX) + OpenMontage tarzı çizgi sayaç ve karşılaştırma kartları**.

## 0. Kanal Adı ve Karakter Kadrosu (Kalıcı)
- **Kanal Adı:** `Dijitalİz` (`@dijitaliz.ai`)
- **Ana Sunucu (`Arda`):** #7 Siber Dedektif (koyu trençkot, lacivert/cyan fötr şapka, yuvarlak gözlük) — videoların ana yüzü.
- **Yardımcılar:** Diyalog ve çeşitlilik için gerektiğinde **robot/telefon yardımcılar (`Bit`, `Cep`)** ve **insan yardımcı (`Elif`)** sahnelerde Arda'ya eşlik eder.
- **Seslendirme (ElevenLabs):**
  - **Erkek ses (Arda / Bit / Cep):** **Charlie** (`IKne3meq5aSn9XLyUdCD`) — varsayılan `voiceId`.
  - **Kadın ses (Elif):** **Jessica** (`cgSgspJ2msm6clMCkdW9`) — `script.json` içinde Elif sahneleri `{ "text": "...", "voiceId": "cgSgspJ2msm6clMCkdW9" }` şeklinde yazılır.
  - **Akıcı tempo ayarları:** `speed: 1.12`, `stability: 0.4`, `style: 0.25` (`scripts/tts-eleven.mjs` varsayılanı).

## 1. İçerik ve Tempo Kuralları
- **İlk 2 saniye kancası:** Her video günlük hayattan merak uyandıran kısa bir soru veya şaşırtıcı bir iddiayla başlar (sıkıcı giriş yok).
- **Samimi ve akıcı dil:** Ansiklopedi gibi değil, arkadaşına ilginç bir şey anlatır gibi kısa, doğal Türkçe cümleler kurulur.
- **Toplam süre:** **18–30 saniye** arasında kalır.
- **Sıkmayan görsel tempo:** Her **2–3 saniyede bir** ekranda yeni bir hareket olur (robotun/insanın mimik/duygu değişimi, konuşma balonu, arka plan rengi geçişi, animasyonlu `CizgiStatBar` yüzde/sayaç veya `CizgiComparisonCard` / `Card` vurgu kartı).
- **Görsel Zenginlik ve Çeşitlilik:** Videolar sade kalmaz; sahnelerde **gerçek fotoğraflar** (Wikimedia Commons / Ken Burns yavaş zoom), **karakter değişimleri** (`Arda`, `Elif`, `Bit`, `Cep` dönüşümlü), `Sunburst` ışınları, `Flash` geçişleri ve `Stamp` damgaları harmanlanır.
- **Kapanış:** Ses bittikten en fazla **0.6–0.8 saniye** sonra video biter (`Math.ceil((voice.duration + 0.7) * FPS)`); sonda gereksiz sessiz bekleme olmaz ve izleyiciyi yoruma çekecek tek cümlelik esprili bir kapanış yapılır.

## 2. Görsel Yerleşim ve Animasyon Kuralları
- **Test rozeti yok:** Videoların üstünde `2 · SHORTS-SKILSS` gibi test etiketleri bulunmaz.
- **Taşma (overshoot) kontrolü:** `Card` ve `Stamp` giriş animasyonları yumuşak damping (`16`) kullanır ve `maxWidth: 900` ile ekran dışına taşmaz.
- **Robot anteni güvenli alanı:** `Bit` (`y={1185}`) karakterinin antenine değmemesi için üstteki büyük vurgu kartları (`Stamp`, `Card`, `CizgiStatBar`, `CizgiComparisonCard`) `y={350..460}` bandına hizalanır.
- **Altyazı:** `TagCaptions` (Bitter serif, somon etiket) ve ses efektleri (`Sfx` Mixkit) her sahne ve görsel olayda kullanılır.

## 3. İş Bölümü ve Kalite Kontrolü
- **Antigravity (Ben):** Konu araştırması, senaryo, ElevenLabs seslendirme, sahne kodlama, yerel kontrol kareleriyle hızlı görsel doğrulama ve GitHub'a pushlama.
- **GitHub Actions:** Yalnızca `1080×1920 Full HD` render alıp indirilebilir Artifact (ve hazır olduğunda Instagram paylaşımı) üretir; bulutta Gemini API kontrolü çalıştırılmaz.
- **Gemini Masaüstü Uygulaması:** İndirilen `.mp4` videosunu kendi PC'ndeki `Gemini` uygulamasındaki *"github deposu analizi"* sohbetine sürükleyip son gözle kontrol ettirebilirsin.
