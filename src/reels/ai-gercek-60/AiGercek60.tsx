import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../sfx";
import {
  Bit,
  Bubble,
  Card,
  Cep,
  CizgiComparisonCard,
  CizgiStatBar,
  Clock,
  K,
  PaperGrain,
  Room,
  slab,
  sans,
  Stamp,
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
export const AI_GERCEK_60_FRAMES = Math.ceil((voice.duration + 0.7) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? AI_GERCEK_60_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePopAt(0, 15, 200);
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.06, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

const Magnifier: React.FC = () => (
  <g stroke={K.ink} strokeWidth={5}>
    <line x1={0} y1={0} x2={22} y2={-40} strokeWidth={10} strokeLinecap="round" />
    <circle cx={36} cy={-70} r={34} fill="#CFEFFF" />
    <path d="M22 -84 Q30 -94 44 -92" stroke="#FFFFFF" fill="none" strokeLinecap="round" />
  </g>
);

const AudioWaveCard: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [0.45, 0.9, 0.65, 1.0, 0.5, 0.85, 0.7, 0.95, 0.55, 0.8];
  return (
    <Card x={120} y={360} w={840} at={at} rot={1.5} from="pop">
      <div style={{ padding: "24px 30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontFamily: slab, fontSize: 32, fontWeight: 800 }}>🎙️ Sentetik Ses Analizi</span>
          <span style={{ fontFamily: sans, fontSize: 24, fontWeight: 800, color: K.red }}>TEK DÜZE TON</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 90, gap: 10 }}>
          {bars.map((h, i) => {
            const wave = 0.45 + 0.55 * Math.abs(Math.sin((frame / fps) * 6 + i * 0.8));
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.round(h * wave * 100)}%`,
                  background: i % 2 === 0 ? K.orange : K.navy,
                  borderRadius: 10,
                  border: `3px solid ${K.ink}`,
                }}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
};

/* Sahne 0: Kanca — Telefon ekranı + Cep (robot yok) */
const S0: React.FC = () => {
  const frame = useCurrentFrame();
  const ai = frame / FPS >= wAt(0, "yapay");
  return (
    <Room wall={K.wall.navy} pattern="stars">
      <TapeLabel text="BU VİDEO GERÇEK Mİ?" />
      <Card x={120} y={360} w={840} at={wAt(0, "sokak") - 0.1} rot={-2} from="left">
        <div style={{ padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: K.red }}>● CANLI RÖPORTAJ</div>
            <div style={{ fontFamily: slab, fontSize: 40, fontWeight: 800, marginTop: 6 }}>
              {ai ? "Tamamen Yapay Zeka!" : "Gerçek Sanıyorsan..."}
            </div>
          </div>
          <div style={{ fontSize: 84 }}>{ai ? "🤖" : "🎤"}</div>
        </div>
      </Card>
      <Bubble x={110} y={640} at={wAt(0, "yapay")}>
        Gerçek değilmiş! 😲
      </Bubble>
      <Cep id="cep0" x={660} y={1185} size={340} face={ai ? "shock" : "normal"} armL={130} armR={130} enterAt={0.15} />
    </Room>
  );
};

/* Sahne 1: İstatistik Barı + Patladı Damgası (robot yok) */
const S1: React.FC = () => (
  <Room wall={K.wall.mustard} pattern="stripes">
    <TapeLabel text="SOSYAL MEDYADA AI PATLAMASI" />
    <CizgiStatBar y={365} at={0.15} label="AI Video Üretim Artışı" percent={78} barColor={K.orange} />
    <Stamp x={280} y={620} at={wAt(1, "patladı")} color={K.red} rot={-6} size={92}>
      HER YERDE!
    </Stamp>
    <Card x={180} y={840} w={720} at={wAt(1, "fotoğraftan")} rot={1.5} from="up">
      <div style={{ padding: "18px 26px", textAlign: "center", fontFamily: slab, fontSize: 34, fontWeight: 800 }}>
        🖼️ Tek fotoğraftan konuşan insan!
      </div>
    </Card>
  </Room>
);

/* Sahne 2: 1. İpucu — Sunburst + Card + Büyüteçli Bit */
const S2: React.FC = () => (
  <Room wall={K.wall.beige} pattern="none">
    <Sunburst a="#DFD2B7" b="#CFC1A3" cy={680} />
    <TapeLabel text="1. İPUCU · DETAYLARA BAK" />
    <Card x={120} y={365} w={840} at={wAt(2, "ipucu")} rot={-1.5} from="right">
      <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ fontSize: 82 }}>✋🔤</div>
        <div>
          <div style={{ fontFamily: slab, fontSize: 38, fontWeight: 800 }}>Eller & Arka Yazılar</div>
          <div style={{ fontFamily: sans, fontSize: 28, fontWeight: 700, color: K.orange }}>Bozuk harf veya 6 parmak!</div>
        </div>
      </div>
    </Card>
    <Bit id="bit2" x={540} y={1185} size={410} face="side" armR={75} hold={<Magnifier />} />
  </Room>
);

/* Sahne 3: 2. İpucu — Ses Dalgası + Cep (robot yok) */
const S3: React.FC = () => (
  <Room wall={K.wall.purple} pattern="dots">
    <TapeLabel text="2. İPUCU · SES VE CİLT" />
    <AudioWaveCard at={wAt(3, "sese") - 0.1} />
    <Stamp x={250} y={660} at={wAt(3, "sentetiktir")} color={K.red} rot={-5} size={86}>
      SENTETİK!
    </Stamp>
    <Cep id="cep3" x={760} y={1185} size={310} face="side" armL={110} armR={110} enterAt={0.2} />
  </Room>
);

/* Sahne 4: 3. İpucu — Karşılaştırma Kartı + Saat (robot yok) */
const S4: React.FC = () => (
  <Room wall={K.wall.sky} pattern="stripes">
    <TapeLabel text="3. İPUCU · ETİKET TUZAĞI" />
    <Clock x={80} y={760} />
    <CizgiComparisonCard
      y={360}
      at={wAt(4, "etiketi") - 0.1}
      title="AI ETİKETİ KOYULUYOR MU?"
      leftLabel="Etiketli İçerik"
      leftValue="%45"
      rightLabel="Gizli AI"
      rightValue="%55"
      leftColor={K.green}
      rightColor={K.red}
      badge="Şoke edici videoya hemen inanma!"
    />
  </Room>
);

/* Sahne 5: Kapanış — Bit & Cep + Yoruma Çeken Soru */
const S5: React.FC = () => (
  <Room wall={K.wall.mint} pattern="stars">
    <TapeLabel text="SENİN TESTİN!" />
    <Stamp x={210} y={400} at={wAt(5, "yorumlara")} color={K.navy} rot={-4} size={86}>
      YORUMA YAZ 👇
    </Stamp>
    <Bit id="bit5" x={370} y={1185} size={420} face="wink" armL={145} armR={145} enterAt={0.1} />
    <Cep id="cep5" x={750} y={1185} size={280} face="happy" armL={120} armR={120} enterAt={0.2} />
  </Room>
);

const SCENES = [S0, S1, S2, S3, S4, S5];

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.1, "pop_bubble-alert", 0.45],
  [0, wAt(0, "sokak"), "pop_message", 0.45],
  [0, wAt(0, "yapay"), "impact_drum-deep", 0.45, 1.0],
  [1, 0.15, "pop_message", 0.45],
  [1, wAt(1, "patladı"), "pop_hard", 0.5],
  [1, wAt(1, "fotoğraftan"), "pop_bubble-alert", 0.45],
  [2, wAt(2, "ipucu"), "pop_message", 0.45],
  [2, wAt(2, "ellere"), "ui_cool-click", 0.45],
  [3, wAt(3, "sese"), "pop_cluster", 0.4],
  [3, wAt(3, "sentetiktir"), "fail_wrong-answer", 0.45],
  [4, wAt(4, "etiketi"), "pop_message", 0.45],
  [4, wAt(4, "inanma"), "ding_reveal", 0.45],
  [5, 0.1, "magic_sparkle-poof", 0.4],
  [5, wAt(5, "yorumlara"), "ding_correct-reward", 0.45],
];

export const AiGercek60: React.FC = () => {
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
      <Audio src={staticFile("ai-gercek-60/voice.mp3")} volume={0.95} />
      <PaperGrain />
      <TagCaptions words={words} />
    </AbsoluteFill>
  );
};
