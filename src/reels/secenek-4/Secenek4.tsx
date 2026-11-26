import React from "react";
import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash, Grade, NeonTitle, Word, WordCaptions } from "../components";
import { Sfx } from "../sfx";
import { fontFamily } from "../theme";
import voice from "./voice.json";

const FPS = 30;
export const SECENEK4_FRAMES = Math.ceil((voice.duration + 1.0) * FPS);
const words: Word[] = voice.words.map((w) => ({ text: w.text, startMs: w.start * 1000, endMs: w.end * 1000 }));

const BrollClip: React.FC<{ src: string; duration: number; punch?: boolean }> = ({ src, duration, punch }) => {
  const frame = useCurrentFrame();
  const s = punch ? interpolate(frame, [0, duration], [1.04, 1.14]) : interpolate(frame, [0, duration], [1.0, 1.06]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        src={staticFile(src)}
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: "center center",
          scale: String(s),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 38%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Secenek4: React.FC = () => {
  const split = Math.round(5.8 * FPS);
  return (
    <AbsoluteFill style={{ background: "#090D16" }}>
      <Sequence from={0} durationInFrames={split}>
        <BrollClip src="secenek-4/clouds1.mp4" duration={split} />
      </Sequence>

      <Sequence from={split - 4} durationInFrames={10}>
        <Flash />
      </Sequence>

      <Sequence from={split} durationInFrames={SECENEK4_FRAMES - split}>
        <BrollClip src="secenek-4/clouds2.mp4" duration={SECENEK4_FRAMES - split} punch />
      </Sequence>

      <Sequence from={18} durationInFrames={85}>
        <NeonTitle lines={["500 TON", "BULUT"]} durationInFrames={85} />
      </Sequence>

      <Sequence from={split + 6} durationInFrames={85}>
        <NeonTitle lines={["TAM 100 FİL", "GÖKYÜZÜNDE"]} durationInFrames={85} />
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
            background: "rgba(24, 130, 88, 0.9)",
            padding: "12px 28px",
            borderRadius: 999,
          }}
        >
          SEÇENEK 4 · STOK VİDEO / B-ROLL
        </div>
      </div>

      <Sequence from={15}>
        <Sfx name="whoosh_impact" volume={0.45} />
      </Sequence>
      <Sequence from={split - 3}>
        <Sfx name="whoosh_fast-transition" volume={0.45} />
      </Sequence>
      <Sequence from={split + 8} durationInFrames={35}>
        <Sfx name="impact_drum-deep" volume={0.4} />
      </Sequence>

      <Audio src={staticFile("secenek-4/voice.mp3")} volume={0.95} />
      <Grade />
      <WordCaptions words={words} />
    </AbsoluteFill>
  );
};
