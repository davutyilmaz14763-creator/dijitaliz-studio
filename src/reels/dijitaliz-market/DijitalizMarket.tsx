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
  InsertCard,
  MiniBot,
  PaperGrain,
  RealPhotoBg,
  rimGlow,
  SpeedLines,
  SplitScreen,
  Sunburst,
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
export const DIJITALIZ_MARKET_FRAMES = Math.ceil((voice.duration + 0.65) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_MARKET_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode; immediate?: boolean }> = ({ children, immediate }) => {
  const p = usePopAt(0, 15, 210);
  if (immediate) return <AbsoluteFill>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.07, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

/* Beat 1 — HOOK (Wide + Frame 0 = Kapak): RealPhotoBg + ViralHeadline + Arda */
const S0: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shock = frame / FPS >= wAt(0, "sebebi");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #1E3A8A 0%, #0F172A 60%, #020617 100%)" }}>
      <RealPhotoBg src="dijitaliz-market/img/cart.jpg" duration={dur} opacity={0.46} />
      <SpeedLines opacity={0.22} />
      <ChapterHud sub="PSİKOLOJİ · MARKET TUZAĞI" />
      <ViralHeadline line1="SEPETİN NEDEN" line2="HEP DOLAR?" y={170} at={-1} />
      <MiniBot id="mb0" x={255} y={930} size={125} face={shock ? "shock" : "normal"} enterAt={-1} />
      <div style={{ filter: rimGlow }}>
        <Arda id="arda0" x={580} y={1245} size={440} shot="wide" face={shock ? "shock" : "normal"} armL={shock ? 125 : 20} armR={shock ? 125 : 20} enterAt={-1} />
      </div>
      <SweatDrops x={580} y={805} at={wAt(0, "sebebi")} />
    </AbsoluteFill>
  );
};

/* Beat 2 — SETUP (Insert Shot): 1937 Deneyi Belgesi */
const S1: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #9A3412 0%, #431407 65%, #1C0A00 100%)" }}>
    <Sunburst a="rgba(251,146,60,0.14)" b="rgba(254,215,170,0.05)" cy={800} />
    <ChapterHud sub="1937 · İLK DENEY" />
    <ViralHeadline line1="KİMSE KULLANMAK" line2="İSTEMEDİ!" color2="#FDE047" y={165} />
    <InsertCard
      badge="TARİHİ KAYIT · 1937"
      title="İlk Market Arabası"
      metric="ÇOK KÜÇÜKTÜ"
      sub="Müşteriler sepeti tercih etti"
      icon="🛒"
      accent="#FACC15"
      y={400}
      at={0.1}
    />
    <MiniBot id="mb1" x={795} y={960} size={120} color="#FACC15" face="normal" enterAt={0.18} />
    <div style={{ filter: rimGlow }}>
      <Arda id="arda1" x={500} y={1250} size={410} shot="wide" face="normal" armL={25} armR={115} enterAt={0.08} />
    </div>
  </AbsoluteFill>
);

/* Beat 3 — QUIZ (Close-Up): Arda Yakın Yüz + Mini Merak Sorusu */
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const ask = frame / FPS >= wAt(2, "yüzde");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #312E81 0%, #0F172A 65%, #020617 100%)" }}>
      <SpeedLines opacity={0.25} />
      <ChapterHud sub="MİNi TEST · TAHMİN ET" dotColor="#38BDF8" />
      <ViralHeadline line1="2 KAT BÜYÜYÜNCE" line2="SATIŞ KAÇ ARTTI?" color2="#38BDF8" y={170} />
      <div style={{ filter: rimGlow }}>
        <Arda id="arda2" x={540} y={1260} size={430} shot="closeup" face={ask ? "wink" : "shock"} armL={120} armR={120} enterAt={0.05} />
      </div>
      <MiniBot id="mb2" x={210} y={760} size={125} color="#38BDF8" face="shock" enterAt={0.15} />
    </AbsoluteFill>
  );
};

/* Beat 4 — REVEAL (Wide + StatBar): %40 Artış */
const S3: React.FC<{ dur: number }> = ({ dur }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #065F46 0%, #0F172A 65%, #020617 100%)" }}>
    <RealPhotoBg src="dijitaliz-market/img/cart.jpg" duration={dur} opacity={0.34} tint="rgba(6, 78, 59, 0.62)" />
    <ChapterHud sub="GERÇEK VERİ · ETKİ" dotColor="#4ADE80" />
    <ViralHeadline line1="TAM YÜZDE 40" line2="DAHA FAZLA HARCAMA!" color2="#4ADE80" y={165} />
    <CizgiStatBar y={415} at={wAt(3, "kırk") - 0.15} label="Satışlardaki Artış" percent={40} suffix="%" barColor="#22C55E" />
    <MiniBot id="mb3" x={250} y={960} size={125} color="#4ADE80" face="happy" enterAt={0.15} />
    <div style={{ filter: rimGlow }}>
      <Arda id="arda3" x={580} y={1250} size={420} shot="wide" face="happy" armL={120} armR={120} enterAt={0.08} />
    </div>
  </AbsoluteFill>
);

/* Beat 5 — TWIST (Close-Up + InsertCard): Tekerleklerin Sola Çekmesi */
const S4: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #7F1D1D 0%, #1E1B4B 65%, #090D16 100%)" }}>
    <SpeedLines opacity={0.28} />
    <ChapterHud sub="TERS KÖŞE · TEKERLEK" dotColor="#EF4444" />
    <ViralHeadline line1="TEKERLEK BİLEREK" line2="SOLA ÇEKER!" color2="#FCA5A5" y={165} />
    <InsertCard
      badge="GİZLİ TASARIM"
      title="Sağ El Serbest Kalır"
      metric="SOLA EĞİM ↺"
      sub="Raflara daha uzun bakman için!"
      icon="⚙️"
      accent="#F87171"
      y={395}
      at={wAt(4, "sola") - 0.15}
    />
    <div style={{ filter: rimGlow }}>
      <Arda id="arda4" x={540} y={1295} size={390} shot="closeup" face="shock" armL={115} armR={115} enterAt={0.08} />
    </div>
    <SweatDrops x={540} y={960} at={wAt(4, "sola")} />
  </AbsoluteFill>
);

/* Beat 6 — SEAMLESS LOOP (Split-Screen): Üst–Alt İkilem */
const S5: React.FC<{ dur: number }> = ({ dur }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1E3A8A 0%, #0F172A 65%, #020617 100%)" }}>
    <RealPhotoBg src="dijitaliz-market/img/cart.jpg" duration={dur} opacity={0.32} />
    <ChapterHud sub="SENİN SEÇİMİN?" dotColor="#FACC15" />
    <ViralHeadline line1="HANGİSİNİ" line2="SEÇERSİN?" y={165} />
    <SplitScreen
      topLabel="DEV MARKET ARABASI"
      topValue="TUZAĞA DÜŞME 🛒"
      topBg="linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)"
      bottomLabel="KÜÇÜK EL SEPETİ"
      bottomValue="KONTROL SENDE 🧺"
      bottomBg="linear-gradient(135deg, #065F46 0%, #022C22 100%)"
      at={0.08}
    />
    <MiniBot id="mb5" x={840} y={1140} size={120} color="#FACC15" face="happy" enterAt={0.15} />
    <div style={{ filter: rimGlow }}>
      <Arda id="arda5" x={540} y={1315} size={310} shot="wide" face="wink" armL={130} armR={130} enterAt={0.08} />
    </div>
  </AbsoluteFill>
);

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.05, "pop_bubble-alert", 0.45],
  [0, wAt(0, "sebebi"), "pop_hard", 0.45],
  [1, 0.1, "pop_message", 0.45],
  [2, wAt(2, "yüzde"), "pop_bubble-alert", 0.45],
  [3, wAt(3, "kırk"), "ding_correct-reward", 0.45],
  [4, wAt(4, "sola"), "fail_wrong-answer", 0.4],
  [5, 0.1, "pop_message", 0.45],
  [5, wAt(5, "yoruma"), "ding_correct-answer", 0.42],
];

export const DijitalizMarket: React.FC = () => {
  const list = hits();
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const s3 = Math.round(sceneStart(3) * FPS);
  const s4 = Math.round(sceneStart(4) * FPS);
  const s5 = Math.round(sceneStart(5) * FPS);
  const end = Math.round(sceneEnd(5) * FPS);

  return (
    <AbsoluteFill style={{ background: "#020617" }}>
      <Sequence name="Hook" from={s0} durationInFrames={s1 - s0}>
        <SceneWrap immediate>
          <S0 dur={s1 - s0} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s1 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Setup" from={s1} durationInFrames={s2 - s1}>
        <SceneWrap>
          <S1 />
        </SceneWrap>
      </Sequence>
      <Sequence from={s2 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Quiz" from={s2} durationInFrames={s3 - s2}>
        <SceneWrap>
          <S2 />
        </SceneWrap>
      </Sequence>
      <Sequence from={s3 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Reveal" from={s3} durationInFrames={s4 - s3}>
        <SceneWrap>
          <S3 dur={s4 - s3} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s4 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Twist" from={s4} durationInFrames={s5 - s4}>
        <SceneWrap>
          <S4 />
        </SceneWrap>
      </Sequence>
      <Sequence from={s5 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Loop" from={s5} durationInFrames={end - s5}>
        <SceneWrap>
          <S5 dur={end - s5} />
        </SceneWrap>
      </Sequence>

      {[s1, s2, s3, s4, s5].map((st, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, st - 5)}>
          <Sfx name="whoosh_short-sweep" volume={0.32} />
        </Sequence>
      ))}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      <BgMusic words={words} />
      <Audio src={staticFile("dijitaliz-market/voice.mp3")} volume={0.95} />
      <FloatingParticles />
      <PaperGrain />
      <ViralCaptions words={words} y={1490} highlight={["dolar", "iraden", "küçüktü", "yüzde", "kırk", "zorlanıyor", "sola", "yoruma"]} />
    </AbsoluteFill>
  );
};
