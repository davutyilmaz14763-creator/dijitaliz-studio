import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Flash, Grade, Word, WordCaptions } from "../components";
import { Sfx } from "../sfx";
import { C, fontFamily } from "../theme";
import voice from "./voice.json";

const FPS = 30;
export const FULLHD30_FRAMES = 900; // Tam 30.0 saniye @ 30fps
const words: Word[] = voice.words.map((w) => ({ text: w.text, startMs: w.start * 1000, endMs: w.end * 1000 }));

const sceneStartFrame = (sceneIdx: number) => {
  if (sceneIdx === 0) return 0;
  const w = voice.words.find((x) => x.scene === sceneIdx);
  return w ? Math.max(0, Math.round((w.start - 0.12) * FPS)) : 0;
};

const CrispTitle: React.FC<{ lines: string[]; durationInFrames: number; color?: string; y?: number }> = ({
  lines,
  durationInFrames,
  color = C.neonYellow,
  y = 300,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 280, mass: 0.6 } });
  const blurIn = interpolate(frame, [0, 5], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: 108,
        lineHeight: 1.0,
        color,
        textShadow: "0 0 28px rgba(255, 194, 26, 0.75), 0 8px 26px rgba(0,0,0,0.9)",
        opacity: Math.min(1, enter * 2) * fadeOut,
        scale: String(interpolate(enter, [0, 1], [1.14, 1])),
        filter: blurIn > 0.2 ? `blur(${blurIn}px)` : undefined,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};

const InfoPill: React.FC<{ tag: string; title: string; subtitle: string; y?: number }> = ({ tag, title, subtitle, y = 260 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 80,
        right: 80,
        padding: "28px 34px",
        borderRadius: 26,
        background: "rgba(10, 14, 24, 0.84)",
        borderLeft: "8px solid #FFE45C",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
        scale: String(interpolate(p, [0, 1], [0.9, 1])),
        opacity: p,
      }}
    >
      <div style={{ fontFamily, fontSize: 28, fontWeight: 800, color: "#FFE45C", letterSpacing: 2 }}>{tag}</div>
      <div style={{ fontFamily, fontSize: 50, fontWeight: 900, color: "#FFFFFF", marginTop: 8 }}>{title}</div>
      <div style={{ fontFamily, fontSize: 34, fontWeight: 600, color: "#B8E6FF", marginTop: 8 }}>{subtitle}</div>
    </div>
  );
};

const KenBurnsImg: React.FC<{ src: string; duration: number; zoomFrom?: number; zoomTo?: number; panY?: number }> = ({
  src,
  duration,
  zoomFrom = 1.0,
  zoomTo = 1.18,
  panY = -24,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, duration], [zoomFrom, zoomTo]);
  const y = interpolate(frame, [0, duration], [0, panY]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#05070E" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: "center center",
          scale: String(s),
          translate: `0px ${y}px`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.82) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Fullhd30: React.FC = () => {
  const s0 = sceneStartFrame(0);
  const s1 = sceneStartFrame(1);
  const s2 = sceneStartFrame(2);
  const s3 = sceneStartFrame(3);

  return (
    <AbsoluteFill style={{ background: "#05070E" }}>
      {/* Sahne 1: Güneş'in yüzeyi (AI) */}
      <Sequence from={s0} durationInFrames={s1 - s0}>
        <KenBurnsImg src="fullhd-30/sun.jpg" duration={s1 - s0} zoomFrom={1.0} zoomTo={1.16} />
        <Sequence from={8} durationInFrames={95}>
          <CrispTitle lines={["8 DAKİKA", "MU, YOKSA?"]} durationInFrames={95} />
        </Sequence>
      </Sequence>

      <Sequence from={s1 - 4} durationInFrames={10}>
        <Flash />
      </Sequence>

      {/* Sahne 2: Güneş çekirdeği / SDO plazma (NASA) */}
      <Sequence from={s1} durationInFrames={s2 - s1}>
        <KenBurnsImg src="fullhd-30/corona.jpg" duration={s2 - s1} zoomFrom={1.06} zoomTo={1.24} panY={-18} />
        <Sequence from={10} durationInFrames={s2 - s1 - 15}>
          <InfoPill tag="GÜNEŞ ÇEKİRDEĞİ" title="Yoğun Plazma" subtitle="Fotonlar milyonlarca kez çarpışır" />
        </Sequence>
      </Sequence>

      <Sequence from={s2 - 4} durationInFrames={10}>
        <Flash />
      </Sequence>

      {/* Sahne 3: 100.000 yıl -> 8 dakika */}
      <Sequence from={s2} durationInFrames={s3 - s2}>
        <KenBurnsImg src="fullhd-30/sun.jpg" duration={s3 - s2} zoomFrom={1.14} zoomTo={1.0} panY={20} />
        <Sequence from={12} durationInFrames={110}>
          <CrispTitle lines={["100.000 YIL", "YOLCULUK"]} durationInFrames={110} color="#7CE8FF" />
        </Sequence>
      </Sequence>

      <Sequence from={s3 - 4} durationInFrames={10}>
        <Flash />
      </Sequence>

      {/* Sahne 4: Dünya (Apollo 17 NASA) */}
      <Sequence from={s3} durationInFrames={FULLHD30_FRAMES - s3}>
        <KenBurnsImg src="fullhd-30/earth.jpg" duration={FULLHD30_FRAMES - s3} zoomFrom={1.0} zoomTo={1.15} panY={-16} />
        <Sequence from={10} durationInFrames={FULLHD30_FRAMES - s3 - 10}>
          <InfoPill tag="SONUÇ" title="100.000 Yıllık Işık" subtitle="İnsanlık tarihinden bile daha eski" />
        </Sequence>
      </Sequence>

      {/* Üst Rozet */}
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50 }}>
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: "#FFE45C",
            background: "rgba(8, 12, 22, 0.85)",
            border: "2px solid rgba(255, 228, 92, 0.55)",
            padding: "12px 28px",
            borderRadius: 999,
          }}
        >
          FULL HD 1080×1920 · 30 SN TEST
        </div>
      </div>

      {/* SFX */}
      <Sequence from={5}>
        <Sfx name="whoosh_impact" volume={0.45} />
      </Sequence>
      <Sequence from={s1 - 4}>
        <Sfx name="whoosh_fast-transition" volume={0.4} />
      </Sequence>
      <Sequence from={s1 + 10}>
        <Sfx name="pop_message" volume={0.45} />
      </Sequence>
      <Sequence from={s2 - 4}>
        <Sfx name="impact_deep-whoosh" volume={0.45} />
      </Sequence>
      <Sequence from={s2 + 12}>
        <Sfx name="magic_fairy-sparkle" volume={0.35} />
      </Sequence>
      <Sequence from={s3 - 4}>
        <Sfx name="whoosh_short-sweep" volume={0.4} />
      </Sequence>
      <Sequence from={s3 + 12}>
        <Sfx name="ding_correct-reward" volume={0.4} />
      </Sequence>

      <Audio src={staticFile("fullhd-30/voice.mp3")} volume={0.95} />
      <Grade />
      <WordCaptions words={words} y={1140} />
    </AbsoluteFill>
  );
};
