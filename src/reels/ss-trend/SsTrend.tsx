import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../sfx";
import {
  Bit,
  Bubble,
  Card,
  Cep,
  CizgiComparisonCard,
  CizgiStatBar,
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
export const SS_TREND_FRAMES = Math.ceil((voice.duration + 0.7) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? SS_TREND_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePopAt(0, 15, 200);
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.06, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

const S0: React.FC = () => {
  const frame = useCurrentFrame();
  const shock = frame / FPS >= wAt(0, "kredi");
  return (
    <Room wall={K.wall.mustard} pattern="stripes">
      <TapeLabel text="YAPAY ZEKA + KARTIN?" />
      <Card x={130} y={370} w={820} at={wAt(0, "kredi") - 0.05} rot={-2} from="left">
        <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ fontSize: 80 }}>💳</div>
          <div>
            <div style={{ fontFamily: slab, fontSize: 40, fontWeight: 800, color: K.ink }}>Otomatik Alışveriş?</div>
            <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 700, color: K.orange }}>Onay verilsin mi?</div>
          </div>
        </div>
      </Card>
      <Bit id="bit0" x={360} y={1185} size={440} face={shock ? "shock" : "normal"} armL={shock ? 140 : 15} armR={shock ? 140 : 15} enterAt={0.1} />
      <Cep id="cep0" x={800} y={1185} size={280} face="side" enterAt={0.25} />
    </Room>
  );
};

const S1: React.FC = () => (
  <Room wall={K.wall.navy} pattern="stars">
    <TapeLabel text="YENİ KİŞİSEL AJANLAR" />
    <Bubble x={110} y={365} at={0.2}>
      Sipariş verildi 📦
    </Bubble>
    <Stamp x={410} y={485} at={wAt(1, "dur")} color={K.red} rot={-6} size={96}>
      AMA DUR!
    </Stamp>
    <Bit id="bit1" x={540} y={1185} size={410} face="angry" armL={120} armR={120} />
  </Room>
);

const S2: React.FC = () => (
  <Room wall={K.wall.beige} pattern="stripes">
    <TapeLabel text="SHELLBENCH TEST SONUCU" />
    <CizgiStatBar y={375} at={0.15} label="Günlük Görev Hata Oranı" percent={33} barColor={K.red} />
    <Bit id="bit2" x={540} y={1185} size={410} face="shock" armL={135} armR={135} />
  </Room>
);

const S3: React.FC = () => (
  <Room wall={K.wall.mint} pattern="dots">
    <TapeLabel text="KONTROL KİMDE?" />
    <CizgiComparisonCard
      y={360}
      at={0.1}
      title="GÜVENİLİRLİK KARŞILAŞTIRMASI"
      leftLabel="Senin Kontrolün"
      leftValue="%99"
      rightLabel="Tek Başına AI"
      rightValue="%67"
      badge="Şimdilik kartını kendin sakla 🔐"
    />
    <Bit id="bit3" x={380} y={1185} size={410} face="wink" armL={140} armR={140} />
    <Cep id="cep3" x={760} y={1185} size={270} face="happy" enterAt={0.15} />
  </Room>
);

const SCENES = [S0, S1, S2, S3];

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.1, "pop_bubble-alert", 0.45],
  [0, wAt(0, "kredi"), "pop_message", 0.5],
  [1, 0.2, "pop_hard", 0.45],
  [1, wAt(1, "dur"), "fail_wrong-answer", 0.5],
  [2, 0.2, "impact_drum-deep", 0.45, 1.0],
  [3, 0.15, "pop_message", 0.45],
  [3, wAt(3, "kart"), "ding_correct-reward", 0.45],
];

export const SsTrend: React.FC = () => {
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
      <Audio src={staticFile("ss-trend/voice.mp3")} volume={0.95} />
      <PaperGrain />
      <TagCaptions words={words} />
    </AbsoluteFill>
  );
};
