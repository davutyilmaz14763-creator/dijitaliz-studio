import React, { useMemo } from "react";
import * as THREE from "three";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../sfx";
import { BgMusic, FloatingParticles, PaperGrain, ViralCaptions, VWord } from "../cizgi/kit";
import { Arda3D, ArdaPose, CameraRig, OutlineBox, TileFloor } from "../three/world";
import voice from "./voice.json";

const FPS = 30;
const words = voice.words as VWord[];
const N_SCENES = Math.max(...words.map((w) => w.scene)) + 1;
export const TEST_YONTEM1_FRAMES = Math.ceil((voice.duration + 0.5) * FPS);

const sceneStart = (i: number) => (i === 0 ? 0 : Math.max(0, words.find((w) => w.scene === i)!.start - 0.08));
const sceneEnd = (i: number) => (i === N_SCENES - 1 ? TEST_YONTEM1_FRAMES / FPS : sceneStart(i + 1));

const easeCubic = Easing.inOut(Easing.cubic);

/** Asansör Dijital Kat & Buton Paneli */
const ElevatorPanelTex = (label: string, bg: string, fg: string) => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#161616";
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 242);
  ctx.fillStyle = fg;
  ctx.font = "900 84px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 130);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Stilize 3D Asansör Dünyası */
const ElevatorWorld: React.FC<{ doorOpen: number; btnPressed: boolean; showWires: boolean }> = ({
  doorOpen,
  btnPressed,
  showWires,
}) => {
  const closeTex = useMemo(() => ElevatorPanelTex("►◄", btnPressed ? "#EF4444" : "#FACC15", "#161616"), [btnPressed]);
  const floorTex = useMemo(() => ElevatorPanelTex("04", "#0F172A", "#38BDF8"), []);

  return (
    <group>
      <ambientLight intensity={0.92} color="#FFF8EE" />
      <directionalLight position={[2, 6, 4]} intensity={1.15} color="#FFFBEB" castShadow />
      <pointLight position={[0, 3.2, 0]} intensity={1.6} color="#FEF9C3" distance={9} />

      <TileFloor width={8} depth={8} positionZ={0} />
      {/* Tavan & Işık */}
      <OutlineBox args={[4.6, 0.18, 4.6]} position={[0, 3.6, 0]} color="#FAF6F0" />
      <OutlineBox args={[2.2, 0.08, 1.4]} position={[0, 3.48, 0]} color="#FFFFFF" emissive="#FEF9C3" emissiveIntensity={0.9} />

      {/* Sıcak Ahşap Asansör Duvarları */}
      <OutlineBox args={[0.2, 3.6, 4.6]} position={[-2.2, 1.8, 0]} color="#C89F72" />
      <OutlineBox args={[0.2, 3.6, 4.6]} position={[2.2, 1.8, 0]} color="#C89F72" />
      <OutlineBox args={[4.6, 3.6, 0.2]} position={[0, 1.8, -2.2]} color="#D9B892" />
      {/* Arka Ayna */}
      <OutlineBox args={[2.6, 1.5, 0.08]} position={[0, 2.0, -2.06]} color="#BAE6FD" opacity={0.55} />

      {/* Ön Çelik Asansör Kapıları (z = 2.2) */}
      <OutlineBox args={[1.1, 3.1, 0.16]} position={[-0.56 - doorOpen, 1.55, 2.2]} color="#94A3B8" />
      <OutlineBox args={[1.1, 3.1, 0.16]} position={[0.56 + doorOpen, 1.55, 2.2]} color="#94A3B8" />
      <OutlineBox args={[4.6, 0.5, 0.2]} position={[0, 3.35, 2.2]} color="#475569" />

      {/* Sağ Duvar Asansör Kontrol Paneli */}
      <group position={[2.02, 1.35, 0.8]} rotation={[0, -Math.PI / 2, 0]}>
        <OutlineBox args={[0.7, 1.4, 0.12]} position={[0, 0, 0]} color="#E2E8F0" />
        <OutlineBox args={[0.42, 0.34, 0.06]} position={[0, 0.42, 0.06]} color="#0F172A" map={floorTex} />
        <OutlineBox args={[0.36, 0.36, 0.08]} position={[0, -0.15, 0.06]} color="#FACC15" map={closeTex} />
        {/* Sahne 3: Devre Dışı / Kopuk Kablo Gösterimi */}
        {showWires && (
          <group position={[0, -0.58, 0.1]}>
            <OutlineBox args={[0.52, 0.36, 0.06]} position={[0, 0, 0]} color="#1E293B" />
            <OutlineBox args={[0.18, 0.05, 0.06]} position={[-0.14, 0.05, 0.05]} color="#EF4444" rotation={[0, 0, 0.35]} />
            <OutlineBox args={[0.18, 0.05, 0.06]} position={[0.14, -0.05, 0.05]} color="#38BDF8" rotation={[0, 0, -0.35]} />
          </group>
        )}
      </group>
    </group>
  );
};

const ElevatorScene3D: React.FC<{ s0: number; s1: number; s2: number; end: number }> = ({ s0, s1, s2, end }) => {
  const frame = useCurrentFrame();

  let camPos: [number, number, number] = [-0.6, 1.65, 1.6];
  let camTarget: [number, number, number] = [0.6, 1.2, 0.3];
  let ardaPos: [number, number, number] = [0.35, 0, -0.4];
  let ardaPose: ArdaPose = "front";
  let ardaFace: "normal" | "shock" | "happy" | "wink" = "normal";
  let btnPressed = false;
  let showWires = false;

  if (frame < s1) {
    const p = interpolate(frame, [s0, s1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    camPos = [interpolate(p, [0, 1], [-0.9, -0.3]), 1.65, interpolate(p, [0, 1], [1.7, 1.2])];
    camTarget = [0.8, 1.25, 0.35];
    ardaPos = [0.45, 0, -0.25];
    btnPressed = p > 0.45;
    ardaFace = btnPressed ? "shock" : "normal";
  } else if (frame < s2) {
    const p = interpolate(frame, [s1, s2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    camPos = [interpolate(p, [0, 1], [-0.2, 0.4]), 1.55, interpolate(p, [0, 1], [1.4, 0.9])];
    camTarget = [1.3, 1.15, 0.6];
    ardaPos = [-0.15, 0, -0.5];
    ardaFace = "shock";
    showWires = true;
  } else {
    const p = interpolate(frame, [s2, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCubic });
    camPos = [0, 1.4, interpolate(p, [0, 1], [1.6, 1.1])];
    camTarget = [0, 1.25, -0.5];
    ardaPos = [0, 0, -0.5];
    ardaPose = "closeupShock";
    ardaFace = "shock";
    showWires = true;
  }

  return (
    <ThreeCanvas
      width={1080}
      height={1920}
      shadows
      gl={{ antialias: true }}
      camera={{ position: [-0.9, 1.65, 1.7], fov: 54, aspect: 1080 / 1920 }}
      style={{ width: 1080, height: 1920, filter: "contrast(1.05) saturate(1.10)" }}
    >
      <color attach="background" args={["#D9B892"]} />
      <fog attach="fog" args={["#D9B892", 6, 16]} />
      <CameraRig position={camPos} target={camTarget} fov={54} />
      <ElevatorWorld doorOpen={0.45} btnPressed={btnPressed} showWires={showWires} />
      <Arda3D position={ardaPos} camPos={camPos} height={1.95} pose={ardaPose} face={ardaFace} talking sweating={frame >= s1} />
    </ThreeCanvas>
  );
};

export const TestYontem1: React.FC = () => {
  const s0 = Math.round(sceneStart(0) * FPS);
  const s1 = Math.round(sceneStart(1) * FPS);
  const s2 = Math.round(sceneStart(2) * FPS);
  const end = Math.round(sceneEnd(2) * FPS);

  return (
    <AbsoluteFill style={{ background: "#0F172A" }}>
      <Sequence from={s0} durationInFrames={end - s0}>
        <ElevatorScene3D s0={s0} s1={s1} s2={s2} end={end} />
      </Sequence>
      <Sequence from={Math.round(1.6 * FPS)}>
        <Sfx name="pop_hard" volume={0.45} />
      </Sequence>
      <Sequence from={s1}>
        <Sfx name="fail_wrong-answer" volume={0.42} />
      </Sequence>
      <Sequence from={s2}>
        <Sfx name="ding_correct-answer" volume={0.42} />
      </Sequence>
      <BgMusic words={words} baseVol={0.18} duckVol={0.14} />
      <Audio src={staticFile("test-yontem1/voice.mp3")} volume={0.95} />
      <FloatingParticles />
      <PaperGrain />
      <ViralCaptions words={words} y={1580} highlight={["kapat", "hiçbir", "devre", "kontrol", "hızlı"]} />
    </AbsoluteFill>
  );
};
