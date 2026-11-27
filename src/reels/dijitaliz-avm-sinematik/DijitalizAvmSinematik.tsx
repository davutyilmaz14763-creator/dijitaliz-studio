import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sfx } from "../sfx";
import { BgMusic, sans, slab, usePopAt, ViralCaptions, VWord } from "../cizgi/kit";
import voice from "./voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;

export const DIJITALIZ_AVM_SINEMATIK_FRAMES = Math.ceil((voice.duration + 0.5) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.08));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_AVM_SINEMATIK_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

/** Üst köşede temiz rozet (ekranı kapatmayan minimal stil) */
const TopBadge: React.FC<{
  text: string;
  at?: number;
  until?: number;
  align?: "left" | "center" | "right";
  bg?: string;
  color?: string;
  border?: string;
}> = ({
  text,
  at = 0,
  until,
  align = "center",
  bg = "rgba(11, 19, 43, 0.82)",
  color = "#F8FAFC",
  border = "rgba(255,255,255,0.22)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - Math.round(at * fps);
  if (rel < 0) return null;
  if (until !== undefined && frame > Math.round(until * fps)) return null;

  const pop = spring({ frame: rel, fps, config: { damping: 16, stiffness: 220 } });
  const fadeOut = until !== undefined ? interpolate(frame, [Math.round((until - 0.25) * fps), Math.round(until * fps)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  const posStyle: React.CSSProperties =
    align === "left"
      ? { left: 54 }
      : align === "right"
        ? { right: 54 }
        : { left: "50%", transform: `translate(-50%, ${interpolate(pop, [0, 1], [-18, 0])}px) scale(${interpolate(pop, [0, 1], [0.9, 1])})` };

  return (
    <div
      style={{
        position: "absolute",
        top: 118,
        ...posStyle,
        ...(align !== "center"
          ? { transform: `translateY(${interpolate(pop, [0, 1], [-18, 0])}px) scale(${interpolate(pop, [0, 1], [0.9, 1])})` }
          : {}),
        background: bg,
        backdropFilter: "blur(10px)",
        border: `2px solid ${border}`,
        borderRadius: 999,
        padding: "14px 28px",
        fontFamily: sans,
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: 1.2,
        color,
        boxShadow: "0 12px 30px rgba(0,0,0,0.42)",
        opacity: Math.min(pop, fadeOut),
        whiteSpace: "nowrap",
        zIndex: 25,
      }}
    >
      {text}
    </div>
  );
};

/** 19:40 şok kartı (kırmızı/altın vurgu) */
const ShockCard: React.FC<{ at: number }> = ({ at }) => {
  const p = usePopAt(at, 14, 240);
  if (p <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 118,
        left: "50%",
        transform: `translate(-50%, ${interpolate(p, [0, 1], [-24, 0])}px) scale(${interpolate(p, [0, 1], [0.82, 1])})`,
        background: "linear-gradient(135deg, rgba(153, 27, 27, 0.94) 0%, rgba(127, 29, 29, 0.96) 100%)",
        border: "3px solid #FACC15",
        borderRadius: 20,
        padding: "16px 34px",
        fontFamily: slab,
        fontSize: 36,
        fontWeight: 900,
        letterSpacing: 1,
        color: "#FEF08A",
        boxShadow: "0 16px 40px rgba(0,0,0,0.55), 0 0 28px rgba(250, 204, 21, 0.25)",
        opacity: p,
        whiteSpace: "nowrap",
        zIndex: 26,
      }}
    >
      13:00 → 19:40 · 6 SAAT UÇTU!
    </div>
  );
};

/** Klipler: tam ekran dikey (9:16), orijinal ses tamamen kapalı */
const ClipLayer: React.FC<{ src: string; sceneDurSec: number; shakeAt?: number }> = ({ src, sceneDurSec, shakeAt }) => {
  const frame = useCurrentFrame();
  let tx = 0;
  let ty = 0;
  let scale = 1.01;

  if (shakeAt !== undefined) {
    const sf = Math.round(shakeAt * FPS);
    const d = frame - sf;
    if (d >= 0 && d < 4) {
      tx = Math.sin(d * 2.7 + 0.5) * 16;
      ty = Math.cos(d * 3.4) * 11;
      scale = 1.045;
    }
  }

  const playbackRate = sceneDurSec > 9.8 ? Number((9.8 / sceneDurSec).toFixed(4)) : 1;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        overflow: "hidden",
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        muted
        volume={0}
        playbackRate={playbackRate}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};

/** 3 saniyelik Sinematik Kapanış Kartı */
const ClosingCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qPop = spring({ frame, fps, config: { damping: 16, stiffness: 200 } });
  const linePop = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 18, stiffness: 180 } });
  const nextPop = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 16, stiffness: 200 } });
  const subPop = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 18, stiffness: 190 } });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 35%, #1E293B 0%, #0B132B 58%, #020617 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 260,
        paddingLeft: 72,
        paddingRight: 72,
        textAlign: "center",
      }}
    >
      {/* Üstte büyük soru */}
      <div
        style={{
          fontFamily: slab,
          fontSize: 78,
          fontWeight: 900,
          lineHeight: 1.12,
          color: "#F8FAFC",
          letterSpacing: 1,
          textShadow: "0 12px 32px rgba(0,0,0,0.55)",
          transform: `translateY(${interpolate(qPop, [0, 1], [28, 0])}px)`,
          opacity: qPop,
        }}
      >
        AVM'DE REKORUN
        <br />
        <span style={{ color: "#FACC15" }}>KAÇ SAAT?</span>
      </div>

      {/* İnce ayırıcı çizgi */}
      <div
        style={{
          width: `${interpolate(linePop, [0, 1], [0, 520])}px`,
          height: 3,
          background: "linear-gradient(90deg, rgba(250,204,21,0) 0%, #FACC15 50%, rgba(250,204,21,0) 100%)",
          marginTop: 58,
          marginBottom: 54,
          opacity: linePop,
        }}
      />

      {/* Yarının konusu */}
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "2px solid rgba(250,204,21,0.45)",
          borderRadius: 24,
          padding: "24px 40px",
          fontFamily: sans,
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: 1.2,
          color: "#FEF08A",
          boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
          transform: `translateY(${interpolate(nextPop, [0, 1], [20, 0])}px) scale(${interpolate(nextPop, [0, 1], [0.94, 1])})`,
          opacity: nextPop,
        }}
      >
        YARIN · ☕ KAFE MENÜ TUZAĞI
      </div>

      {/* Küçük takip notu */}
      <div
        style={{
          marginTop: 34,
          fontFamily: sans,
          fontSize: 30,
          fontWeight: 700,
          color: "rgba(248, 250, 252, 0.78)",
          letterSpacing: 0.8,
          opacity: subPop,
          transform: `translateY(${interpolate(subPop, [0, 1], [12, 0])}px)`,
        }}
      >
        Takip et, kaçırma 🔔
      </div>
    </AbsoluteFill>
  );
};

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.25, "ding_correct-answer", 0.36, 1.6], // AVM giriş ding
  [1, 0, "whoosh_short-sweep", 0.38], // Sahne 2 geçiş
  [2, 0, "whoosh_cinematic-fast", 0.4], // Sahne 3 geçiş
  [2, wAt(2, "kırk"), "impact_drum-deep", 0.46, 1.8], // 19:40 şok boom
  [3, 0, "pop_hard", 0.42], // Kapanış kartı
  [3, wAt(3, "yarın"), "ding_reveal", 0.36, 1.8], // Yarının konusu vurgu
];

export const DijitalizAvmSinematik: React.FC = () => {
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const s3 = Math.round(sceneStart(3) * FPS);
  const end = Math.round(sceneEnd(3) * FPS);

  const shockAt = wAt(2, "kırk");
  const list = hits();

  return (
    <AbsoluteFill style={{ background: "#020617" }}>
      {/* Sahne 0: Gündüz AVM girişi (clip1.mp4) */}
      <Sequence name="Clip1_Giris" from={s0} durationInFrames={s1 - s0}>
        <ClipLayer src="avm-sinematik/clip1.mp4" sceneDurSec={(s1 - s0) / FPS} />
        <TopBadge text="⏱️ ZAMAN TUZAĞI" at={0.1} until={2.6} />
      </Sequence>

      {/* Sahne 1: Yürüyen merdiven / labirent (clip2.mp4) */}
      <Sequence name="Clip2_Labirent" from={s1} durationInFrames={s2 - s1}>
        <ClipLayer src="avm-sinematik/clip2.mp4" sceneDurSec={(s2 - s1) / FPS} />
        <TopBadge text="GRUEN ETKİSİ" at={0.2} bg="rgba(15, 23, 42, 0.8)" color="#FACC15" border="rgba(250,204,21,0.5)" />
      </Sequence>

      {/* Sahne 2: Gece çıkışı ve 19:40 şoku (clip3.mp4) */}
      <Sequence name="Clip3_GeceSok" from={s2} durationInFrames={s3 - s2}>
        <ClipLayer src="avm-sinematik/clip3.mp4" sceneDurSec={(s3 - s2) / FPS} shakeAt={shockAt} />
        <ShockCard at={shockAt} />
      </Sequence>

      {/* Sahne 3: 3 Saniyelik Sinematik Kapanış Kartı */}
      <Sequence name="Kapanis_Karti" from={s3} durationInFrames={end - s3}>
        <ClosingCard />
      </Sequence>

      {/* Altta altyazı okunabilirliği için hafif koyu gradyan */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "linear-gradient(to top, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.36) 22%, rgba(2,6,23,0) 44%)",
          zIndex: 19,
        }}
      />

      {/* Ses: SFX + Fon Müziği + Türkçe Seslendirme */}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      <BgMusic words={words} baseVol={0.16} duckVol={0.14} />
      <Audio src={staticFile("dijitaliz-avm-sinematik/voice.mp3")} volume={0.96} />

      {/* Altın vurgulu 2-3 kelimelik altyazı */}
      <ViralCaptions
        words={words}
        y={1580}
        highlight={["zaman", "tişört", "gruen", "labirent", "yedi", "kırk", "altı", "dört", "rekorun", "tuzağını", "kaçırma"]}
      />
    </AbsoluteFill>
  );
};
