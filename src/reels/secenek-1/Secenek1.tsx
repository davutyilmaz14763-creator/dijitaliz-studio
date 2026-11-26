import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CinematicBackdrop, CTA, Flash, FloatingCard, Grade, NeonTitle, Spinner, Word, WordCaptions } from "../components";
import { Sfx } from "../sfx";
import { fontFamily } from "../theme";
import voice from "./voice.json";

const FPS = 30;
export const SECENEK1_FRAMES = Math.ceil((voice.duration + 1.0) * FPS);
const words: Word[] = voice.words.map((w) => ({ text: w.text, startMs: w.start * 1000, endMs: w.end * 1000 }));

const OptionBadge: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      position: "absolute",
      top: 90,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      zIndex: 50,
    }}
  >
    <div
      style={{
        fontFamily,
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: 2,
        color: "#FFE45C",
        background: "rgba(10, 14, 24, 0.82)",
        border: "2px solid rgba(255, 228, 92, 0.6)",
        padding: "12px 28px",
        borderRadius: 999,
        boxShadow: "0 0 24px rgba(255, 194, 26, 0.28)",
      }}
    >
      {label}
    </div>
  </div>
);

const CodePulseCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const bars = [0.85, 0.55, 0.95, 0.7];
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 430,
        padding: 36,
        borderRadius: 28,
        background: "rgba(12, 22, 34, 0.88)",
        border: "2px solid rgba(90, 220, 255, 0.45)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        scale: String(interpolate(p, [0, 1], [0.85, 1])),
        opacity: p,
      }}
    >
      <div style={{ fontFamily, fontSize: 28, color: "#7CE8FF", fontWeight: 700, marginBottom: 22 }}>
        ⚡ CANLI VERİ İŞLEME · 12.4M SATIR/SN
      </div>
      {bars.map((v, i) => {
        const w = interpolate(frame, [i * 4, i * 4 + 20], [0, v * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ height: 22, borderRadius: 12, background: "rgba(255,255,255,0.08)", marginBottom: 16, overflow: "hidden" }}>
            <div style={{ width: `${w}%`, height: "100%", borderRadius: 12, background: "linear-gradient(90deg, #00D2FF, #FFE45C)" }} />
          </div>
        );
      })}
    </div>
  );
};

export const Secenek1: React.FC = () => {
  return (
    <AbsoluteFill>
      <CinematicBackdrop />
      <OptionBadge label="SEÇENEK 1 · SİNEMATİK MOTION" />

      <Sequence from={6} durationInFrames={95}>
        <NeonTitle lines={["HER SANİYE", "CEBİNDE"]} durationInFrames={95} />
      </Sequence>

      <Sequence from={80} durationInFrames={26}>
        <Spinner durationInFrames={26} y={320} />
      </Sequence>

      <Sequence from={98} durationInFrames={10}>
        <Flash />
      </Sequence>

      <Sequence from={102} durationInFrames={142}>
        <CodePulseCard />
      </Sequence>

      <Sequence from={240} durationInFrames={10}>
        <Flash />
      </Sequence>

      <Sequence from={248} durationInFrames={SECENEK1_FRAMES - 248}>
        <FloatingCard title="Modern Arayüz Motoru" subtitle="Remotion · 60fps Motion Graphics" durationInFrames={SECENEK1_FRAMES - 248} />
        <CTA line1="Sıfır çizgi karakter," line2="tamamen motion!" />
      </Sequence>

      <Sequence from={4}>
        <Sfx name="whoosh_impact" volume={0.45} />
      </Sequence>
      <Sequence from={97}>
        <Sfx name="whoosh_small-sweep" volume={0.4} />
      </Sequence>
      <Sequence from={104}>
        <Sfx name="pop_message" volume={0.45} />
      </Sequence>
      <Sequence from={248}>
        <Sfx name="ding_correct-reward" volume={0.4} />
      </Sequence>

      <Audio src={staticFile("secenek-1/voice.mp3")} volume={0.95} />
      <Grade />
      <WordCaptions words={words} y={1080} />
    </AbsoluteFill>
  );
};
