import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CinematicBackdrop, CTA, Flash, FloatingCard, Grade, NeonTitle, Word, WordCaptions } from "../components";
import { Sfx } from "../sfx";
import { fontFamily } from "../theme";
import voice from "./voice.json";

export const SS_TEST_FRAMES = 900; // 30s @ 30fps
const AUDIO_OFFSET_MS = 1000;
const words: Word[] = voice.words.map((w) => ({
  text: w.text,
  startMs: w.start * 1000 + AUDIO_OFFSET_MS,
  endMs: w.end * 1000 + AUDIO_OFFSET_MS,
}));

const PhotoLayer: React.FC<{ src: string; duration: number }> = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, duration], [1.0, 1.14]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", scale: String(s), filter: "brightness(0.55)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.85) 100%)" }} />
    </AbsoluteFill>
  );
};

const WattBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 440,
        padding: 36,
        borderRadius: 28,
        background: "rgba(10, 14, 24, 0.86)",
        border: "2px solid rgba(255, 228, 92, 0.55)",
        textAlign: "center",
        scale: String(interpolate(p, [0, 1], [0.85, 1])),
        opacity: p,
      }}
    >
      <div style={{ fontFamily, fontSize: 110, fontWeight: 900, color: "#FFE45C", textShadow: "0 0 24px #FFC21A88" }}>20 WATT</div>
      <div style={{ fontFamily, fontSize: 36, fontWeight: 700, color: "#FFFFFF", marginTop: 8 }}>Tek bir ampul kadar enerji!</div>
    </div>
  );
};

export const KarsilastirmaShorts: React.FC = () => {
  return (
    <AbsoluteFill>
      <CinematicBackdrop />

      {/* 0 - 7s: Süper Bilgisayar */}
      <Sequence from={0} durationInFrames={210}>
        <PhotoLayer src="karsilastirma/supercomputer.jpg" duration={210} />
        <Sequence from={10} durationInFrames={120}>
          <NeonTitle lines={["SÜPER", "BİLGİSAYAR"]} durationInFrames={120} />
        </Sequence>
      </Sequence>

      <Sequence from={206} durationInFrames={10}>
        <Flash />
      </Sequence>

      {/* 7 - 15s: 20 Watt */}
      <Sequence from={210} durationInFrames={240}>
        <PhotoLayer src="karsilastirma/brain.jpg" duration={240} />
        <Sequence from={12} durationInFrames={200}>
          <WattBadge />
        </Sequence>
      </Sequence>

      <Sequence from={446} durationInFrames={10}>
        <Flash />
      </Sequence>

      {/* 15 - 24s: Katrilyon işlem */}
      <Sequence from={450} durationInFrames={270}>
        <Sequence from={8} durationInFrames={140}>
          <NeonTitle lines={["KATRİLYON", "İŞLEM / SN"]} durationInFrames={140} />
        </Sequence>
        <Sequence from={140} durationInFrames={125}>
          <FloatingCard title="İnsan Beyni" subtitle="Sessiz · Isınmadan · 20 Watt" durationInFrames={125} />
        </Sequence>
      </Sequence>

      <Sequence from={716} durationInFrames={10}>
        <Flash />
      </Sequence>

      {/* 24 - 30s: CTA */}
      <Sequence from={720} durationInFrames={180}>
        <PhotoLayer src="karsilastirma/brain.jpg" duration={180} />
        <CTA line1="Doğanın en verimli" line2="bilgisayarı kafanda!" />
      </Sequence>

      {/* Üst Etiket */}
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 60 }}>
        <div
          style={{
            fontFamily,
            fontSize: 28,
            fontWeight: 800,
            color: "#FFE45C",
            background: "rgba(10, 14, 24, 0.88)",
            border: "2px solid rgba(255, 228, 92, 0.55)",
            padding: "10px 26px",
            borderRadius: 999,
          }}
        >
          2 · SHORTS-SKILSS STİLİ
        </div>
      </div>

      {/* SFX */}
      <Sequence from={10}>
        <Sfx name="whoosh_impact" volume={0.45} />
      </Sequence>
      <Sequence from={206}>
        <Sfx name="whoosh_fast-transition" volume={0.45} />
      </Sequence>
      <Sequence from={222}>
        <Sfx name="pop_message" volume={0.5} />
      </Sequence>
      <Sequence from={446}>
        <Sfx name="impact_deep-whoosh" volume={0.45} />
      </Sequence>
      <Sequence from={590}>
        <Sfx name="magic_fairy-sparkle" volume={0.35} />
      </Sequence>
      <Sequence from={720}>
        <Sfx name="ding_correct-reward" volume={0.45} />
      </Sequence>

      <Sequence from={30}>
        <Audio src={staticFile("karsilastirma/voice.mp3")} volume={0.95} />
      </Sequence>

      <Grade />
      <WordCaptions words={words} y={1080} />
    </AbsoluteFill>
  );
};
