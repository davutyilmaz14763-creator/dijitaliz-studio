import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../sfx";
import { Bit, Bubble, Card, K, PaperGrain, Room, slab, Stamp, TagCaptions, TapeLabel, usePopAt, VWord } from "../cizgi/kit";
import voice from "./voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const HIZLI_TEST_FRAMES = Math.ceil((voice.duration + 1.2) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? HIZLI_TEST_FRAMES / FPS : sceneStart(i + 1));

const wAt = (s: number, m: string) => {
  const w = words.find((x) => x.scene === s && x.text.toLocaleLowerCase("tr").startsWith(m.toLocaleLowerCase("tr")));
  if (!w) throw new Error(`kelime yok: ${s}/${m}`);
  return w.start - sceneStart(s);
};

const SceneWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const p = usePopAt(0, 14, 220);
  return <AbsoluteFill style={{ scale: String(interpolate(p, [0, 1], [1.08, 1])), opacity: Math.min(1, p * 3) }}>{children}</AbsoluteFill>;
};

const S0: React.FC = () => {
  const frame = useCurrentFrame();
  const shock = frame / FPS >= wAt(0, "bug");
  return (
    <Room wall={K.wall.mustard} pattern="stripes">
      <TapeLabel text="NEDEN 'BUG' DENİR?" />
      <Bubble x={170} y={530} at={wAt(0, "bug")}>
        Bug 🪲?
      </Bubble>
      <Bit id="bit0" x={540} y={1185} size={460} face={shock ? "shock" : "normal"} armL={shock ? 140 : 15} armR={shock ? 140 : 15} enterAt={0.1} />
    </Room>
  );
};

const S1: React.FC = () => {
  const guveAt = wAt(1, "güve");
  const frame = useCurrentFrame();
  const shock = frame / FPS >= guveAt;
  return (
    <Room wall={K.wall.navy} pattern="stars">
      <TapeLabel text="1947 · HARVARD MARK II" />
      <Card x={160} y={420} w={760} at={0.2} rot={-2} from="left">
        <div style={{ padding: "24px 30px", textAlign: "center" }}>
          <div style={{ fontSize: 100, marginBottom: 8 }}>🖥️ ⚡ 🦋</div>
          <div style={{ fontFamily: slab, fontSize: 44, fontWeight: 800, color: K.ink }}>Röleye sıkışan gerçek güve!</div>
        </div>
      </Card>
      <Stamp x={310} y={760} at={guveAt} color={K.orange} rot={-7} size={96}>
        GERÇEK GÜVE
      </Stamp>
      <Bit id="bit1" x={540} y={1185} size={400} face={shock ? "shock" : "side"} armL={20} armR={120} />
    </Room>
  );
};

const S2: React.FC = () => (
  <Room wall={K.wall.beige} pattern="stripes">
    <TapeLabel text="İLK BİLGİSAYAR HATASI" />
    <Stamp x={280} y={520} at={wAt(2, "bug")} color={K.green} rot={-5} size={108}>
      BUG = BÖCEK
    </Stamp>
    <Bit id="bit2" x={540} y={1185} size={440} face="happy" armL={145} armR={145} enterAt={0.1} />
  </Room>
);

const SCENES = [S0, S1, S2];

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.1, "pop_bubble-alert", 0.45],
  [0, wAt(0, "bug"), "pop_hard", 0.5],
  [1, 0.2, "pop_message", 0.45],
  [1, wAt(1, "güve"), "impact_drum-deep", 0.45, 1.1],
  [2, 0.1, "magic_sparkle-poof", 0.4],
  [2, wAt(2, "bug"), "ding_correct-reward", 0.45],
];

export const HizliTest: React.FC = () => {
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
        <Sequence key={`w${i}`} name="sfx: geçiş" from={Math.round((sceneStart(i + 1) - 0.18) * FPS)}>
          <Sfx name="whoosh_short-sweep" volume={0.35} />
        </Sequence>
      ))}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} name={`sfx: ${name}`} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      {!voice.fake && <Audio src={staticFile("hizli-test/voice.mp3")} volume={0.85} />}
      <PaperGrain />
      <TagCaptions words={words} />
    </AbsoluteFill>
  );
};
