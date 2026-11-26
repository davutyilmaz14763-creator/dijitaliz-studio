import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash } from "../components";
import { Sfx } from "../sfx";
import {
  Arda,
  BgMusic,
  ChapterHud,
  CizgiStatBar,
  FloatingParticles,
  MiniBot,
  PaperGrain,
  RealPhotoBg,
  rimGlow,
  sans,
  slab,
  SpeedLines,
  SplitScreen,
  SweatDrops,
  usePopAt,
  ViralCaptions,
  ViralHeadline,
  VWord,
} from "../cizgi/kit";
import voice from "./voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const DIJITALIZ_MARKET_FRAMES = Math.ceil((voice.duration + 0.5) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.1));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_MARKET_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode; immediate?: boolean }> = ({ children, immediate }) => {
  const p = usePopAt(0, 15, 210);
  if (immediate) return <AbsoluteFill>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.06, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

/* S0 — Kanca (0-3 sn): Parlak Market Arabaları + Arda Orta Plan */
const S0: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shock = frame / FPS >= wAt(0, "tesadüf");
  return (
    <AbsoluteFill style={{ background: "#0F172A" }}>
      <RealPhotoBg src="dijitaliz-market/img/cart.jpg" duration={dur} opacity={0.58} tint="rgba(2, 6, 23, 0.36)" />
      <SpeedLines opacity={0.22} />
      <ChapterHud sub="PSİKOLOJİ · MARKET" />
      <ViralHeadline line1="ARABALAR 2 KAT" line2="BÜYÜDÜ!" y={170} at={-1} />
      <MiniBot id="mb0" x={250} y={935} size={120} face={shock ? "shock" : "normal"} enterAt={-1} />
      <div style={{ filter: rimGlow }}>
        <Arda id="arda0" x={575} y={1240} size={420} shot="wide" face={shock ? "shock" : "normal"} armL={shock ? 125 : 20} armR={shock ? 125 : 20} enterAt={-1} />
      </div>
      <SweatDrops x={575} y={810} at={wAt(0, "tesadüf")} />
    </AbsoluteFill>
  );
};

/* S1 — Kurulum + Soru: Küçük Sepet vs 2x Büyüyen Dev Araba + Arda Alt Köşede Küçük */
const S1: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame / FPS - wAt(1, "büyütünce"), [0, 0.7], [1, 1.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#1E1B4B" }}>
      <RealPhotoBg src="dijitaliz-market/img/basket.jpg" duration={dur} opacity={0.56} tint="rgba(15, 23, 42, 0.38)" />
      <ChapterHud sub="1937 · BÜYÜME DENEYİ" />
      <ViralHeadline line1="2 KAT BÜYÜYÜNCE" line2="SATIŞ KAÇ FIRLADI?" color2="#FDE047" y={165} />
      {/* Görsel Metafor: Küçük Sepet -> 2x Büyüyen Araba */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 470, display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 15 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 120, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))" }}>🧺</div>
          <div style={{ fontFamily: slab, fontSize: 32, fontWeight: 900, color: "#E2E8F0", WebkitTextStroke: "3px #0F172A", paintOrder: "stroke fill" }}>1937</div>
        </div>
        <div style={{ fontFamily: slab, fontSize: 64, fontWeight: 900, color: "#FACC15", WebkitTextStroke: "4px #0F172A", paintOrder: "stroke fill" }}>→ 2×</div>
        <div style={{ textAlign: "center", transform: `scale(${grow})` }}>
          <div style={{ fontSize: 130, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.65))" }}>🛒</div>
        </div>
      </div>
      <div style={{ filter: rimGlow }}>
        <Arda id="arda1" x={195} y={1315} size={295} shot="wide" face="normal" armL={15} armR={115} enterAt={0.08} />
      </div>
    </AbsoluteFill>
  );
};

/* S2 — Veri: Arda Yakın Yüz Çekimi (scale 1.55) + %40 CizgiStatBar */
const S2: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const isClose = frame / FPS < wAt(2, "sepetin");
  return (
    <AbsoluteFill style={{ background: "#064E3B" }}>
      <RealPhotoBg src="dijitaliz-market/img/aisle.jpg" duration={dur} opacity={0.58} tint="rgba(6, 78, 59, 0.38)" />
      <SpeedLines opacity={0.22} />
      <ChapterHud sub="GERÇEK VERİ · ETKİ" dotColor="#4ADE80" />
      <ViralHeadline line1="TAM YÜZDE 40" line2="SATIŞ ARTIŞI!" color2="#4ADE80" y={165} />
      <CizgiStatBar y={395} at={0.1} label="Satışlardaki Artış" percent={40} suffix="%" barColor="#22C55E" />
      <MiniBot id="mb2" x={840} y={890} size={120} color="#4ADE80" face="happy" enterAt={0.15} />
      <div style={{ filter: rimGlow }}>
        <Arda id="arda2" x={540} y={1285} size={415} shot={isClose ? "closeup" : "wide"} face="shock" armL={120} armR={120} enterAt={0.05} />
      </div>
    </AbsoluteFill>
  );
};

/* S3 — Ters Köşe: Market Kroki / Rota Animasyonu + Arda Alt Köşede Küçük */
const S3: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const walk = interpolate(frame, [0, dur * 0.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dotX = interpolate(walk, [0, 0.5, 1], [150, 540, 880]);
  const dotY = interpolate(walk, [0, 0.5, 1], [860, 620, 560]);
  return (
    <AbsoluteFill style={{ background: "#450A0A" }}>
      <RealPhotoBg src="dijitaliz-market/img/dairy.jpg" duration={dur} opacity={0.56} tint="rgba(30, 27, 75, 0.40)" />
      <ChapterHud sub="TERS KÖŞE · ROTA PLANI" dotColor="#EF4444" />
      <ViralHeadline line1="EKMEK VE SÜT" line2="NEDEN EN ARKADA?" color2="#FCA5A5" y={165} />
      {/* Market Kroki / Rota SVG */}
      <svg viewBox="0 0 1080 1000" style={{ position: "absolute", inset: 0, width: "100%", height: 1000, top: 200, zIndex: 14 }}>
        <rect x={110} y={320} width={860} height={600} rx={36} fill="rgba(15,23,42,0.72)" stroke="#FFFFFF" strokeWidth={6} />
        {/* Raflar */}
        <rect x={270} y={400} width={160} height={360} rx={16} fill="#334155" stroke="#94A3B8" strokeWidth={4} />
        <rect x={560} y={400} width={160} height={360} rx={16} fill="#334155" stroke="#94A3B8" strokeWidth={4} />
        {/* Rota Çizgisi */}
        <path d="M 150 860 L 150 620 L 880 620 L 880 560" fill="none" stroke="#FACC15" strokeWidth={10} strokeDasharray="20 14" strokeLinecap="round" />
        {/* Hareketli Müşteri / Araba Noktası */}
        <circle cx={dotX} cy={dotY} r={24} fill="#FACC15" stroke="#0F172A" strokeWidth={6} />
        {/* Giriş ve Süt/Ekmek İkonları */}
        <text x={155} y={905} textAnchor="middle" fill="#4ADE80" fontSize={30} fontWeight="900" fontFamily={sans}>GİRİŞ 🚪</text>
        <text x={875} y={495} textAnchor="middle" fontSize={78}>🥛🍞</text>
        <text x={875} y={540} textAnchor="middle" fill="#FCA5A5" fontSize={26} fontWeight="900" fontFamily={sans}>EN ARKA</text>
      </svg>
      <div style={{ filter: rimGlow }}>
        <Arda id="arda3" x={875} y={1315} size={295} shot="wide" face="wink" armL={115} armR={20} enterAt={0.08} />
      </div>
    </AbsoluteFill>
  );
};

/* S4 — Final İkilem: Tam Ekran Temiz Üst-Alt Bölünmüş Ekran (Arda yok!) */
const S4: React.FC<{ dur: number }> = ({ dur }) => (
  <AbsoluteFill style={{ background: "#020617" }}>
    <RealPhotoBg src="dijitaliz-market/img/checkout.jpg" duration={dur} opacity={0.45} tint="rgba(2, 6, 23, 0.35)" />
    <SplitScreen
      fullScreen
      topLabel="BÜYÜK SEPET TUZAĞI"
      topValue="DEV ARABA 🛒"
      topBg="linear-gradient(135deg, rgba(153,27,27,0.88) 0%, rgba(69,10,10,0.92) 100%)"
      bottomLabel="KONTROL SENDE"
      bottomValue="EL SEPETİ 🧺"
      bottomBg="linear-gradient(135deg, rgba(6,95,70,0.88) 0%, rgba(2,44,34,0.92) 100%)"
      at={0.05}
    />
    <ChapterHud sub="SENİN SEÇİMİN?" dotColor="#FACC15" />
  </AbsoluteFill>
);

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.05, "pop_bubble-alert", 0.45],
  [0, wAt(0, "tesadüf"), "pop_hard", 0.45],
  [1, wAt(1, "büyütünce"), "pop_message", 0.45],
  [2, 0.05, "ding_correct-reward", 0.48],
  [3, 0.1, "pop_bubble-alert", 0.42],
  [4, 0.08, "pop_message", 0.45],
];

export const DijitalizMarket: React.FC = () => {
  const list = hits();
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const s3 = Math.round(sceneStart(3) * FPS);
  const s4 = Math.round(sceneStart(4) * FPS);
  const end = Math.round(sceneEnd(4) * FPS);

  return (
    <AbsoluteFill style={{ background: "#020617" }}>
      <Sequence name="Kanca" from={s0} durationInFrames={s1 - s0}>
        <SceneWrap immediate>
          <S0 dur={s1 - s0} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s1 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Kurulum" from={s1} durationInFrames={s2 - s1}>
        <SceneWrap>
          <S1 dur={s2 - s1} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s2 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Veri" from={s2} durationInFrames={s3 - s2}>
        <SceneWrap>
          <S2 dur={s3 - s2} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s3 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="TersKose" from={s3} durationInFrames={s4 - s3}>
        <SceneWrap>
          <S3 dur={s4 - s3} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s4 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Final" from={s4} durationInFrames={end - s4}>
        <SceneWrap>
          <S4 dur={end - s4} />
        </SceneWrap>
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
      <ViralCaptions words={words} y={1490} highlight={["iki", "tesadüf", "yüzde", "kırk", "eksik", "arkaya", "dev", "sepeti"]} />
    </AbsoluteFill>
  );
};
