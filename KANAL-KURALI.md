# Kanal Ana Formatı ve Kalıcı Üretim Kuralları (v2)

Bu proje için onaylanan kalıcı ana format: **`cizgi` v2 (Ana Sunucu: `Arda` + Küçük Yardımcı Robot Kafalar `MiniBot` + Gerçek Fotoğraflar `RealPhotoBg` + Viral Grafikler `ChapterHud`, `ViralHeadline`, `ViralCaptions`, `SplitScreen`, `InsertCard`, `BgMusic`, `FloatingParticles`, Mixkit `Sfx`)**.

## 0. Kanal Adı, Karakter Kadrosu ve Seslendirme
- **Kanal Adı:** `Dijitalİz` (`@dijitaliz.ai`)
- **Ana Sunucu (`Arda`):** #7 Siber Dedektif — Instagram profil fotoğrafından uyarlanmış tam vücut 2D çizgi karakter (`shot="wide" | "closeup"` destekli; Faz 2 için opsiyonel `public/arda/<pose>.png` + `lipsync.json` hazır).
- **Yardımcılar (`MiniBot`):** Sahnelerde Arda'ya eşlik eden küçük, yüzen yardımcı robot kafalar. Başka insan karakter kullanılmaz.
- **Seslendirme (ElevenLabs — Tek Doğal Erkek Ses):**
  - `.env` içindeki `ELEVEN_VOICE_ID` (ve `ELEVEN_MODEL`) önceliklidir.
  - **Varsayılan Ses:** **George** (`JBFqnCBsd6RMkjVDRZzb`), yedek: **Will** (`bIHbv24MWmeRgasZH58o`).
  - **Model:** `eleven_v3` (duygu etiketli `[curious]`, `[chuckles]`, `[whispers]`, `[sighs]` destekli) veya yedek `eleven_multilingual_v2` (`stability: 0.40`, `similarity_boost: 0.80`, `style: 0.25`, `speed: 1.02`).
  - **Metin Yazımı:** Kısa, nefesli cümleler; vurgu öncesi `,` / `...` duraklamaları.

## 1. 6 Vuruşlu Senaryo Akışı & İlk 3 Saniye Kuralı
- **6 Vuruşlu Akış (`beats.json` mantığı):** `HOOK (Frame 0 = Kapak)` → `SETUP` → `QUIZ (mini merak sorusu)` → `REVEAL` → `TWIST (ters köşe)` → `SEAMLESS LOOP` (`frame 0 ≈ last frame`).
- **İlk 3 Saniye (Hedef %65+ Tutma):** Klişe *"X neden böyle?"* sorusuyla değil; somut olay, rakam veya ters köşe iddiayla girilir. **Frame 0'da** `RealPhotoBg` + büyük `ViralHeadline` + hareketli `Arda` + kısa Mixkit `Sfx` ilk `0.5 sn` içinde devreye girer.
- **Konu Seçimi:** Herkesin bildiği klişe genel kültür yerine, günlük hayatta yaşanıp sistemi bilinmeyen konular veya yanlış bilinen gerçekler seçilir.
- **Toplam Süre:** **18–30 saniye**.

## 2. Çekim Çeşitliliği, İmza Sahne ve Atmosfer
- **4 Çekim Çeşitliliği (Shot Variety):** Her **2–4 saniyede** bir açı değişir:
  1. `Wide` (geniş plan + `RealPhotoBg`)
  2. `Close-Up` (`Arda` yakın yüz `shot="closeup"`)
  3. `Insert Shot` (`InsertCard` — telefon bildirimi, pil/fatura/deney belgesi)
  4. `Split-Screen` (`SplitScreen` — üst–alt karşılaştırma / ikilem)
- **Bölüm Başına 1 İmza Görsel Sahne:** Soyut bilgiyi tek bakışta anlatan bir görsel metafor (bölünmüş ekran, inen belge, ışık/atmosfer değişimi).
- **Derinlik & Ses Miksajı:** `PaperGrain` + `FloatingParticles` atmosfer katmanı ve konuşmayı bastırmayan `-18 dB` / `-22 dB` ducked `BgMusic` altlığı kullanılır.

## 3. Altyazı, Kapanış ve Yerel Kare Kontrolü (Frame QA)
- **Seçici `ViralCaptions`:** Kalın siyah konturlu beyaz/altın altyazıda yalnızca cümlenin can alıcı **1–2 kelimesi** altın renkle (`#FACC15`) vurgulanır.
- **Kapanış:** *"Beğenip takip et"* gibi bayat CTA konmaz. Son 2 sn'de vurucu tek cümle veya üst–alt `SplitScreen` ikilem sorusu bırakılır ve ses bitiminden **+0.5–0.7 sn** sonra kesilir.
- **Yerel Kare Kontrolü (Frame QA):** `git push` öncesi **4–5 kritik kare** (Frame 0, 2. sn, orta, final) PNG olarak çıkarılıp yazı taşması ve Instagram Reels güvenli alanları doğrulanır.

## 4. İş Bölümü ve Güvenlik
- **Antigravity:** Konu, 6 vuruşlu senaryo, TTS, sahne kodlama, Frame QA, GitHub'a push.
- **Kalıcı Çıktı Klasörü (`out/`):** Üretilen veya GitHub Actions'tan indirilen her `.mp4` videosu mutlaka `C:\Users\Davut Can\Desktop\Kanal-Studio\out\` klasörüne (`out/<KompozisyonAdi>.mp4`) kaydedilir.
- **GitHub Actions:** Yalnızca `1080×1920 Full HD` render alır (`publish_ig` manuel onay olmadıkça `false`; bulutta Gemini API çalıştırılmaz).
- **Gemini Masaüstü / Web:** İndirilen `.mp4` videosu son göz kontrolü için incelenir.
