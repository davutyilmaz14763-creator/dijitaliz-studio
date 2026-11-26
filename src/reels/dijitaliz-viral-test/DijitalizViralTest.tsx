import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash } from "../components";
import { Sfx } from "../sfx";
import {
  Arda,
  ChapterHud,
  CizgiComparisonCard,
  CizgiStatBar,
  K,
  MiniBot,
  PaperGrain,
  RealPhotoBg,
  rimGlow,
  SpeedLines,
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
export const DIJITALIZ_VIRAL_TEST_FRAMES = Math.ceil((voice.duration + 0.7) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_VIRAL_TEST_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePopAt(0, 15, 210);
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.08, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

/* Sahne 0: Gerçek Şarj Fotoğrafı + Gece Atmosferi + Hız Çizgileri + Arda & MiniBot */
const S0: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shock = frame / FPS >= wAt(0, "saatlerce");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #1E3A8A 0%, #0F172A 58%, #020617 100%)" }}>
      <RealPhotoBg src="dijitaliz-viral-test/img/phone.jpg" duration={dur} opacity={0.44} />
      <SpeedLines opacity={0.25} />
      <ChapterHud sub="TEKNOLOJİ · BATARYA" />
      <ViralHeadline line1="ŞARJIN %1'DE" line2="NEDEN BİTMEZ?" y={175} />
      <MiniBot id="mb0" x={265} y={920} size={130} face={shock ? "shock" : "normal"} enterAt={0.2} />
      <div style={{ filter: rimGlow }}>
        <Arda id="arda0" x={580} y={1240} size={440} face={shock ? "shock" : "normal"} armL={shock ? 125 : 15} armR={shock ? 125 : 15} enterAt={0.08} />
      </div>
      <SweatDrops x={580} y={800} at={wAt(0, "saatlerce")} />
    </AbsoluteFill>
  );
};

/* Sahne 1: Sıcak Terracotta-Altın 2D Sahne + Arda + MiniBot + Gizli Rezerv */
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const warn = frame / FPS >= wAt(1, "korumaya");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #9A3412 0%, #431407 65%, #1C0A00 100%)" }}>
      <Sunburst a="rgba(251,146,60,0.14)" b="rgba(254,215,170,0.05)" cy={820} />
      <ChapterHud sub="SİSTEM · GİZLİ REZERV" />
      <ViralHeadline line1="PİLİN ASLINDA" line2="BİTMEMİŞTİR!" color2="#FDE047" y={170} />
      <CizgiStatBar y={415} at={wAt(1, "kandırıp") - 0.15} label="Gizli Koruma Rezervi" percent={15} suffix="%" barColor="#F59E0B" />
      <MiniBot id="mb1" x={790} y={945} size={125} color="#FACC15" face={warn ? "happy" : "normal"} enterAt={0.2} />
      <div style={{ filter: rimGlow }}>
        <Arda id="arda1" x={510} y={1250} size={420} face={warn ? "wink" : "normal"} armL={25} armR={warn ? 120 : 25} enterAt={0.1} />
      </div>
    </AbsoluteFill>
  );
};

/* Sahne 2: Gerçek Lityum Pil Fotoğrafı + Kırmızı-Koyu Kimyasal Risk + Arda + MiniBot */
const S2: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const safe = frame / FPS >= wAt(2, "gizli");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #7F1D1D 0%, #1E1B4B 65%, #090D16 100%)" }}>
      <RealPhotoBg src="dijitaliz-viral-test/img/battery.jpg" duration={dur} opacity={0.42} tint="rgba(30, 27, 75, 0.58)" />
      <SpeedLines opacity={0.28} />
      <ChapterHud sub="LİTYUM · KİMYASAL RİSK" dotColor="#EF4444" />
      <ViralHeadline line1="SIFIRA İNERSE" line2="PİL ÖLÜR!" color2="#FCA5A5" y={170} />
      <CizgiComparisonCard
        y={400}
        at={0.15}
        title="BATARYA GERÇEĞİ"
        leftLabel="Gerçek %0"
        leftValue="ÖLÜM RİSKİ ✕"
        rightLabel="Görünen %1"
        rightValue="YEDEK GÜÇ ✓"
        leftColor={K.red}
        rightColor={K.green}
      />
      <MiniBot id="mb2" x={250} y={960} size={125} color="#F87171" face={safe ? "happy" : "shock"} enterAt={0.15} />
      <div style={{ filter: rimGlow }}>
        <Arda id="arda2" x={570} y={1250} size={420} face={safe ? "happy" : "shock"} armL={120} armR={120} enterAt={0.1} />
      </div>
      {!safe && <SweatDrops x={570} y={820} at={wAt(2, "ölür") - 0.1} />}
    </AbsoluteFill>
  );
};

/* Sahne 3: Kapanış — Arda + İki Küçük Yardımcı Robot Kafa */
const S3: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #065F46 0%, #0F172A 70%, #020617 100%)" }}>
    <Sunburst a="rgba(52,211,153,0.14)" b="rgba(167,243,208,0.05)" cy={780} />
    <ChapterHud sub="SONUÇ · SENİN REKORUN?" dotColor="#4ADE80" />
    <ViralHeadline line1="EN UZUN %1" line2="KAÇ DAKİKA?" color2="#4ADE80" y={180} />
    <MiniBot id="mb3a" x={240} y={960} size={130} color="#4ADE80" face="happy" enterAt={0.15} />
    <MiniBot id="mb3b" x={840} y={960} size={130} color="#38BDF8" face="happy" enterAt={0.22} />
    <div style={{ filter: rimGlow }}>
      <Arda id="arda3" x={540} y={1250} size={450} face="wink" armL={135} armR={135} enterAt={0.08} />
    </div>
  </AbsoluteFill>
);

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.08, "pop_bubble-alert", 0.45],
  [0, wAt(0, "saatlerce"), "pop_hard", 0.45],
  [1, wAt(1, "kandırıp"), "pop_message", 0.45],
  [1, wAt(1, "korumaya"), "ding_correct-answer", 0.42],
  [2, wAt(2, "ölür"), "fail_wrong-answer", 0.4],
  [2, wAt(2, "gizli"), "ding_correct-reward", 0.45],
  [3, wAt(3, "son"), "pop_message", 0.45],
  [3, wAt(3, "yoruma"), "ding_correct-reward", 0.45],
];

export const DijitalizViralTest: React.FC = () => {
  const list = hits();
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const s3 = Math.round(sceneStart(3) * FPS);
  const end = Math.round(sceneEnd(3) * FPS);

  return (
    <AbsoluteFill style={{ background: "#020617" }}>
      <Sequence name="Sahne 1" from={s0} durationInFrames={s1 - s0}>
        <SceneWrap>
          <S0 dur={s1 - s0} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s1 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Sahne 2" from={s1} durationInFrames={s2 - s1}>
        <SceneWrap>
          <S1 />
        </SceneWrap>
      </Sequence>
      <Sequence from={s2 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Sahne 3" from={s2} durationInFrames={s3 - s2}>
        <SceneWrap>
          <S2 dur={s3 - s2} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s3 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Sahne 4" from={s3} durationInFrames={end - s3}>
        <SceneWrap>
          <S3 />
        </SceneWrap>
      </Sequence>

      {[s1, s2, s3].map((st, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, st - 5)}>
          <Sfx name="whoosh_short-sweep" volume={0.35} />
        </Sequence>
      ))}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("dijitaliz-viral-test/voice.mp3")} volume={0.95} />
      <PaperGrain />
      <ViralCaptions words={words} highlight={["yüzde", "birde", "kandırıp", "korumaya", "ölür", "gizli", "şans", "yoruma"]} />
    </AbsoluteFill>
  );
};
