import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Flash, Grade, NeonTitle, Word, WordCaptions } from "../components";
import { Sfx } from "../sfx";
import { C, fontFamily } from "../theme";
import voice from "./voice.json";

const FPS = 30;
export const SECENEK3_FRAMES = Math.ceil((voice.duration + 1.0) * FPS);
const words: Word[] = voice.words.map((w) => ({ text: w.text, startMs: w.start * 1000, endMs: w.end * 1000 }));

const CrispTitle: React.FC<{ lines: string[]; durationInFrames: number }> = ({ lines, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 280, mass: 0.6 } });
  const blurIn = interpolate(frame, [0, 5], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: 320,
        left: 70,
        right: 70,
        textAlign: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: 112,
        lineHeight: 0.98,
        color: C.neonYellow,
        textShadow: "0 0 28px #FFC21ACC, 0 8px 26px rgba(0,0,0,0.85)",
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

const AiScene: React.FC<{ src: string; duration: number; zoomFrom: number; zoomTo: number }> = ({ src, duration, zoomFrom, zoomTo }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, duration], [zoomFrom, zoomTo]);
  const y = interpolate(frame, [0, duration], [0, -28]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
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
          background: "linear-gradient(180deg, rgba(0,10,24,0.55) 0%, transparent 35%, rgba(0,8,20,0.82) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Secenek3: React.FC = () => {
  const split = Math.round(6.6 * FPS);
  return (
    <AbsoluteFill style={{ background: "#040A14" }}>
      <Sequence from={0} durationInFrames={split}>
        <AiScene src="secenek-3/scene2.jpg" duration={split} zoomFrom={1.0} zoomTo={1.18} />
      </Sequence>

      <Sequence from={split - 5} durationInFrames={10}>
        <Flash />
      </Sequence>

      <Sequence from={split} durationInFrames={SECENEK3_FRAMES - split}>
        <AiScene src="secenek-3/scene1.jpg" duration={SECENEK3_FRAMES - split} zoomFrom={1.0} zoomTo={1.16} />
      </Sequence>

      <Sequence from={8} durationInFrames={82}>
        <CrispTitle lines={["EVEREST", "SU ALTINDA"]} durationInFrames={82} />
      </Sequence>

      <Sequence from={split + 8} durationInFrames={95}>
        <NeonTitle lines={["MARİANA", "ÇUKURU"]} durationInFrames={95} />
      </Sequence>

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
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: "#7CE8FF",
            background: "rgba(6, 18, 36, 0.86)",
            border: "2px solid rgba(124, 232, 255, 0.6)",
            padding: "12px 28px",
            borderRadius: 999,
          }}
        >
          SEÇENEK 3 · YAPAY ZEKA GÖRSELLİ
        </div>
      </div>

      <Sequence from={8}>
        <Sfx name="whoosh_impact" volume={0.45} />
      </Sequence>
      <Sequence from={split - 4}>
        <Sfx name="impact_deep-whoosh" volume={0.45} />
      </Sequence>
      <Sequence from={split + 10}>
        <Sfx name="magic_fairy-sparkle" volume={0.35} />
      </Sequence>

      <Audio src={staticFile("secenek-3/voice.mp3")} volume={0.95} />
      <Grade />
      <WordCaptions words={words} />
    </AbsoluteFill>
  );
};
