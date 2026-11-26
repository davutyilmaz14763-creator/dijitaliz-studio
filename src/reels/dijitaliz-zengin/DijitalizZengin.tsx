import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Flash } from "../components";
import { Sfx } from "../sfx";
import {
  Arda,
  Bit,
  Bubble,
  Card,
  CizgiComparisonCard,
  CizgiStatBar,
  Elif,
  K,
  PaperGrain,
  Room,
  slab,
  sans,
  Sunburst,
  TagCaptions,
  TapeLabel,
  usePopAt,
  VWord,
} from "../cizgi/kit";
import voice from "./voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const DIJITALIZ_ZENGIN_FRAMES = Math.ceil((voice.duration + 0.7) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? DIJITALIZ_ZENGIN_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePopAt(0, 15, 200);
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.06, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

const PhotoBackdrop: React.FC<{ src: string; duration: number; opacity?: number }> = ({ src, duration, opacity = 0.48 }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, duration], [1.0, 1.15]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", scale: String(s), opacity }} />
    </AbsoluteFill>
  );
};

/* Sahne 0: Gerçek Uçak Penceresi Fotoğrafı + Arda */
const S0: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const round = frame / FPS >= wAt(0, "yuvarlak");
  return (
    <Room wall={K.wall.navy} pattern="none">
      <PhotoBackdrop src="dijitaliz-zengin/img/window.jpg" duration={dur} opacity={0.55} />
      <TapeLabel text="NEDEN HEP YUVARLAK?" />
      <Bubble x={110} y={375} at={wAt(0, "köşeli")}>
        Kare değil, yuvarlak! ✈️
      </Bubble>
      <Arda id="arda0" x={540} y={1185} size={420} face={round ? "shock" : "normal"} armL={round ? 130 : 15} armR={round ? 130 : 15} enterAt={0.1} />
    </Room>
  );
};

/* Sahne 1: 1950'ler Tarihi Jet Fotoğrafı + Elif + Basınç Barı */
const S1: React.FC<{ dur: number }> = ({ dur }) => (
  <Room wall={K.wall.beige} pattern="none">
    <PhotoBackdrop src="dijitaliz-zengin/img/comet.jpg" duration={dur} opacity={0.35} />
    <TapeLabel text="1950'LER · KARE PENCERE" />
    <CizgiStatBar y={360} at={wAt(1, "üç") - 0.3} label="Köşede Biriken Basınç" percent={100} targetValue={3} suffix=" KAT" barColor={K.red} />
    <Elif id="elif1" x={540} y={1185} size={400} face="shock" armL={130} armR={130} enterAt={0.1} />
  </Room>
);

/* Sahne 2: Sunburst + Bit + Mühendislik Çözümü Kartı */
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const happy = frame / FPS >= wAt(2, "yuvarlayınca");
  return (
    <Room wall={K.wall.sky} pattern="none">
      <Sunburst a="#8EB2CC" b="#9FBFD6" cy={700} />
      <TapeLabel text="MÜHENDİSLİK ÇÖZÜMÜ" />
      <Card x={120} y={365} w={840} at={wAt(2, "çatlamaya") - 0.1} rot={-2} from="left">
        <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ fontSize: 78 }}>{happy ? "🟢" : "💥"}</div>
          <div>
            <div style={{ fontFamily: slab, fontSize: 38, fontWeight: 800 }}>
              {happy ? "Yuvarlak Köşe = Eşit Basınç" : "Kare Köşe = Metal Yorgunluğu"}
            </div>
            <div style={{ fontFamily: sans, fontSize: 27, fontWeight: 700, color: happy ? K.green : K.red }}>
              {happy ? "Çatlama riski biter!" : "Köşelerden çatlama başlar!"}
            </div>
          </div>
        </div>
      </Card>
      <Bit id="bit2" x={540} y={1185} size={400} face={happy ? "happy" : "shock"} armL={130} armR={130} enterAt={0.1} />
    </Room>
  );
};

/* Sahne 3: Arda + Elif + Karşılaştırma + Yorum Kapanışı */
const S3: React.FC = () => (
  <Room wall={K.wall.mint} pattern="dots">
    <TapeLabel text="SEN HANGİSİNİ SEÇERSİN?" />
    <CizgiComparisonCard
      y={355}
      at={0.15}
      title="PENCERE TASARIMI"
      leftLabel="Kare Pencere"
      leftValue="RİSKLİ ✕"
      rightLabel="Yuvarlak"
      rightValue="GÜVENLİ ✓"
      leftColor={K.red}
      rightColor={K.green}
      badge="Cam kenarı mı, koridor mu? Yoruma yaz! 👇"
    />
    <Arda id="arda3" x={370} y={1185} size={405} face="wink" armL={135} armR={135} enterAt={0.1} />
    <Elif id="elif3" x={740} y={1185} size={380} face="happy" armL={120} armR={120} enterAt={0.2} />
  </Room>
);

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.1, "pop_bubble-alert", 0.45],
  [0, wAt(0, "köşeli"), "pop_message", 0.45],
  [1, wAt(1, "kareydi"), "pop_hard", 0.45],
  [1, wAt(1, "üç"), "impact_drum-deep", 0.45, 1.0],
  [2, wAt(2, "çatlamaya"), "fail_wrong-answer", 0.4],
  [2, wAt(2, "yuvarlayınca"), "ding_correct-answer", 0.45],
  [3, 0.15, "pop_message", 0.45],
  [3, wAt(3, "yoruma"), "ding_correct-reward", 0.45],
];

export const DijitalizZengin: React.FC = () => {
  const list = hits();
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const s3 = Math.round(sceneStart(3) * FPS);
  const end = Math.round(sceneEnd(3) * FPS);

  return (
    <AbsoluteFill style={{ background: K.paper }}>
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
          <S1 dur={s2 - s1} />
        </SceneWrap>
      </Sequence>
      <Sequence from={s2 - 4} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Sahne 3" from={s2} durationInFrames={s3 - s2}>
        <SceneWrap>
          <S2 />
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
      <Audio src={staticFile("dijitaliz-zengin/voice.mp3")} volume={0.95} />
      <PaperGrain />
      <TagCaptions words={words} />
    </AbsoluteFill>
  );
};
