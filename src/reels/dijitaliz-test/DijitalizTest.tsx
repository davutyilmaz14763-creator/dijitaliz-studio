import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../sfx";
import {
  Arda,
  Bit,
  Bubble,
  Card,
  Cep,
  CizgiComparisonCard,
  CizgiStatBar,
  Elif,
  K,
  PaperGrain,
  Room,
  slab,
  sans,
  Stamp,
  TagCaptions,
  TapeLabel,
  usePopAt,
  VWord,
} from "../cizgi/kit";
import voice from "./voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const DIJITALIZ_TEST_FRAMES = Math.ceil((voice.duration + 0.7) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_TEST_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePopAt(0, 15, 200);
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.06, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

/* Sahne 0: Arda + Cep — Kanca */
const S0: React.FC = () => {
  const frame = useCurrentFrame();
  const shock = frame / FPS >= wAt(0, "bağlandığın");
  return (
    <Room wall={K.wall.navy} pattern="stars">
      <TapeLabel text="ÜCRETSİZ WI-FI TUZAĞI?" />
      <Card x={120} y={365} w={840} at={wAt(0, "ücretsiz") - 0.05} rot={-2} from="left">
        <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ fontSize: 80 }}>📶</div>
          <div>
            <div style={{ fontFamily: slab, fontSize: 38, fontWeight: 800 }}>Kafe_Ucretsiz_WiFi</div>
            <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 700, color: K.orange }}>Şifresiz Bağlantı · Dikkat!</div>
          </div>
        </div>
      </Card>
      <Arda id="arda0" x={380} y={1185} size={430} face={shock ? "shock" : "normal"} armL={shock ? 135 : 15} armR={shock ? 135 : 15} enterAt={0.1} />
      <Cep id="cep0" x={790} y={1185} size={280} face="side" enterAt={0.25} />
    </Room>
  );
};

/* Sahne 1: Elif + CizgiStatBar */
const S1: React.FC = () => (
  <Room wall={K.wall.beige} pattern="stripes">
    <TapeLabel text="TRAFİĞİN İZLENEBİLİR!" />
    <CizgiStatBar y={365} at={wAt(1, "yüzde") - 0.3} label="Açık Ağlarda Risk Oranı" percent={68} barColor={K.red} />
    <Bubble x={120} y={620} at={wAt(1, "şifresiz")}>
      Veriler açıkta! 🔓
    </Bubble>
    <Elif id="elif1" x={660} y={1185} size={410} face="shock" armL={130} armR={130} enterAt={0.1} />
  </Room>
);

/* Sahne 2: Arda + Bit + CizgiComparisonCard */
const S2: React.FC = () => (
  <Room wall={K.wall.mint} pattern="dots">
    <TapeLabel text="NE YAPMALISIN?" />
    <CizgiComparisonCard
      y={355}
      at={0.15}
      title="HANGİ BAĞLANTI GÜVENLİ?"
      leftLabel="Mobil Veri (4G/5G)"
      leftValue="GÜVENLİ ✓"
      rightLabel="Açık Wi-Fi"
      rightValue="RİSKLİ ✕"
      badge="Bankacılık için mobil veriye geç!"
    />
    <Arda id="arda2" x={360} y={1185} size={410} face="happy" armL={120} armR={20} enterAt={0.1} />
    <Bit id="bit2" x={770} y={1185} size={350} face="happy" armL={20} armR={120} enterAt={0.2} />
  </Room>
);

/* Sahne 3: Arda + Elif — Kapanış */
const S3: React.FC = () => (
  <Room wall={K.wall.mustard} pattern="stars">
    <TapeLabel text="DİJİTALİZ SORUYOR!" />
    <Stamp x={200} y={400} at={wAt(3, "itiraf")} color={K.navy} rot={-4} size={82}>
      YORUMDA İTİRAF ET 👇
    </Stamp>
    <Arda id="arda3" x={370} y={1185} size={420} face="wink" armL={140} armR={140} enterAt={0.1} />
    <Elif id="elif3" x={750} y={1185} size={390} face="happy" armL={125} armR={125} enterAt={0.2} />
  </Room>
);

const SCENES = [S0, S1, S2, S3];

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.1, "pop_bubble-alert", 0.45],
  [0, wAt(0, "ücretsiz"), "pop_message", 0.45],
  [0, wAt(0, "bağlandığın"), "impact_drum-deep", 0.4, 1.0],
  [1, wAt(1, "şifresiz"), "pop_hard", 0.45],
  [1, wAt(1, "riskli"), "fail_wrong-answer", 0.45],
  [2, 0.15, "pop_message", 0.45],
  [2, wAt(2, "mobil"), "ding_correct-answer", 0.45],
  [3, 0.1, "magic_sparkle-poof", 0.4],
  [3, wAt(3, "itiraf"), "ding_correct-reward", 0.45],
];

export const DijitalizTest: React.FC = () => {
  const list = hits();
  return (
    <AbsoluteFill style={{ background: K.paper }}>
      {SCENES.slice(0, N_SCENES).map((Sc, i) => {
        const a = Math.round(sceneStart(i) * FPS);
        const b = Math.round(sceneEnd(i) * FPS);
        return (
          <Sequence key={i} name={`Sahne ${i + 1}`} from={a} durationInFrames={b - a}>
            <SceneWrap>
              <Sc />
            </SceneWrap>
          </Sequence>
        );
      })}
      {new Array(N_SCENES - 1).fill(0).map((_, i) => (
        <Sequence key={`w${i}`} from={Math.round((sceneStart(i + 1) - 0.18) * FPS)}>
          <Sfx name="whoosh_short-sweep" volume={0.35} />
        </Sequence>
      ))}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      <Audio src={staticFile("dijitaliz-test/voice.mp3")} volume={0.95} />
      <PaperGrain />
      <TagCaptions words={words} />
    </AbsoluteFill>
  );
};
