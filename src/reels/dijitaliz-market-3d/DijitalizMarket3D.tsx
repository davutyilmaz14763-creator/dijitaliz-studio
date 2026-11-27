import React from "react";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
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

const easeCubic = Easing.inOut(Easing.cubic);

/** Sahne 1: Arda kapıdan girerken başının üstünde küçük düşünce balonu */
const ThoughtBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 7) * 5;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 635 + bob,
        transform: "translateX(-50%)",
        background: "#FFFDF7",
        border: "5px solid #161616",
        borderRadius: 99,
        padding: "12px 28px",
        fontFamily: slab,
        fontSize: 34,
        fontWeight: 900,
        color: "#161616",
        boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
        zIndex: 24,
      }}
    >
      🍞 1 EKMEK
    </div>
  );
};

/** Tırtıklı 2D Market Fişi (Sahne 5) */
const MarketReceipt: React.FC<{ at?: number }> = ({ at = 1.15 }) => {
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
        top: 155,
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

/** 6 Farklı Sinema Kamera Açısı + Aksiyonlu Arda3D + v4.2 Tüm Düzeltmeler */
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

  let camPos: [number, number, number] = [0, 2.5, 24.2];
  let camTarget: [number, number, number] = [0.25, 2.1, 9.6];
  let ardaPos: [number, number, number] = [0, 0, 14.2];
  let ardaPose: ArdaPose = "back";
  let ardaFace: "normal" | "shock" | "happy" | "wink" = "normal";
  let ardaWalking = false;
  let ardaSweating = false;
  let showCart = true;
  let cartPos: [number, number, number] = [0.7, 0, 5.2];
  let cartRot = 0;
  let cartScale = 1.25;
  let dropProgress = 0;
  let bgHex = "#0B132B";
  let checkoutText = "15,00 ₺";
  let checkoutBg = "#0284C7";

  if (frame < s1) {
    // SAHNE 1: Gece otoparktan 7/24 Market girişine yaklaşma + Arda yürür
    const p = interpolate(frame, [s0, s1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    camPos = [interpolate(p, [0, 1], [-0.1, 0]), interpolate(p, [0, 1], [2.5, 1.95]), interpolate(p, [0, 1], [24.2, 14.0])];
    camTarget = [0.25, 2.1, 9.6];
    ardaPos = [0, 0, interpolate(p, [0, 1], [14.2, 8.6])];
    ardaPose = "back";
    ardaWalking = true;
    showCart = false;
    bgHex = "#0B132B";
  } else if (frame < s2) {
    // SAHNE 2: Arda solda, 2x büyüyen araba sağda (aralarında net boşluk!)
    const p = interpolate(frame, [s1, s2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    const zWalk = interpolate(p, [0, 1], [5.2, 2.6]);
    camPos = [2.35, 1.9, zWalk + 3.15];
    camTarget = [-0.25, 1.0, zWalk - 0.1];
    ardaPos = [-0.82, 0, zWalk + 0.35];
    ardaPose = "pushCart";
    ardaWalking = true;
    cartPos = [0.74, 0, zWalk - 0.3];
    cartRot = -0.35;
    const growAt = sceneStart(1) + wAt(1, "iki");
    cartScale = interpolate(frame / FPS, [sceneStart(1), growAt, growAt + 0.8], [0.56, 0.56, 1.24], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    ardaFace = frame / FPS >= growAt ? "shock" : "normal";
    bgHex = "#EDE4D3";
  } else if (frame < s3) {
    // SAHNE 3: Arkadan koridor yürüyüşü (belirgin sol-sağ bacak adımı)
    const p = interpolate(frame, [s2, s3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    const zWalk = interpolate(p, [0, 1], [2.2, -4.6]);
    camPos = [interpolate(p, [0, 1], [0.35, -0.25]), 1.9, zWalk + 2.95];
    camTarget = [0, 1.35, -9.8];
    ardaPos = [0, 0, zWalk];
    ardaPose = "back";
    ardaWalking = p < 0.88;
    cartPos = [0, 0, zWalk - 1.15];
    cartRot = 0;
    cartScale = 1.2;
    bgHex = "#EDE4D3";
  } else if (frame < s4) {
    // SAHNE 4: Üst-çapraz sepet yakın planı; ürünler kafes merkezine oturur, Arda yüzü 100% açıkta
    const p = interpolate(frame, [s3, s4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    camPos = [interpolate(p, [0, 1], [1.45, 1.25]), interpolate(p, [0, 1], [2.45, 2.2]), interpolate(p, [0, 1], [-2.1, -2.4])];
    camTarget = [-0.25, 0.85, -5.2];
    ardaPos = [-1.25, 0, -5.85];
    ardaPose = "front";
    ardaFace = "shock";
    cartPos = [0.55, 0, -4.95];
    cartRot = -0.42;
    cartScale = 1.25;
    dropProgress = interpolate(p, [0.06, 0.82], [0, 4.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    bgHex = "#EDE4D3";
  } else if (frame < s5) {
    // SAHNE 5: Kasa ekranı sağda net kadrajda (15 -> 240 -> 840 TL) + fiş açılınca micro-shake & shock!
    const p = interpolate(frame, [s4, s5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    const tScene = frame / FPS - sceneStart(4);
    const receiptAt = 1.15;
    const shakeFrames = (tScene - receiptAt) * FPS;
    const shakeX = shakeFrames >= 0 && shakeFrames < 4 ? Math.sin(shakeFrames * 3.1) * 0.04 : 0;
    const shakeY = shakeFrames >= 0 && shakeFrames < 4 ? Math.cos(shakeFrames * 2.7) * 0.03 : 0;

    camPos = [0.6 + shakeX, 1.82 + shakeY, interpolate(p, [0, 1], [12.7, 12.1])];
    camTarget = [1.7, 1.18, 7.75];
    ardaPos = [1.0, 0, 7.95];
    ardaPose = "holdReceipt";
    const receiptOpened = tScene >= receiptAt;
    ardaFace = receiptOpened ? "shock" : "normal";
    ardaSweating = receiptOpened;
    showCart = false;
    bgHex = "#EDE4D3";

    if (tScene < 0.45) {
      checkoutText = "15,00 ₺";
      checkoutBg = "#0284C7";
    } else if (tScene < 0.95) {
      checkoutText = "240,00 ₺";
      checkoutBg = "#D97706";
    } else {
      checkoutText = "840,00 ₺";
      checkoutBg = "#DC2626";
    }
  } else {
    // SAHNE 6: Yakın yüz şoku (yanak hizasında ter damlaları)
    const p = interpolate(frame, [s5, splitFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    camPos = [0, 1.38, interpolate(p, [0, 1], [-1.05, -1.5])];
    camTarget = [0, 1.25, -4.0];
    ardaPos = [0, 0, -4.0];
    ardaPose = "closeupShock";
    ardaFace = "shock";
    ardaSweating = true;
    showCart = false;
    bgHex = "#EDE4D3";
  }

  return (
    <ThreeCanvas
      width={1080}
      height={1920}
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 2.5, 24.2], fov: 52, aspect: 1080 / 1920 }}
      style={{ width: 1080, height: 1920, filter: "contrast(1.05) saturate(1.10)" }}
    >
      <color attach="background" args={[bgHex]} />
      <fog attach="fog" args={[bgHex, 16, 36]} />
      <CameraRig position={camPos} target={camTarget} fov={52} />
      <MarketWorld checkoutText={checkoutText} checkoutBg={checkoutBg} />
      <Arda3D
        position={ardaPos}
        camPos={camPos}
        height={2.0}
        pose={ardaPose}
        face={ardaFace}
        walking={ardaWalking}
        talking
        sweating={ardaSweating}
      />
      {showCart && <Cart3D position={cartPos} scale={cartScale} rotationY={cartRot} dropProgress={dropProgress} />}
    </ThreeCanvas>
  );
};

/* Sahne 6 Finali — Numaralandırılmış Temiz Üst-Alt İkilem (1 · DEV ARABA / 2 · EL SEPETİ) */
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
      <div style={{ fontFamily: slab, fontSize: 72, fontWeight: 900, color: "#FFFFFF", marginTop: 8 }}>1 · DEV ARABA</div>
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
      <div style={{ fontFamily: slab, fontSize: 72, fontWeight: 900, color: "#FDE047", marginTop: 8 }}>2 · EL SEPETİ</div>
    </div>
  </AbsoluteFill>
);

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.35, "ding_correct-answer", 0.42], // Kapı zili
  [1, wAt(1, "iki"), "whoosh_short-sweep", 0.42], // 2x araba
  [3, 0.2, "pop_bubble-alert", 0.4],
  [3, 0.9, "pop_message", 0.4],
  [3, 1.6, "pop_bubble-alert", 0.4],
  [3, 2.3, "ding_correct-reward", 0.44],
  [4, 0.1, "ding_correct-answer", 0.35], // 15 TL bip
  [4, 0.48, "ding_correct-answer", 0.38], // 240 TL bip
  [4, 0.95, "ding_correct-answer", 0.44], // 840 TL bip
  [4, 1.15, "pop_hard", 0.46], // Fiş açılışı
  [5, 0.1, "pop_bubble-alert", 0.42],
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
  const splitFrame = Math.round((sceneStart(5) + wAt(5, "dev")) * FPS);

  return (
    <AbsoluteFill style={{ background: "#0B132B" }}>
      <Sequence name="3D_MiniDizi" from={s0} durationInFrames={splitFrame - s0}>
        <MarketScene3D s0={s0} s1={s1} s2={s2} s3={s3} s4={s4} s5={s5} splitFrame={splitFrame} />
      </Sequence>

      {/* Sahne 1: 🍞 1 EKMEK düşünce balonu */}
      <Sequence from={0} durationInFrames={Math.min(72, s1)}>
        <ThoughtBubble />
      </Sequence>

      {/* Sahne 4: Kompakt %40 Satış Barı */}
      <Sequence from={s3} durationInFrames={s4 - s3}>
        <CizgiStatBar y={115} at={wAt(3, "yüzde") - 0.15} label="Satışlardaki Artış" percent={40} suffix="%" barColor="#16A34A" />
      </Sequence>

      {/* Sahne 5: Tırtıklı 2D Kasa Fişi */}
      <Sequence from={s4} durationInFrames={s5 - s4}>
        <MarketReceipt at={1.15} />
      </Sequence>

      {/* Sahne 6 İkinci Kısım: 1 · DEV ARABA / 2 · EL SEPETİ Finali */}
      <Sequence name="Final_Split" from={splitFrame} durationInFrames={end - splitFrame}>
        <FinalSplit3D />
      </Sequence>

      {/* Yumuşak Kenar Vinyeti */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(2,6,23,0.28) 100%)",
          zIndex: 18,
        }}
      />

      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      <BgMusic words={words} baseVol={0.18} duckVol={0.14} />
      <Audio src={staticFile("dijitaliz-market/voice.mp3")} volume={0.95} />
      <FloatingParticles />
      <PaperGrain />
      <ViralCaptions words={words} y={1580} highlight={["ekmek", "iki", "dev", "arkaya", "eksik", "kırk", "tuzağıydı", "sepeti"]} />
    </AbsoluteFill>
  );
};
