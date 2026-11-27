import React from "react";
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
import { BgMusic, sans, slab, ViralCaptions, VWord } from "../cizgi/kit";
import voice from "./voice.json";

const FPS = 30;
const CLIP_FRAMES = Math.round(7.93 * FPS); // 238 kare (~7.93 sn)
const CLOSING_FRAMES = 3 * FPS; // 90 kare (3 sn)
const CLIPS_COUNT = 11;

export const DIJITALIZ_PLANLI_ESKITME_FRAMES = CLIPS_COUNT * CLIP_FRAMES + CLOSING_FRAMES;

const words = voice.words as VWord[];

const getObjectPosition = (clipIndex: number): string => {
  // clip1 (Kaan) ve clip11 (Arda) soldaki karakteri kadrajda tutar; diğerleri merkez
  if (clipIndex === 1 || clipIndex === 11) return "28% center";
  return "50% center";
};

/** 3 Saniyelik Kapanış Kartı */
const ClosingCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qPop = spring({ frame, fps, config: { damping: 16, stiffness: 200 } });
  const linePop = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 18, stiffness: 180 } });
  const subPop = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 18, stiffness: 190 } });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 38%, #1E293B 0%, #0B132B 58%, #020617 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 72,
        paddingRight: 72,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: slab,
          fontSize: 74,
          fontWeight: 900,
          lineHeight: 1.16,
          color: "#F8FAFC",
          letterSpacing: 1,
          textShadow: "0 12px 32px rgba(0,0,0,0.55)",
          transform: `translateY(${interpolate(qPop, [0, 1], [24, 0])}px)`,
          opacity: qPop,
        }}
      >
        GARANTİ BİTİNCE
        <br />
        <span style={{ color: "#FACC15" }}>BOZULAN NE OLDU?</span>
      </div>

      <div
        style={{
          width: `${interpolate(linePop, [0, 1], [0, 480])}px`,
          height: 3,
          background: "linear-gradient(90deg, rgba(250,204,21,0) 0%, #FACC15 50%, rgba(250,204,21,0) 100%)",
          marginTop: 52,
          marginBottom: 44,
          opacity: linePop,
        }}
      />

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "2px solid rgba(250,204,21,0.42)",
          borderRadius: 999,
          padding: "20px 42px",
          fontFamily: sans,
          fontSize: 34,
          fontWeight: 800,
          color: "#FEF08A",
          letterSpacing: 0.6,
          boxShadow: "0 16px 36px rgba(0,0,0,0.4)",
          opacity: subPop,
          transform: `translateY(${interpolate(subPop, [0, 1], [14, 0])}px)`,
        }}
      >
        Yorumda yaz 👇 · Takip et, kaçırma 🔔
      </div>
    </AbsoluteFill>
  );
};

export const DijitalizPlanliEskitme: React.FC = () => {
  const clipsEnd = CLIPS_COUNT * CLIP_FRAMES;

  return (
    <AbsoluteFill style={{ background: "#020617" }}>
      {Array.from({ length: CLIPS_COUNT }, (_, idx) => {
        const clipNum = idx + 1;
        return (
          <Sequence
            key={clipNum}
            name={`Clip${clipNum}`}
            from={idx * CLIP_FRAMES}
            durationInFrames={CLIP_FRAMES}
          >
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(`planli-eskitme/clip${clipNum}.mp4`)}
                volume={1}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: getObjectPosition(clipNum),
                }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 3 Saniyelik Kapanış Kartı */}
      <Sequence name="Kapanis_Karti" from={clipsEnd} durationInFrames={CLOSING_FRAMES}>
        <ClosingCard />
      </Sequence>

      {/* Altyazı okunabilirliği için alt koyu gradyan */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "linear-gradient(to top, rgba(2,6,23,0.84) 0%, rgba(2,6,23,0.38) 22%, rgba(2,6,23,0) 44%)",
          zIndex: 19,
        }}
      />

      {/* Çok hafif gizem/gerilim fon müziği altlığı (klip seslerini bastırmaz) */}
      <BgMusic words={words} baseVol={0.07} duckVol={0.06} />

      {/* Altın vurgulu 2-3 kelimelik altyazı */}
      <ViralCaptions
        words={words}
        y={1580}
        highlight={[
          "garanti",
          "bozuldu",
          "kırk",
          "1924'te",
          "phoebus",
          "bin",
          "ceza",
          "1901'de",
          "125",
          "üç",
          "planlı",
          "eskitme",
          "yavaşlaması",
          "rekorun",
          "yorumda",
        ]}
      />
    </AbsoluteFill>
  );
};
