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
  InsertCard,
  PaperGrain,
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

/** 3D Sahne + Kamera Kontrolcüsü (S0..S3 arası sürekli akan stilize 3D dünya) */
const MarketScene3D: React.FC<{
  s0: number;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
}> = ({ s0, s1, s2, s3, s4 }) => {
  const frame = useCurrentFrame();

  // Kamera konumu & hedefi (her sahnede farklı sinematik 3D açı)
  let camPos: [number, number, number] = [0, 1.9, 8.8];
  let camTarget: [number, number, number] = [0, 1.1, 4.5];
  let ardaPos: [number, number, number] = [-0.85, 0, 5.2];
  let ardaFace: "normal" | "shock" | "happy" | "wink" = "normal";
  let ardaWalking = false;
  let cartPos: [number, number, number] = [0.75, 0, 5.0];
  let cartScale = 1.25;
  let cartFilled = 0;

  if (frame < s1) {
    // S0: Girişten içeri kayarak Arda + dev arabaya yaklaşır
    const p = interpolate(frame, [s0, s1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [-0.25, 0.15]), interpolate(p, [0, 1], [1.9, 1.65]), interpolate(p, [0, 1], [8.6, 6.8])];
    camTarget = [0, 0.95, 4.9];
    ardaPos = [-0.75, 0, 5.0];
    cartPos = [0.75, 0, 4.9];
    ardaFace = frame / FPS >= wAt(0, "tesadüf") ? "shock" : "normal";
  } else if (frame < s2) {
    // S1: Koridorda yürüyen Arda + 1937 küçük sepet 2x dev arabaya büyür
    const p = interpolate(frame, [s1, s2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zWalk = interpolate(p, [0, 1], [4.5, 1.4]);
    camPos = [0.25, 1.75, zWalk + 3.4];
    camTarget = [0, 0.95, zWalk - 0.3];
    ardaPos = [-0.78, 0, zWalk];
    ardaWalking = true;
    cartPos = [0.72, 0, zWalk - 0.15];
    const growT = sceneStart(1) + wAt(1, "büyütünce");
    cartScale = interpolate(frame / FPS, [sceneStart(1), growT, growT + 0.8], [0.58, 0.58, 1.32], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame < s3) {
    // S2: Close-up! Arda + sepet dolarken %40 artışı
    const p = interpolate(frame, [s2, s3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [-0.2, 0.1]), 1.4, interpolate(p, [0, 1], [2.4, 1.75])];
    camTarget = [0, 1.05, -0.4];
    ardaPos = [-0.7, 0, -0.35];
    ardaFace = "shock";
    cartPos = [0.68, 0, -0.4];
    cartScale = 1.3;
    cartFilled = Math.min(4, Math.floor(p * 5));
  } else {
    // S3: Koridor içinden en arkadaki ışıklı Süt & Ekmek dolabına uçuş
    const p = interpolate(frame, [s3, s4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    camPos = [interpolate(p, [0, 1], [0.15, -0.25]), 1.65, interpolate(p, [0, 1], [-1.2, -5.2])];
    camTarget = [0, 1.15, -9.2];
    ardaPos = [-0.85, 0, -8.0];
    ardaFace = "wink";
    cartPos = [0.85, 0, -8.1];
    cartScale = 1.25;
    cartFilled = 4;
  }

  return (
    <ThreeCanvas
      width={1080}
      height={1920}
      camera={{ position: [0, 1.9, 8.6], fov: 54, aspect: 1080 / 1920 }}
      style={{ width: 1080, height: 1920 }}
    >
      <color attach="background" args={["#0F172A"]} />
      <fog attach="fog" args={["#0F172A", 14, 28]} />
      <CameraRig position={camPos} target={camTarget} fov={54} />
      <MarketWorld />
      <Arda3D position={ardaPos} height={2.05} face={ardaFace} walking={ardaWalking} />
      <Cart3D position={cartPos} scale={cartScale} rotationY={-0.35} filled={cartFilled} />
    </ThreeCanvas>
  );
};

/* S4 — Temiz Tam Ekran Bölünmüş İkilem (Ara kare yok, altyazıyla çakışmaz) */
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
        borderBottom: "8px solid #0F172A",
      }}
    >
      <div style={{ fontSize: 120, marginBottom: 12 }}>🛒</div>
      <div style={{ fontFamily: "sans-serif", fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.8)", letterSpacing: 1.5 }}>
        BÜYÜK SEPET TUZAĞI
      </div>
      <div style={{ fontFamily: "sans-serif", fontSize: 74, fontWeight: 900, color: "#FFFFFF", marginTop: 8 }}>DEV ARABA</div>
    </div>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        background: "#FACC15",
        color: "#0F172A",
        fontFamily: "sans-serif",
        fontSize: 36,
        fontWeight: 900,
        padding: "12px 30px",
        borderRadius: 99,
        border: "6px solid #0F172A",
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
      <div style={{ fontFamily: "sans-serif", fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.85)", letterSpacing: 1.5 }}>
        KONTROL SENDE
      </div>
      <div style={{ fontFamily: "sans-serif", fontSize: 74, fontWeight: 900, color: "#FDE047", marginTop: 8 }}>EL SEPETİ</div>
    </div>
  </AbsoluteFill>
);

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.05, "pop_bubble-alert", 0.45],
  [0, wAt(0, "tesadüf"), "pop_hard", 0.45],
  [1, wAt(1, "büyütünce"), "pop_message", 0.45],
  [2, 0.05, "ding_correct-reward", 0.48],
  [3, 0.1, "pop_bubble-alert", 0.42],
  [4, 0.05, "pop_message", 0.45],
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
    <AbsoluteFill style={{ background: "#0F172A" }}>
      {/* S0..S3 Tek Sürekli Stilize 3D Dünya */}
      <Sequence name="3D_Market" from={s0} durationInFrames={s4 - s0}>
        <MarketScene3D s0={s0} s1={s1} s2={s2} s3={s3} s4={s4} />
      </Sequence>

      {/* S0 Başlık (İlk 0.5 sn) */}
      <Sequence from={s0} durationInFrames={s1 - s0}>
        <ChapterHud sub="3D MARKET · PSİKOLOJİ" />
        <ViralHeadline line1="ARABALAR 2 KAT" line2="BÜYÜDÜ!" y={170} at={-1} />
      </Sequence>

      {/* S1 Başlık */}
      <Sequence from={s1} durationInFrames={s2 - s1}>
        <ChapterHud sub="1937 · BÜYÜME DENEYİ" />
        <ViralHeadline line1="2 KAT BÜYÜYÜNCE" line2="SATIŞ KAÇ FIRLADI?" color2="#FDE047" y={170} />
      </Sequence>

      {/* S2 %40 Veri */}
      <Sequence from={s2} durationInFrames={s3 - s2}>
        <ChapterHud sub="GERÇEK VERİ · ETKİ" dotColor="#4ADE80" />
        <ViralHeadline line1="TAM YÜZDE 40" line2="SATIŞ ARTIŞI!" color2="#4ADE80" y={165} />
        <CizgiStatBar y={390} at={0.08} label="Satışlardaki Artış" percent={40} suffix="%" barColor="#22C55E" />
      </Sequence>

      {/* S3 Süt & Ekmek En Arkada */}
      <Sequence from={s3} durationInFrames={s4 - s3}>
        <ChapterHud sub="TERS KÖŞE · EN ARKA" dotColor="#EF4444" />
        <ViralHeadline line1="EKMEK VE SÜT" line2="NEDEN EN ARKADA?" color2="#FCA5A5" y={165} />
        <InsertCard
          badge="MARKET FİŞİ · ROTA"
          title="Kasa Yolunda Zorunlu Tur"
          metric="🥛 SÜT & 🍞 EKMEK"
          sub="En arkadaki soğutucu dolapta!"
          icon="🧾"
          accent="#38BDF8"
          y={390}
          at={0.12}
        />
      </Sequence>

      {/* S4 Keskin Geçişli Temiz Final İkilemi */}
      <Sequence name="Final_Split" from={s4} durationInFrames={end - s4}>
        <FinalSplit3D />
        <ChapterHud sub="SENİN SEÇİMİN?" dotColor="#FACC15" />
      </Sequence>

      {[s1, s2, s3, s4].map((st, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, st - 5)}>
          <Sfx name="whoosh_short-sweep" volume={0.32} />
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
