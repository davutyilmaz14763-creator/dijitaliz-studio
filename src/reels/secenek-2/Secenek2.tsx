import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Flash, Grade, Word, WordCaptions } from "../components";
import { Sfx } from "../sfx";
import { fontFamily } from "../theme";
import voice from "./voice.json";

const FPS = 30;
export const SECENEK2_FRAMES = Math.ceil((voice.duration + 1.0) * FPS);
const words: Word[] = voice.words.map((w) => ({ text: w.text, startMs: w.start * 1000, endMs: w.end * 1000 }));

const PhotoKenBurns: React.FC<{ src: string; year: string; title: string; stat: string; duration: number }> = ({
  src,
  year,
  title,
  stat,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, duration], [1.0, 1.18]);
  const panY = interpolate(frame, [0, duration], [0, -22]);
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ background: "#0B0E14", overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: "center center",
          scale: String(zoom),
          translate: `0px ${panY}px`,
          filter: "brightness(0.68) contrast(1.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.86) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 70,
          right: 70,
          padding: "26px 32px",
          borderRadius: 24,
          background: "rgba(14, 18, 28, 0.85)",
          borderLeft: "8px solid #FFE45C",
          scale: String(interpolate(p, [0, 1], [0.9, 1])),
          opacity: p,
        }}
      >
        <div style={{ fontFamily, fontSize: 28, fontWeight: 800, color: "#FFE45C", letterSpacing: 2 }}>{year}</div>
        <div style={{ fontFamily, fontSize: 48, fontWeight: 900, color: "#FFFFFF", marginTop: 6 }}>{title}</div>
        <div style={{ fontFamily, fontSize: 34, fontWeight: 700, color: "#9CE8FF", marginTop: 8 }}>{stat}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Secenek2: React.FC = () => {
  const split = Math.round(6.8 * FPS);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={split}>
        <PhotoKenBurns src="secenek-2/img/eniac.jpg" year="1945 · ENIAC" title="İlk Elektronik Bilgisayar" stat="27 Ton · 167 m² Oda" duration={split} />
      </Sequence>

      <Sequence from={split - 5} durationInFrames={10}>
        <Flash />
      </Sequence>

      <Sequence from={split} durationInFrames={SECENEK2_FRAMES - split}>
        <PhotoKenBurns
          src="secenek-2/img/watch.jpg"
          year="GÜNÜMÜZ · AKILLI SAAT"
          title="Bileğindeki Süper Bilgisayar"
          stat="Milyonlarca Kat Daha Hızlı"
          duration={SECENEK2_FRAMES - split}
        />
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
            color: "#FFFFFF",
            background: "rgba(210, 45, 45, 0.9)",
            padding: "12px 28px",
            borderRadius: 999,
          }}
        >
          SEÇENEK 2 · GERÇEK FOTOĞRAF / BELGESEL
        </div>
      </div>

      <Sequence from={5}>
        <Sfx name="impact_deep-whoosh" volume={0.45} />
      </Sequence>
      <Sequence from={split - 4}>
        <Sfx name="whoosh_fast-transition" volume={0.45} />
      </Sequence>
      <Sequence from={split + 8}>
        <Sfx name="ding_reveal" volume={0.4} />
      </Sequence>

      <Audio src={staticFile("secenek-2/voice.mp3")} volume={0.95} />
      <Grade />
      <WordCaptions words={words} />
    </AbsoluteFill>
  );
};
