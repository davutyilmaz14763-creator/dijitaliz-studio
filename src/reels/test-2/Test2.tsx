import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../sfx";
import { Bit, Bubble, Card, Cep, K, PaperGrain, Room, slab, Stamp, TagCaptions, TapeLabel, usePopAt, VWord } from "../cizgi/kit";
import voice from "./voice.json";

const FPS = 30;
const words = (voice.words as VWord[]).map((w) => (w.text === "Aydaki" ? { ...w, text: "Ay'daki" } : w));
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const TEST2_FRAMES = Math.ceil((voice.duration + 1.2) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.12));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? TEST2_FRAMES / FPS : sceneStart(i + 1));

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
  const shock = frame / FPS >= wAt(0, "milyonlarca");
  return (
    <Room wall={K.wall.navy} pattern="stars">
      <TapeLabel text="AY'DAKİ AYAK İZLERİ" />
      <Bubble x={110} y={360} at={wAt(0, "astronot")}>
        Astronot 👨‍🚀
      </Bubble>
      <Stamp x={180} y={515} at={wAt(0, "milyonlarca")} color={K.mustard} rot={-5} size={78}>
        MİLYONLARCA YIL
      </Stamp>
      <Bit id="bit0" x={360} y={1185} size={460} face={shock ? "shock" : "normal"} armL={shock ? 140 : 15} armR={shock ? 140 : 15} enterAt={0.1} />
      <Cep id="cep0" x={800} y={1185} size={280} face="side" enterAt={0.3} />
    </Room>
  );
};

const S1: React.FC = () => {
  const yilAt = wAt(1, "1969");
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const happy = t >= yilAt;
  const cardOut = interpolate(t, [yilAt - 0.25, yilAt - 0.05], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Room wall={K.wall.beige} pattern="stripes">
      <TapeLabel text="RÜZGAR VE YAĞMUR YOK" />
      {cardOut > 0 && (
        <div style={{ opacity: cardOut, scale: String(interpolate(cardOut, [0, 1], [0.92, 1])) }}>
          <Card x={160} y={400} w={760} at={wAt(1, "rüzgar") - 0.1} rot={2} from="right">
            <div style={{ padding: "24px 30px", textAlign: "center" }}>
              <div style={{ fontSize: 96, marginBottom: 8 }}>🌕 💨❌ 🌧️❌</div>
              <div style={{ fontFamily: slab, fontSize: 44, fontWeight: 800, color: K.ink }}>Atmosfer yok = İzler silinmez</div>
            </div>
          </Card>
        </div>
      )}
      <Stamp x={210} y={460} at={yilAt} color={K.orange} rot={-6} size={96}>
        1969'DAN BERİ
      </Stamp>
      <Bit id="bit1" x={540} y={1185} size={410} face={happy ? "happy" : "side"} armL={25} armR={130} />
    </Room>
  );
};

const S2: React.FC = () => (
  <Room wall={K.wall.mustard} pattern="stars">
    <TapeLabel text="UZAYDA BİLE KALICI" />
    <Stamp x={290} y={520} at={wAt(2, "kalıcı")} color={K.green} rot={-5} size={104}>
      KALICI İZ ✓
    </Stamp>
    <Bit id="bit2" x={380} y={1185} size={440} face="happy" armL={145} armR={145} enterAt={0.1} />
    <Cep id="cep2" x={740} y={1185} size={290} face="happy" armL={120} armR={120} enterAt={0.2} />
  </Room>
);

const SCENES = [S0, S1, S2];

type Hit = [number, number, string, number, number?];
const hits = (): Hit[] => [
  [0, 0.1, "pop_bubble-alert", 0.4],
  [0, wAt(0, "astronot"), "pop_message", 0.4],
  [0, wAt(0, "milyonlarca"), "impact_drum-deep", 0.4, 1.1],
  [1, wAt(1, "rüzgar"), "pop_hard", 0.45],
  [1, wAt(1, "1969"), "ding_reveal", 0.45],
  [2, 0.1, "magic_sparkle-poof", 0.35],
  [2, wAt(2, "kalıcı"), "ding_correct-reward", 0.45],
];

export const Test2: React.FC = () => {
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
          <Sfx name="whoosh_short-sweep" volume={0.3} />
        </Sequence>
      ))}
      {list.map(([s, t, name, vol, max], i) => (
        <Sequence key={i} name={`sfx: ${name}`} from={Math.max(0, Math.round((sceneStart(s) + t) * FPS))} durationInFrames={max ? Math.round(max * FPS) : undefined}>
          <Sfx name={name} volume={vol} />
        </Sequence>
      ))}
      {!voice.fake && <Audio src={staticFile("test-2/voice.mp3")} volume={0.95} />}
      <PaperGrain />
      <TagCaptions words={words} />
    </AbsoluteFill>
  );
};
