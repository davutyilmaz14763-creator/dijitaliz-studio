import React from "react";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../sfx";
import {
  BgMusic,
  ChapterHud,
  CizgiStatBar,
  FloatingParticles,
  PaperGrain,
  sans,
  slab,
  usePopAt,
  ViralCaptions,
  ViralHeadline,
  VWord,
} from "../cizgi/kit";
import { Arda3D, CameraRig } from "../three/world";
import { Cart3D, MarketWorld } from "../three/MarketWorld";
import voice from "../dijitaliz-market/voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const DIJITALIZ_MARKET_3D_FRAMES = Math.ceil((voice.duration + 0.5) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.1));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_MARKET_3D_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

/** Sağdaki Referans Tarzı Tırtıklı 2D Market Fişi */
const MarketReceipt: React.FC<{ at?: number }> = ({ at = 0.8 }) => {
  const p = usePopAt(at, 15, 200);
  const rows = [
    ["SÜT", "45 TL"],
    ["EKMEK", "15 TL"],
    ["+ 6 PLANSIZ ÜRÜN", "780 TL"],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 215,
        width: 680,
        transform: `translate(-50%, ${interpolate(p, [0, 1], [80, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        opacity: Math.min(1, p * 2.5),
        background: "#FAF8F5",
        border: "5px solid #161616",
        boxShadow: "0 22px 45px rgba(0,0,0,0.45)",
        padding: "34px 38px 26px",
        zIndex: 22,
        clipPath:
          "polygon(0 0, 100% 0, 100% 96%, 96% 100%, 92% 96%, 88% 100%, 84% 96%, 80% 100%, 76% 96%, 72% 100%, 68% 96%, 64% 100%, 60% 96%, 56% 100%, 52% 96%, 48% 100%, 44% 96%, 40% 100%, 36% 96%, 32% 100%, 28% 96%, 24% 100%, 20% 96%, 16% 100%, 12% 96%, 8% 100%, 4% 96%, 0 100%)",
      }}
    >
      <div style={{ textAlign: "center", fontFamily: slab, fontSize: 38, fontWeight: 900, color: "#161616", letterSpacing: 1 }}>
        DİJİTALİZ MARKET
      </div>
      <div style={{ textAlign: "center", fontFamily: sans, fontSize: 22, fontWeight: 700, color: "#64748B", marginBottom: 18 }}>
        7/24 · SÜT & EKMEK ROTASI
      </div>
      <div style={{ borderTop: "3px dashed #94A3B8", paddingTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 30, fontWeight: 800, color: i === 2 ? "#DC2626" : "#1E293B" }}>
            <span>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 20,
          borderTop: "4px solid #161616",
          paddingTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: slab,
          fontSize: 42,
          fontWeight: 900,
          color: "#DC2626",
        }}
      >
        <span>TOPLAM</span>
        <span style={{ background: "#FEF08A", padding: "4px 14px", borderRadius: 10, border: "3px solid #161616" }}>840 TL</span>
      </div>
      {/* Barkod çizgileri */}
      <div style={{ marginTop: 20, height: 42, display: "flex", justifyContent: "center", gap: 4 }}>
        {[6, 3, 8, 2, 5, 9, 3, 6, 2, 7, 4, 8, 3, 5, 2, 9, 4, 6, 3, 7, 2, 5, 8, 3].map((w, bi) => (
          <div key={bi} style={{ width: w, height: "100%", background: "#161616" }} />
        ))}
      </div>
    </div>
  );
};

/** 3D Sahne + 4 Farklı Kamera Açısı + Asla Kesilmeyen Arda3D */
const MarketScene3D: React.FC<{
  s0: number;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
}> = ({ s0, s1, s2, s3, s4 }) => {
  const frame = useCurrentFrame();

  let camPos: [number, number, number] = [0, 1.85, 12.2];
  let camTarget: [number, number, number] = [0, 1.05, 5.2];
  let ardaPos: [number, number, number] = [-0.65, 0, 5.4];
  let ardaFace: "normal" | "shock" | "happy" | "wink" = "normal";
  let ardaWalking = false;
  let cartPos: [number, number, number] = [0.68, 0, 5.2];
  let cartScale = 1.15;
  let dropProgress = 0;

  if (frame < s1) {
    // S0 (0-4 sn): Market girişinden içeri doğru süzülüş; Arda + araba tam kadraj
    const p = interpolate(frame, [s0, s1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [0.1, 0]), interpolate(p, [0, 1], [1.9, 1.65]), interpolate(p, [0, 1], [9.5, 8.2])];
    camTarget = [0, 1.0, 5.2];
    ardaPos = [-0.68, 0, 5.4];
    cartPos = [0.68, 0, 5.2];
    ardaFace = frame / FPS >= wAt(0, "tesadüf") ? "shock" : "normal";
  } else if (frame < s2) {
    // S1 (4-11 sn): 45° yan koridor açısı; 1937 küçük sepet 2x dev arabaya büyür
    const p = interpolate(frame, [s1, s2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [2.15, 1.85]), 1.9, interpolate(p, [0, 1], [5.8, 4.8])];
    camTarget = [-0.05, 0.9, 2.3];
    ardaPos = [-0.72, 0, 2.2];
    ardaWalking = p < 0.45;
    cartPos = [0.55, 0, 2.4];
    const growT = sceneStart(1) + wAt(1, "büyütünce");
    cartScale = interpolate(frame / FPS, [sceneStart(1), growT, growT + 0.85], [0.55, 0.55, 1.25], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    ardaFace = frame / FPS >= growT ? "shock" : "normal";
  } else if (frame < s3) {
    // S2 (11-17 sn): Çapraz sepet yakın planı + düşen ürünler; Arda tam kadrajda
    const p = interpolate(frame, [s2, s3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [1.15, 0.95]), interpolate(p, [0, 1], [2.05, 1.8]), interpolate(p, [0, 1], [2.4, 2.0])];
    camTarget = [-0.18, 0.95, -0.4];
    ardaPos = [-0.62, 0, -0.5];
    ardaFace = "shock";
    cartPos = [0.58, 0, -0.4];
    cartScale = 1.22;
    dropProgress = interpolate(p, [0.08, 0.82], [0, 4.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  } else {
    // S3 (17-22 sn): Uzun koridor uçuşu -> parlak SÜT & EKMEK dolabı
    const p = interpolate(frame, [s3, s4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [0, 1.75, interpolate(p, [0, 1], [-0.5, -5.6])];
    camTarget = [0, 1.2, -9.8];
    ardaPos = [-0.75, 0, -8.3];
    ardaFace = "wink";
    cartPos = [0.78, 0, -8.4];
    cartScale = 1.15;
    dropProgress = 4;
  }

  return (
    <ThreeCanvas
      width={1080}
      height={1920}
      camera={{ position: [0, 1.95, 12.4], fov: 54, aspect: 1080 / 1920 }}
      style={{ width: 1080, height: 1920 }}
    >
      <color attach="background" args={["#EDE4D3"]} />
      <fog attach="fog" args={["#F4EDE2", 16, 32]} />
      <CameraRig position={camPos} target={camTarget} fov={54} />
      <MarketWorld />
      <Arda3D position={ardaPos} camPos={camPos} height={2.0} face={ardaFace} walking={ardaWalking} talking />
      <Cart3D position={cartPos} scale={cartScale} rotationY={-0.38} dropProgress={dropProgress} />
    </ThreeCanvas>
  );
};

/* S4 — Temiz Tam Ekran Bölünmüş İkilem */
const FinalSplit3D: React.FC = () => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column" }}>
    <div
      style={{
        flex: 1,
        background: "linear-gradient(135deg, #991B1B 0%, #450A0A 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderBottom: "8px solid #161616",
      }}
    >
      <div style={{ fontSize: 120, marginBottom: 12 }}>🛒</div>
      <div style={{ fontFamily: sans, fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.8)", letterSpacing: 1.5 }}>
        BÜYÜK SEPET TUZAĞI
      </div>
      <div style={{ fontFamily: slab, fontSize: 74, fontWeight: 900, color: "#FFFFFF", marginTop: 8 }}>DEV ARABA</div>
    </div>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        background: "#FACC15",
        color: "#161616",
        fontFamily: slab,
        fontSize: 36,
        fontWeight: 900,
        padding: "12px 30px",
        borderRadius: 99,
        border: "6px solid #161616",
        zIndex: 20,
      }}
    >
      VS
    </div>
    <div
      style={{
        flex: 1,
        background: "linear-gradient(135deg, #065F46 0%, #022C22 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 150,
      }}
    >
      <div style={{ fontSize: 110, marginBottom: 10 }}>🧺</div>
      <div style={{ fontFamily: sans, fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 1.5 }}>
        KONTROL SENDE
      </div>
      <div style={{ fontFamily: slab, fontSize: 74, fontWeight: 900, color: "#FDE047", marginTop: 8 }}>EL SEPETİ</div>
    </div>
  </AbsoluteFill>
);

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.05, "ding_correct-answer", 0.42], // S0 market kapı zili
  [1, wAt(1, "büyütünce"), "whoosh_short-sweep", 0.42], // S1 araba büyürken whoosh
  [2, 0.25, "pop_bubble-alert", 0.4], // S2 ürün 1 düşüş
  [2, 1.0, "pop_message", 0.4], // S2 ürün 2 düşüş
  [2, 1.75, "pop_bubble-alert", 0.4], // S2 ürün 3 düşüş
  [2, 2.5, "ding_correct-reward", 0.44], // S2 ürün 4 & %40
  [3, 0.9, "pop_hard", 0.45], // S3 tırtıklı fiş açılışı
  [4, 0.05, "pop_message", 0.42],
];

export const DijitalizMarket3D: React.FC = () => {
  const list = hits();
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const s3 = Math.round(sceneStart(3) * FPS);
  const s4 = Math.round(sceneStart(4) * FPS);
  const end = Math.round(sceneEnd(4) * FPS);

  return (
    <AbsoluteFill style={{ background: "#EDE4D3" }}>
      {/* S0..S3 Sürekli Canlı 3D Market */}
      <Sequence name="3D_Market" from={s0} durationInFrames={s4 - s0}>
        <MarketScene3D s0={s0} s1={s1} s2={s2} s3={s3} s4={s4} />
      </Sequence>

      {/* S0 Kanca Başlığı (Sadece ilk 2.5 sn) */}
      <Sequence from={0} durationInFrames={75}>
        <ChapterHud sub="MARKET TUZAĞI" />
        <ViralHeadline line1="ARABALAR 2 KAT" line2="BÜYÜDÜ!" y={155} at={-1} />
      </Sequence>

      {/* S2 Kompakt %40 Satış Barı (Tepe başlık kalabalığı yok) */}
      <Sequence from={s2} durationInFrames={s3 - s2}>
        <CizgiStatBar y={135} at={0.08} label="Satışlardaki Artış" percent={40} suffix="%" barColor="#16A34A" />
      </Sequence>

      {/* S3 Tırtıklı 2D Market Fişi */}
      <Sequence from={s3} durationInFrames={s4 - s3}>
        <MarketReceipt at={0.85} />
      </Sequence>

      {/* S4 Temiz Bölünmüş Final */}
      <Sequence name="Final_Split" from={s4} durationInFrames={end - s4}>
        <FinalSplit3D />
      </Sequence>

      {[s1, s2, s3, s4].map((st, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, st - 5)}>
          <Sfx name="whoosh_short-sweep" volume={0.3} />
        </Sequence>
      ))}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      <BgMusic words={words} baseVol={0.18} duckVol={0.14} />
      <Audio src={staticFile("dijitaliz-market/voice.mp3")} volume={0.95} />
      <FloatingParticles />
      <PaperGrain />
      <ViralCaptions words={words} y={1580} highlight={["iki", "tesadüf", "yüzde", "kırk", "eksik", "arkaya", "dev", "sepeti"]} />
    </AbsoluteFill>
  );
};
