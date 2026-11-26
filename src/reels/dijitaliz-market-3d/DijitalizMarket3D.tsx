import React from "react";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../sfx";
import {
  BgMusic,
  CizgiStatBar,
  FloatingParticles,
  PaperGrain,
  sans,
  slab,
  usePopAt,
  ViralCaptions,
  VWord,
} from "../cizgi/kit";
import { Arda3D, ArdaPose, CameraRig } from "../three/world";
import { Cart3D, MarketWorld } from "../three/MarketWorld";
import voice from "../dijitaliz-market/voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const DIJITALIZ_MARKET_3D_FRAMES = Math.ceil((voice.duration + 0.5) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.08));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_MARKET_3D_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

/** Tırtıklı 2D Market Fişi (Sahne 5) */
const MarketReceipt: React.FC<{ at?: number }> = ({ at = 1.4 }) => {
  const p = usePopAt(at, 15, 200);
  const rows = [
    ["1x EKMEK", "15 TL"],
    ["1x SÜT", "45 TL"],
    ["+ 6 PLANSIZ ÜRÜN", "780 TL"],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 170,
        width: 680,
        transform: `translate(-50%, ${interpolate(p, [0, 1], [80, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        opacity: Math.min(1, p * 2.5),
        background: "#FAF8F5",
        border: "5px solid #161616",
        boxShadow: "0 22px 45px rgba(0,0,0,0.45)",
        padding: "32px 38px 26px",
        zIndex: 22,
        clipPath:
          "polygon(0 0, 100% 0, 100% 96%, 96% 100%, 92% 96%, 88% 100%, 84% 96%, 80% 100%, 76% 96%, 72% 100%, 68% 96%, 64% 100%, 60% 96%, 56% 100%, 52% 96%, 48% 100%, 44% 96%, 40% 100%, 36% 96%, 32% 100%, 28% 96%, 24% 100%, 20% 96%, 16% 100%, 12% 96%, 8% 100%, 4% 96%, 0 100%)",
      }}
    >
      <div style={{ textAlign: "center", fontFamily: slab, fontSize: 38, fontWeight: 900, color: "#161616", letterSpacing: 1 }}>
        DİJİTALİZ MARKET
      </div>
      <div style={{ textAlign: "center", fontFamily: sans, fontSize: 22, fontWeight: 700, color: "#64748B", marginBottom: 16 }}>
        7/24 · KASA FİŞİ
      </div>
      <div style={{ borderTop: "3px dashed #94A3B8", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 30, fontWeight: 800, color: i === 2 ? "#DC2626" : "#1E293B" }}>
            <span>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
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
      <div style={{ marginTop: 18, height: 40, display: "flex", justifyContent: "center", gap: 4 }}>
        {[6, 3, 8, 2, 5, 9, 3, 6, 2, 7, 4, 8, 3, 5, 2, 9, 4, 6, 3, 7, 2, 5, 8, 3].map((w, bi) => (
          <div key={bi} style={{ width: w, height: "100%", background: "#161616" }} />
        ))}
      </div>
    </div>
  );
};

/** 6 Farklı Sinema Kamera Açısı + 5 Aksiyon Pozlu Arda3D */
const MarketScene3D: React.FC<{
  s0: number;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  splitFrame: number;
}> = ({ s0, s1, s2, s3, s4, s5, splitFrame }) => {
  const frame = useCurrentFrame();

  let camPos: [number, number, number] = [0, 2.2, 16.5];
  let camTarget: [number, number, number] = [0, 1.5, 9.8];
  let ardaPos: [number, number, number] = [0, 0, 13.0];
  let ardaPose: ArdaPose = "back";
  let ardaWalking = false;
  let showCart = true;
  let cartPos: [number, number, number] = [0.7, 0, 5.2];
  let cartRot = 0;
  let cartScale = 1.25;
  let dropProgress = 0;
  let bgHex = "#0B132B";

  if (frame < s1) {
    // SAHNE 1 (0-4 sn): DIŞ ÇEKİM — Gece otoparktan 7/24 Market girişine yaklaşma + Arda (back) kapıdan içeri girer
    const p = interpolate(frame, [s0, s1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [-0.4, 0]), interpolate(p, [0, 1], [2.4, 1.85]), interpolate(p, [0, 1], [17.2, 12.6])];
    camTarget = [0, 1.8, 9.4];
    ardaPos = [0, 0, interpolate(p, [0, 1], [13.8, 8.6])];
    ardaPose = "back";
    ardaWalking = true;
    showCart = false;
    bgHex = "#0B132B";
  } else if (frame < s2) {
    // SAHNE 2 (4-9 sn): İÇ GİRİŞ — 45° yan açıdan dev araba iten Arda (pushCart)
    const p = interpolate(frame, [s1, s2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zWalk = interpolate(p, [0, 1], [6.4, 3.0]);
    camPos = [2.85, 1.9, zWalk + 2.85];
    camTarget = [-0.18, 1.0, zWalk - 0.35];
    ardaPos = [-0.15, 0, zWalk + 0.72];
    ardaPose = "pushCart";
    ardaWalking = true;
    cartPos = [0.22, 0, zWalk - 0.28];
    cartRot = -0.3;
    cartScale = 1.25;
    bgHex = "#EDE4D3";
  } else if (frame < s3) {
    // SAHNE 3 (9-15 sn): OMUZ ÜSTÜ / ARKADAN KORİDOR — Arda (back) renkli raflar arasından Süt/Ekmek dolabına yürür
    const p = interpolate(frame, [s2, s3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zWalk = interpolate(p, [0, 1], [2.4, -4.6]);
    camPos = [interpolate(p, [0, 1], [0.45, -0.35]), 1.9, zWalk + 2.8];
    camTarget = [0, 1.35, -9.8];
    ardaPos = [0, 0, zWalk];
    ardaPose = "back";
    ardaWalking = p < 0.85;
    cartPos = [0, 0, zWalk - 1.1];
    cartRot = 0;
    cartScale = 1.2;
    bgHex = "#EDE4D3";
  } else if (frame < s4) {
    // SAHNE 4 (15-20 sn): ÜST ÇAPRAZ SEPET YAKIN PLANI — 4 ürün düşer, Arda sıkışmaz
    const p = interpolate(frame, [s3, s4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [1.65, 1.3]), interpolate(p, [0, 1], [2.5, 2.2]), interpolate(p, [0, 1], [-2.5, -3.0])];
    camTarget = [-0.2, 0.8, -5.2];
    ardaPos = [-0.95, 0, -5.4];
    ardaPose = "front";
    cartPos = [0.3, 0, -5.2];
    cartRot = -0.45;
    cartScale = 1.28;
    dropProgress = interpolate(p, [0.08, 0.84], [0, 4.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    bgHex = "#EDE4D3";
  } else if (frame < s5) {
    // SAHNE 5 (20-26 sn): KASA TEZGÂHI — 840,00 ₺ kasa ekranı önünde fiş tutan Arda (holdReceipt)
    const p = interpolate(frame, [s4, s5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [0.25, 0.55]), 1.78, interpolate(p, [0, 1], [10.1, 9.5])];
    camTarget = [1.55, 1.15, 6.7];
    ardaPos = [1.05, 0, 6.9];
    ardaPose = "holdReceipt";
    showCart = false;
    bgHex = "#EDE4D3";
  } else {
    // SAHNE 6 (26-29 sn): YAKIN YÜZ ŞOKU — Tam ortada kesilmeyen Arda (closeupShock)
    const p = interpolate(frame, [s5, splitFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [0, 1.38, interpolate(p, [0, 1], [-1.0, -1.55])];
    camTarget = [0, 1.25, -4.0];
    ardaPos = [0, 0, -4.0];
    ardaPose = "closeupShock";
    showCart = false;
    bgHex = "#EDE4D3";
  }

  return (
    <ThreeCanvas
      width={1080}
      height={1920}
      camera={{ position: [0, 2.4, 17.2], fov: 54, aspect: 1080 / 1920 }}
      style={{ width: 1080, height: 1920 }}
    >
      <color attach="background" args={[bgHex]} />
      <fog attach="fog" args={[bgHex, 18, 36]} />
      <CameraRig position={camPos} target={camTarget} fov={54} />
      <MarketWorld />
      <Arda3D position={ardaPos} camPos={camPos} height={2.0} pose={ardaPose} walking={ardaWalking} talking />
      {showCart && <Cart3D position={cartPos} scale={cartScale} rotationY={cartRot} dropProgress={dropProgress} />}
    </ThreeCanvas>
  );
};

/* Sahne 6 Finali — Temiz Tam Ekran Üst-Alt İkilem */
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
  [0, 0.4, "ding_correct-answer", 0.42], // Sahne 1 kapı zili
  [1, 0.15, "whoosh_short-sweep", 0.35], // Sahne 2 araba itme
  [3, 0.25, "pop_bubble-alert", 0.4], // Sahne 4 ürün 1
  [3, 1.0, "pop_message", 0.4], // Sahne 4 ürün 2
  [3, 1.75, "pop_bubble-alert", 0.4], // Sahne 4 ürün 3
  [3, 2.5, "ding_correct-reward", 0.44], // Sahne 4 %40
  [4, 0.35, "ding_correct-answer", 0.42], // Sahne 5 kasa bip
  [4, 1.4, "pop_hard", 0.45], // Sahne 5 fiş açılışı
  [5, 0.1, "pop_bubble-alert", 0.42], // Sahne 6 şok
];

export const DijitalizMarket3D: React.FC = () => {
  const list = hits();
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const s3 = Math.round(sceneStart(3) * FPS);
  const s4 = Math.round(sceneStart(4) * FPS);
  const s5 = Math.round(sceneStart(5) * FPS);
  const end = Math.round(sceneEnd(5) * FPS);
  const splitFrame = Math.round((sceneStart(5) + wAt(5, "bir")) * FPS);

  return (
    <AbsoluteFill style={{ background: "#0B132B" }}>
      {/* Sahne 1..6 İlk Kısım — Sürekli 3D Mini Dizi */}
      <Sequence name="3D_MiniDizi" from={s0} durationInFrames={splitFrame - s0}>
        <MarketScene3D s0={s0} s1={s1} s2={s2} s3={s3} s4={s4} s5={s5} splitFrame={splitFrame} />
      </Sequence>

      {/* Sahne 4 Kompakt %40 Satış Barı */}
      <Sequence from={s3} durationInFrames={s4 - s3}>
        <CizgiStatBar y={115} at={wAt(3, "yüzde") - 0.15} label="Satışlardaki Artış" percent={40} suffix="%" barColor="#16A34A" />
      </Sequence>

      {/* Sahne 5 Tırtıklı 2D Kasa Fişi */}
      <Sequence from={s4} durationInFrames={s5 - s4}>
        <MarketReceipt at={1.4} />
      </Sequence>

      {/* Sahne 6 İkinci Kısım — Keskin Geçişli Temiz İkilem Finali */}
      <Sequence name="Final_Split" from={splitFrame} durationInFrames={end - splitFrame}>
        <FinalSplit3D />
      </Sequence>

      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      <BgMusic words={words} baseVol={0.18} duckVol={0.14} />
      <Audio src={staticFile("dijitaliz-market/voice.mp3")} volume={0.95} />
      <FloatingParticles />
      <PaperGrain />
      <ViralCaptions words={words} y={1580} highlight={["ekmek", "dev", "arkaya", "eksik", "kırk", "kırk", "tuzağıydı", "sepeti"]} />
    </AbsoluteFill>
  );
};
