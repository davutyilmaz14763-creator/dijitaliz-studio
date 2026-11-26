// Çizgi (illüstrasyonlu karakter anlatımı) seti — düz renk, beyaz sticker kenarlı karakterler,
// kağıt doku, bantlı başlık etiketi, kelime kelime biriken etiket altyazılar.
// Karakterler bizim: "Bit" (ekran yüzlü robot) ve "Cep" (telefon arkadaşı).
import React from "react";
import { loadFont as loadSlab } from "@remotion/google-fonts/Bitter";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily as sans } from "../theme";

export const { fontFamily: slab } = loadSlab("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] });
export { sans };

export const K = {
  ink: "#2A2622",
  cream: "#F4ECDC",
  paper: "#EFE6D3",
  tag: "#E58A6E",
  tagText: "#FFF8EE",
  orange: "#E8743B",
  mint: "#8FD3C1",
  mintEye: "#7FF5D0",
  navy: "#2E3D6E",
  screen: "#1E2A33",
  mustard: "#E2B65C",
  sky: "#A9C8DE",
  purple: "#3B2A5C",
  wall: { mustard: "#D9B56E", beige: "#CFC1A3", navy: "#24305A", purple: "#36275A", sky: "#9FBFD6", mint: "#9CCBB8", rose: "#D99A86" },
  floor: "#4A3426",
  red: "#D9483B",
  green: "#3E9B6A",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** spring that starts at `atSec` (scene-local seconds) */
export const usePopAt = (atSec: number, damping = 12, stiffness = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(atSec * fps), fps, config: { damping, stiffness, mass: 0.7 } });
};

/* ---------- Room: wall + floor + paper grain ---------- */
export const Room: React.FC<{ wall: string; floorY?: number; pattern?: "stripes" | "stars" | "dots" | "none"; children?: React.ReactNode }> = ({
  wall,
  floorY = 1180,
  pattern = "none",
  children,
}) => {
  const frame = useCurrentFrame();
  const pat =
    pattern === "stripes"
      ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 46px, transparent 46px 92px)"
      : pattern === "dots"
        ? "radial-gradient(rgba(255,255,255,0.12) 3px, transparent 3.5px) 0 0 / 60px 60px"
        : "none";
  return (
    <AbsoluteFill style={{ background: wall }}>
      <AbsoluteFill style={{ background: pat }} />
      {pattern === "stars" &&
        new Array(40).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`sx${i}`) * 1080,
              top: random(`sy${i}`) * floorY * 0.85,
              width: 5,
              height: 5,
              borderRadius: 3,
              background: "#FFF6DA",
              opacity: 0.35 + 0.5 * Math.abs(Math.sin(frame / 20 + i)),
            }}
          />
        ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: floorY, bottom: 0, background: K.floor }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: floorY, height: 14, background: "rgba(0,0,0,0.25)" }} />
      {children}
    </AbsoluteFill>
  );
};

/** paper grain + soft vignette, goes on top of everything */
export const PaperGrain: React.FC = () => (
  <>
    <AbsoluteFill style={{ opacity: 0.16, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="paperg">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed={4} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paperg)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(30,20,10,0.35) 100%)" }} />
  </>
);

/* ---------- Taped label header ---------- */
export const TapeLabel: React.FC<{ text: string; y?: number }> = ({ text, y = 230 }) => {
  const p = usePopAt(0.05, 11, 220);
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          background: K.cream,
          padding: "26px 44px",
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 46,
          letterSpacing: 1,
          color: K.ink,
          rotate: "-1.2deg",
          boxShadow: "0 6px 0 rgba(0,0,0,0.12), 0 14px 30px rgba(0,0,0,0.18)",
          scale: String(interpolate(p, [0, 1], [0.6, 1])),
          opacity: p,
        }}
      >
        {text}
        <div style={{ position: "absolute", left: -34, top: -16, width: 110, height: 40, background: "rgba(236,222,190,0.85)", rotate: "-14deg" }} />
        <div style={{ position: "absolute", right: -34, top: -14, width: 110, height: 40, background: "rgba(236,222,190,0.85)", rotate: "12deg" }} />
      </div>
    </div>
  );
};

/* ---------- Word tags: words pile up in small groups as they are spoken ---------- */
export type VWord = { text: string; start: number; end: number; scene: number };

const groupWords = (ws: VWord[]) => {
  const groups: VWord[][] = [];
  let g: VWord[] = [];
  for (const w of ws) {
    const len = g.reduce((a, x) => a + x.text.length + 1, 0);
    const prev = g[g.length - 1];
    const breakAfterPunct = prev && /[.?!:,]$/.test(prev.text);
    if (g.length && (g.length >= 3 || len + w.text.length > 20 || breakAfterPunct || prev.scene !== w.scene)) {
      groups.push(g);
      g = [];
    }
    g.push(w);
  }
  if (g.length) groups.push(g);
  return groups;
};

export const TagCaptions: React.FC<{ words: VWord[]; y?: number }> = ({ words, y = 1300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = React.useMemo(() => groupWords(words), [words]);
  const gi = groups.findIndex((g, i) => t >= g[0].start - 0.02 && (i === groups.length - 1 ? t < g[g.length - 1].end + 0.6 : t < groups[i + 1][0].start - 0.02));
  if (gi < 0) return null;
  const g = groups[gi];
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", padding: "0 90px" }}>
      {g
        .filter((w) => t >= w.start - 0.02)
        .map((w, i) => {
          const local = (t - w.start) * fps;
          const p = spring({ frame: local, fps, config: { damping: 11, stiffness: 300, mass: 0.5 } });
          return (
            <div
              key={i}
              style={{
                background: K.tag,
                color: K.tagText,
                fontFamily: slab,
                fontWeight: 800,
                fontSize: 66,
                lineHeight: 1,
                padding: "10px 18px 14px",
                rotate: `${(random(`r${w.start}`) - 0.5) * 4}deg`,
                boxShadow: "0 5px 0 rgba(0,0,0,0.18)",
                scale: String(interpolate(p, [0, 1], [0.5, 1])),
                opacity: Math.min(1, p * 2),
              }}
            >
              {w.text}
            </div>
          );
        })}
    </div>
  );
};

/* ---------- sticker outline filter (white border around characters/props) ---------- */
export const Sticker: React.FC<{ id: string; r?: number }> = ({ id, r = 7 }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feMorphology in="SourceAlpha" operator="dilate" radius={r} result="d" />
    <feFlood floodColor="#FFFFFF" />
    <feComposite in2="d" operator="in" result="w" />
    <feMerge>
      <feMergeNode in="w" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

const shadow = "drop-shadow(0 10px 0 rgba(0,0,0,0.16))";

/* ---------- Bit: robot with a screen face ---------- */
export type Face = "normal" | "happy" | "angry" | "shock" | "wink" | "side";

const ScreenEyes: React.FC<{ face: Face; blink: number; color: string; cx: number; cy: number; gap: number; s: number }> = ({ face, blink, color, cx, cy, gap, s }) => {
  const L = cx - gap / 2,
    R = cx + gap / 2;
  const sw = 6 * s;
  if (face === "happy")
    return (
      <g stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round">
        <path d={`M${L - 12 * s} ${cy + 5 * s} Q${L} ${cy - 12 * s} ${L + 12 * s} ${cy + 5 * s}`} />
        <path d={`M${R - 12 * s} ${cy + 5 * s} Q${R} ${cy - 12 * s} ${R + 12 * s} ${cy + 5 * s}`} />
      </g>
    );
  if (face === "shock")
    return (
      <g stroke={color} strokeWidth={sw} fill="none">
        <circle cx={L} cy={cy - 4 * s} r={11 * s} />
        <circle cx={R} cy={cy - 4 * s} r={11 * s} />
        <ellipse cx={cx} cy={cy + 20 * s} rx={7 * s} ry={9 * s} />
      </g>
    );
  if (face === "wink")
    return (
      <g fill={color} stroke={color} strokeWidth={sw} strokeLinecap="round">
        <ellipse cx={L} cy={cy} rx={8 * s} ry={12 * s} stroke="none" />
        <path d={`M${R - 12 * s} ${cy} L${R + 12 * s} ${cy}`} fill="none" />
      </g>
    );
  const ry = 12 * s * (1 - blink * 0.9);
  const ox = face === "side" ? 9 * s : 0;
  return (
    <g fill={color}>
      <ellipse cx={L + ox} cy={cy} rx={8 * s} ry={ry} />
      <ellipse cx={R + ox} cy={cy} rx={8 * s} ry={ry} />
      {face === "angry" && (
        <g stroke={color} strokeWidth={sw} strokeLinecap="round">
          <path d={`M${L - 14 * s} ${cy - 22 * s} L${L + 10 * s} ${cy - 13 * s}`} />
          <path d={`M${R + 14 * s} ${cy - 22 * s} L${R - 10 * s} ${cy - 13 * s}`} />
        </g>
      )}
    </g>
  );
};

const useBlink = (seed: string) => {
  const frame = useCurrentFrame();
  const cycle = 70 + Math.floor(random(seed) * 40);
  const k = (frame + Math.floor(random(seed + "o") * 60)) % cycle;
  return k < 3 ? [0.5, 1, 0.5][k] : 0;
};

export const Bit: React.FC<{
  x: number;
  y: number; // feet position
  size?: number; // height in px
  face?: Face;
  armL?: number; // degrees, 0 = hanging down, positive = raise outward
  armR?: number;
  hold?: React.ReactNode; // drawn at right hand (in svg coords, origin at hand)
  flip?: boolean;
  enterAt?: number;
  id: string;
  talk?: number; // 0..1 mouth opening (lip sync)
  headless?: boolean; // draw no head (a photo sticker head goes on top)
}> = ({ x, y, size = 420, face = "normal", armL = 10, armR = 10, hold, flip, enterAt = 0, id, talk, headless }) => {
  const frame = useCurrentFrame();
  const blink = useBlink(id);
  const p = usePopAt(enterAt, 10, 180);
  const bob = Math.sin(frame / 9) * 4;
  const W = 220,
    H = 320;
  const w = (size * W) / H;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - size,
        width: w,
        height: size,
        transformOrigin: "50% 100%",
        scale: `${(flip ? -1 : 1) * interpolate(p, [0, 1], [0.3, 1])} ${interpolate(p, [0, 1], [0.3, 1])}`,
        opacity: Math.min(1, p * 2),
        filter: shadow,
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={w} height={size} overflow="visible">
        <defs>
          <Sticker id={`stk-${id}`} />
        </defs>
        <g filter={`url(#stk-${id})`} stroke={K.ink} strokeWidth={5} strokeLinejoin="round">
          {/* legs */}
          <rect x={78} y={262} width={24} height={42} rx={10} fill={K.cream} />
          <rect x={118} y={262} width={24} height={42} rx={10} fill={K.cream} />
          <ellipse cx={88} cy={306} rx={22} ry={11} fill={K.ink} />
          <ellipse cx={132} cy={306} rx={22} ry={11} fill={K.ink} />
          <g transform={`translate(0 ${bob})`}>
            {/* arms (behind body) */}
            <g transform={`rotate(${armL} 62 190)`}>
              <rect x={50} y={186} width={22} height={70} rx={11} fill={K.cream} />
              <circle cx={61} cy={262} r={15} fill={K.orange} />
            </g>
            <g transform={`rotate(${-armR} 158 190)`}>
              <rect x={148} y={186} width={22} height={70} rx={11} fill={K.cream} />
              <circle cx={159} cy={262} r={15} fill={K.orange} />
              {hold && <g transform="translate(159 262)">{hold}</g>}
            </g>
            {/* body */}
            <rect x={60} y={172} width={100} height={96} rx={26} fill={K.mint} />
            <rect x={86} y={196} width={48} height={30} rx={8} fill={K.cream} />
            <circle cx={100} cy={211} r={6} fill={K.orange} stroke="none" />
            <circle cx={120} cy={211} r={6} fill={K.navy} stroke="none" />
            {/* neck + head */}
            <rect x={96} y={156} width={28} height={20} fill={K.cream} />
            {!headless && <>
            <line x1={110} y1={42} x2={110} y2={14} />
            <circle cx={110} cy={12} r={10} fill={K.orange} />
            <rect x={28} y={40} width={164} height={122} rx={34} fill={K.cream} />
            <rect x={48} y={58} width={124} height={86} rx={20} fill={K.screen} />
            <rect x={14} y={82} width={16} height={38} rx={6} fill={K.orange} />
            <rect x={190} y={82} width={16} height={38} rx={6} fill={K.orange} />
            </>}
          </g>
        </g>
        {!headless && <g transform={`translate(0 ${bob})`}>
          <ScreenEyes face={face} blink={blink} color={face === "angry" ? "#FF8A7A" : K.mintEye} cx={110} cy={talk === undefined ? 100 : 92} gap={50} s={1} />
          {talk !== undefined && <rect x={110 - 16 - talk * 4} y={122 - talk * 7} width={32 + talk * 8} height={5 + talk * 16} rx={6} fill={K.mintEye} />}
          <rect x={56} y={64} width={40} height={10} rx={5} fill="rgba(255,255,255,0.12)" />
        </g>}
      </svg>
    </div>
  );
};

/* ---------- Cep: phone buddy ---------- */
export const Cep: React.FC<{
  x: number;
  y: number;
  size?: number;
  face?: Face;
  armL?: number;
  armR?: number;
  enterAt?: number;
  screen?: string;
  id: string;
}> = ({ x, y, size = 300, face = "normal", armL = 20, armR = 20, enterAt = 0, screen = "#CFE8F7", id }) => {
  const frame = useCurrentFrame();
  const blink = useBlink(id);
  const p = usePopAt(enterAt, 9, 200);
  const hop = Math.abs(Math.sin(frame / 7)) * 6;
  const W = 170,
    H = 280;
  const w = (size * W) / H;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - size,
        width: w,
        height: size,
        transformOrigin: "50% 100%",
        scale: String(interpolate(p, [0, 1], [0.2, 1])),
        opacity: Math.min(1, p * 2),
        filter: shadow,
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={w} height={size} overflow="visible">
        <defs>
          <Sticker id={`stk-${id}`} />
        </defs>
        <g filter={`url(#stk-${id})`} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
          <line x1={64} y1={236} x2={60} y2={266} />
          <line x1={106} y1={236} x2={110} y2={266} />
          <ellipse cx={56} cy={268} rx={16} ry={8} fill={K.ink} />
          <ellipse cx={114} cy={268} rx={16} ry={8} fill={K.ink} />
          <g transform={`translate(0 ${-hop})`}>
            <g transform={`rotate(${armL} 30 130)`}>
              <line x1={30} y1={130} x2={8} y2={180} />
              <circle cx={8} cy={184} r={10} fill={K.orange} />
            </g>
            <g transform={`rotate(${-armR} 140 130)`}>
              <line x1={140} y1={130} x2={162} y2={180} />
              <circle cx={162} cy={184} r={10} fill={K.orange} />
            </g>
            <rect x={26} y={20} width={118} height={218} rx={28} fill={K.navy} />
            <rect x={38} y={44} width={94} height={170} rx={16} fill={screen} />
            <rect x={68} y={28} width={34} height={8} rx={4} fill={K.ink} stroke="none" />
          </g>
        </g>
        <g transform={`translate(0 ${-hop})`}>
          <ScreenEyes face={face} blink={blink} color={K.ink} cx={85} cy={118} gap={36} s={0.75} />
          {face !== "shock" && (
            <path d="M75 140 Q85 150 95 140" stroke={K.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={face === "angry" ? 0 : 1} />
          )}
          <circle cx={56} cy={136} r={7} fill="#F2A08F" opacity={0.8} />
          <circle cx={114} cy={136} r={7} fill="#F2A08F" opacity={0.8} />
        </g>
      </svg>
    </div>
  );
};

/* ---------- generic sticker card (HTML) ---------- */
export const Card: React.FC<{
  x: number;
  y: number;
  w?: number;
  at?: number;
  rot?: number;
  bg?: string;
  children: React.ReactNode;
  from?: "pop" | "left" | "right" | "up";
}> = ({ x, y, w, at = 0, rot = 0, bg = "#FFFDF7", children, from = "pop" }) => {
  const p = usePopAt(at, 16, 190);
  const off = from === "left" ? [-420, 0] : from === "right" ? [420, 0] : from === "up" ? [0, 320] : [0, 0];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        maxWidth: 900,
        background: bg,
        border: `5px solid ${K.ink}`,
        borderRadius: 22,
        outline: "8px solid #FFFFFF",
        boxShadow: "0 12px 0 rgba(0,0,0,0.16)",
        fontFamily: sans,
        color: K.ink,
        rotate: `${rot}deg`,
        translate: `${off[0] * (1 - p)}px ${off[1] * (1 - p)}px`,
        scale: from === "pop" ? String(interpolate(p, [0, 1], [0.72, 1])) : "1",
        opacity: Math.min(1, p * 2.5),
      }}
    >
      {children}
    </div>
  );
};

/* ---------- speech bubble ---------- */
export const Bubble: React.FC<{ x: number; y: number; at?: number; children: React.ReactNode; tail?: "left" | "right" }> = ({
  x,
  y,
  at = 0,
  children,
  tail = "left",
}) => {
  const p = usePopAt(at, 9, 240);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        background: "#FFFFFF",
        border: `5px solid ${K.ink}`,
        borderRadius: 40,
        padding: "18px 30px",
        fontFamily: slab,
        fontWeight: 800,
        fontSize: 54,
        color: K.ink,
        transformOrigin: tail === "left" ? "0% 100%" : "100% 100%",
        scale: String(p),
        boxShadow: "0 8px 0 rgba(0,0,0,0.15)",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          bottom: -26,
          [tail === "left" ? "left" : "right"]: 40,
          width: 0,
          height: 0,
          borderLeft: "18px solid transparent",
          borderRight: "18px solid transparent",
          borderTop: `28px solid ${K.ink}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -16,
          [tail === "left" ? "left" : "right"]: 46,
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "20px solid #FFFFFF",
        }}
      />
    </div>
  );
};

/* ---------- stamp ---------- */
export const Stamp: React.FC<{ x: number; y: number; at: number; color?: string; rot?: number; children: React.ReactNode; size?: number }> = ({
  x,
  y,
  at,
  color = K.red,
  rot = -10,
  children,
  size = 70,
}) => {
  const p = usePopAt(at, 16, 200);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        maxWidth: 900,
        textAlign: "center",
        border: `8px solid ${color}`,
        borderRadius: 18,
        padding: "8px 26px",
        color,
        fontFamily: sans,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: 2,
        background: "rgba(255,255,255,0.9)",
        rotate: `${rot}deg`,
        opacity: p > 0.02 ? 1 : 0,
        scale: String(interpolate(p, [0, 1], [1.35, 1])),
      }}
    >
      {children}
    </div>
  );
};

/* ---------- sunburst rays ---------- */
export const Sunburst: React.FC<{ a?: string; b?: string; cy?: number }> = ({ a = "#E58A6E", b = "#F2D7B6", cy = 700 }) => {
  const frame = useCurrentFrame();
  const stops = new Array(24).fill(0).map((_, i) => `${i % 2 ? a : b} ${i * 15}deg ${(i + 1) * 15}deg`).join(",");
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 1600,
          top: cy - 1600,
          width: 3200,
          height: 3200,
          background: `conic-gradient(${stops})`,
          rotate: `${frame * 0.25}deg`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- wall clock ---------- */
export const Clock: React.FC<{ x: number; y: number; speed?: number }> = ({ x, y, speed = 6 }) => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", left: x, top: y }} width={120} height={120} viewBox="0 0 120 120">
      <circle cx={60} cy={60} r={52} fill="#FFFDF7" stroke={K.ink} strokeWidth={6} />
      <line x1={60} y1={60} x2={60} y2={26} stroke={K.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${frame * speed} 60 60)`} />
      <line x1={60} y1={60} x2={82} y2={60} stroke={K.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${frame * speed * 0.08} 60 60)`} />
    </svg>
  );
};

/* ---------- Photo face sticker (cut-out head that flaps between closed/open mouth frames) ---------- */
export const FaceSticker: React.FC<{ closed: string; open: string; talk: number; cx: number; cy: number; w: number; tilt?: number }> = ({
  closed,
  open,
  talk,
  cx,
  cy,
  w,
  tilt = 0,
}) => {
  const frame = useCurrentFrame();
  const h = w * 1.25;
  const src = talk > 0.28 ? open : closed;
  const b = Math.max(3, w * 0.03);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        rotate: `${tilt + Math.sin(frame / 17) * 2.5}deg`,
        scale: `${1 + talk * 0.015} ${1 + talk * 0.03}`,
        transformOrigin: "50% 90%",
        filter: `drop-shadow(${b}px 0 0 #fff) drop-shadow(-${b}px 0 0 #fff) drop-shadow(0 ${b}px 0 #fff) drop-shadow(0 -${b}px 0 #fff) drop-shadow(0 10px 0 rgba(0,0,0,0.25))`,
      }}
    >
      <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", clipPath: "ellipse(44% 48% at 50% 50%)" }} />
    </div>
  );
};

/* ---------- OpenMontage-inspired StatBar & ComparisonCard in Cizgi style ---------- */
export const CizgiStatBar: React.FC<{
  y?: number;
  at?: number;
  label: string;
  percent: number;
  targetValue?: number;
  suffix?: string;
  barColor?: string;
}> = ({ y = 360, at = 0.1, label, percent, targetValue, suffix = "%", barColor = K.orange }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePopAt(at, 16, 190);
  const fill = interpolate(frame / fps - at, [0.1, 0.9], [0, percent], clamp);
  const shown = Math.round(interpolate(frame / fps - at, [0.1, 0.9], [0, targetValue ?? percent], clamp));
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: y,
        background: "#FFFDF7",
        border: `5px solid ${K.ink}`,
        borderRadius: 24,
        outline: "8px solid #FFFFFF",
        boxShadow: "0 12px 0 rgba(0,0,0,0.16)",
        padding: "24px 30px",
        fontFamily: sans,
        color: K.ink,
        scale: String(interpolate(p, [0, 1], [0.85, 1])),
        opacity: Math.min(1, p * 2.5),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <span style={{ fontFamily: slab, fontSize: 34, fontWeight: 800 }}>{label}</span>
        <span style={{ fontFamily: slab, fontSize: 54, fontWeight: 900, color: barColor }}>
          {suffix === "%" ? `%${shown}` : `${shown}${suffix}`}
        </span>
      </div>
      <div style={{ height: 32, borderRadius: 16, background: "#E5DEC9", border: `4px solid ${K.ink}`, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.max(0, fill))}%`, height: "100%", background: barColor }} />
      </div>
    </div>
  );
};

export const CizgiComparisonCard: React.FC<{
  y?: number;
  at?: number;
  title: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  leftColor?: string;
  rightColor?: string;
  badge?: string;
}> = ({
  y = 350,
  at = 0.1,
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  leftColor = K.green,
  rightColor = K.red,
  badge,
}) => {
  const p = usePopAt(at, 16, 190);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: y,
        background: "#FFFDF7",
        border: `5px solid ${K.ink}`,
        borderRadius: 26,
        outline: "8px solid #FFFFFF",
        boxShadow: "0 12px 0 rgba(0,0,0,0.16)",
        padding: "22px 26px",
        fontFamily: sans,
        color: K.ink,
        scale: String(interpolate(p, [0, 1], [0.85, 1])),
        opacity: Math.min(1, p * 2.5),
      }}
    >
      <div style={{ fontFamily: slab, fontSize: 30, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>{title}</div>
      <div style={{ display: "flex", gap: 18 }}>
        {[
          { lbl: leftLabel, val: leftValue, col: leftColor },
          { lbl: rightLabel, val: rightValue, col: rightColor },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              background: "#F4ECDC",
              border: `4px solid ${K.ink}`,
              borderRadius: 18,
              padding: "14px 12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: "#5C5346" }}>{item.lbl}</div>
            <div style={{ fontFamily: slab, fontSize: 52, fontWeight: 900, color: item.col, marginTop: 4 }}>{item.val}</div>
          </div>
        ))}
      </div>
      {badge && (
        <div
          style={{
            marginTop: 14,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 800,
            color: K.cream,
            background: K.ink,
            borderRadius: 12,
            padding: "8px 14px",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
};

/* ---------- Human Host: Arda (#7 Siber Dedektif) & Helper: Elif (#2 Podcast/Bilgi) ---------- */
type HumanProps = {
  x: number;
  y: number;
  size?: number;
  face?: Face;
  armL?: number;
  armR?: number;
  hold?: React.ReactNode;
  flip?: boolean;
  enterAt?: number;
  id: string;
  talk?: number;
};

const HumanFaceExpr: React.FC<{ face: Face; blink: number; talk?: number; cx?: number; cy?: number }> = ({
  face,
  blink,
  talk,
  cx = 110,
  cy = 104,
}) => {
  const eyeScaleY = blink > 0 ? 1 - blink * 0.85 : 1;
  const ex = face === "side" ? cx + 8 : cx;
  return (
    <g>
      {/* Eyes */}
      {face === "happy" ? (
        <>
          <path d={`M ${ex - 26} ${cy} Q ${ex - 18} ${cy - 10} ${ex - 10} ${cy}`} fill="none" stroke={K.ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d={`M ${ex + 10} ${cy} Q ${ex + 18} ${cy - 10} ${ex + 26} ${cy}`} fill="none" stroke={K.ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      ) : face === "wink" ? (
        <>
          <circle cx={ex - 18} cy={cy} r={6} fill={K.ink} stroke="none" />
          <path d={`M ${ex + 10} ${cy} Q ${ex + 18} ${cy - 10} ${ex + 26} ${cy}`} fill="none" stroke={K.ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={ex - 18} cy={cy} rx={6} ry={(face === "shock" ? 8 : 6) * eyeScaleY} fill={K.ink} stroke="none" />
          <ellipse cx={ex + 18} cy={cy} rx={6} ry={(face === "shock" ? 8 : 6) * eyeScaleY} fill={K.ink} stroke="none" />
          <circle cx={ex - 16} cy={cy - 2} r={2} fill="#FFF" stroke="none" />
          <circle cx={ex + 20} cy={cy - 2} r={2} fill="#FFF" stroke="none" />
        </>
      )}
      {/* Eyebrows */}
      {face === "angry" ? (
        <>
          <line x1={ex - 26} y1={cy - 15} x2={ex - 10} y2={cy - 10} stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
          <line x1={ex + 26} y1={cy - 15} x2={ex + 10} y2={cy - 10} stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M ${ex - 26} ${cy - 14} Q ${ex - 18} ${cy - 18} ${ex - 10} ${cy - 14}`} fill="none" stroke={K.ink} strokeWidth={3.5} strokeLinecap="round" />
          <path d={`M ${ex + 10} ${cy - 14} Q ${ex + 18} ${cy - 18} ${ex + 26} ${cy - 14}`} fill="none" stroke={K.ink} strokeWidth={3.5} strokeLinecap="round" />
        </>
      )}
      {/* Mouth */}
      {talk && talk > 0.2 ? (
        <ellipse cx={ex} cy={cy + 22} rx={9} ry={4 + talk * 6} fill={K.ink} stroke="none" />
      ) : face === "shock" ? (
        <circle cx={ex} cy={cy + 22} r={7} fill={K.ink} stroke="none" />
      ) : face === "angry" ? (
        <path d={`M ${ex - 12} ${cy + 24} Q ${ex} ${cy + 16} ${ex + 12} ${cy + 24}`} fill="none" stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
      ) : (
        <path d={`M ${ex - 12} ${cy + 18} Q ${ex} ${cy + 29} ${ex + 12} ${cy + 18}`} fill="none" stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
      )}
    </g>
  );
};

export const Arda: React.FC<HumanProps> = ({ x, y, size = 440, face = "normal", armL = 12, armR = 12, hold, flip, enterAt = 0, id = "arda", talk = 0 }) => {
  const frame = useCurrentFrame();
  const blink = useBlink(id);
  const p = usePopAt(enterAt, 14, 190);
  const bob = Math.sin(frame / 9) * 3.5;
  const isBlinking = blink > 0.5;
  const mouthOpen = talk > 0.18 ? 4 + talk * 7 : 0;
  const W = 240,
    H = 340;
  const w = (size * W) / H;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - size,
        width: w,
        height: size,
        transformOrigin: "50% 100%",
        scale: `${(flip ? -1 : 1) * interpolate(p, [0, 1], [0.5, 1])} ${interpolate(p, [0, 1], [0.5, 1])}`,
        opacity: Math.min(1, p * 2),
        filter: shadow,
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={w} height={size} overflow="visible">
        <defs>
          <Sticker id={`stk-arda-${id}`} />
        </defs>
        <g filter={`url(#stk-arda-${id})`} stroke={K.ink} strokeWidth={4.5} strokeLinejoin="round">
          {/* Legs */}
          <rect x={88} y={278} width={24} height={44} rx={10} fill="#1E293B" />
          <rect x={128} y={278} width={24} height={44} rx={10} fill="#1E293B" />
          <ellipse cx={98} cy={324} rx={22} ry={10} fill="#0F172A" />
          <ellipse cx={142} cy={324} rx={22} ry={10} fill="#0F172A" />
          <g transform={`translate(0 ${bob})`}>
            {/* Arms */}
            <g transform={`rotate(${armL} 68 202)`}>
              <rect x={54} y={196} width={24} height={74} rx={12} fill="#2B3445" />
              <circle cx={66} cy={276} r={14} fill="#F4C095" />
            </g>
            <g transform={`rotate(${-armR} 172 202)`}>
              <rect x={162} y={196} width={24} height={74} rx={12} fill="#2B3445" />
              <circle cx={174} cy={276} r={14} fill="#F4C095" />
              {hold && <g transform="translate(174 276)">{hold}</g>}
            </g>
            {/* Dark Charcoal Trench Coat + Tall Popped Collar (matching profile) */}
            <path d="M 68 184 L 172 184 L 182 284 L 58 284 Z" fill="#2B3445" />
            <polygon points="96,184 120,224 144,184" fill="#0B1120" />
            {/* Left & Right Tall Popped Collar */}
            <path d="M 66 188 L 74 142 L 100 186 L 90 202 Z" fill="#3B4659" />
            <path d="M 174 188 L 166 142 L 140 186 L 150 202 Z" fill="#3B4659" />
            <line x1={120} y1={224} x2={120} y2={284} strokeWidth={4} />
            {/* Neck & Ear */}
            <path d="M 105 162 L 135 162 L 135 190 L 105 190 Z" fill="#E6AE82" />
            <ellipse cx={72} cy={120} rx={10} ry={13} fill="#F4C095" />
            <ellipse cx={168} cy={120} rx={10} ry={13} fill="#F4C095" />
            {/* Sculpted Face / Jawline */}
            <path d="M 74 82 Q 74 66 120 66 Q 166 66 166 82 L 164 132 Q 158 166 120 172 Q 82 166 76 132 Z" fill="#F4C095" />
            {/* Dark Side Hair */}
            <path d="M 74 84 L 74 112 Q 81 106 83 92 Z" fill="#27201E" stroke="none" />
            <path d="M 166 84 L 166 112 Q 159 106 157 92 Z" fill="#27201E" stroke="none" />
            {/* Expressive Eyebrows */}
            {face === "shock" ? (
              <>
                <path d="M 84 94 Q 96 86 108 92" fill="none" stroke="#1E1B18" strokeWidth={4.5} strokeLinecap="round" />
                <path d="M 132 92 Q 144 86 156 94" fill="none" stroke="#1E1B18" strokeWidth={4.5} strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 84 97 Q 98 91 110 96" fill="none" stroke="#1E1B18" strokeWidth={4.8} strokeLinecap="round" />
                <path d="M 130 96 Q 142 91 156 97" fill="none" stroke="#1E1B18" strokeWidth={4.8} strokeLinecap="round" />
              </>
            )}
            {/* Large Expressive Eyes */}
            {face === "wink" ? (
              <>
                <ellipse cx={97} cy={113} rx={9.5} ry={isBlinking ? 1.5 : 7.5} fill="#FFFFFF" stroke="none" />
                {!isBlinking && <circle cx={99} cy={113} r={5} fill="#1E3A5F" stroke="none" />}
                {!isBlinking && <circle cx={100.5} cy={111} r={2} fill="#FFFFFF" stroke="none" />}
                <path d="M 132 113 Q 143 105 153 113" fill="none" stroke="#1E1B18" strokeWidth={4} strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx={97} cy={113} rx={9.5} ry={isBlinking ? 1.5 : face === "shock" ? 9 : 7.5} fill="#FFFFFF" stroke="none" />
                <ellipse cx={143} cy={113} rx={9.5} ry={isBlinking ? 1.5 : face === "shock" ? 9 : 7.5} fill="#FFFFFF" stroke="none" />
                {!isBlinking && (
                  <>
                    <circle cx={99} cy={113} r={5} fill="#1E3A5F" stroke="none" />
                    <circle cx={145} cy={113} r={5} fill="#1E3A5F" stroke="none" />
                    <circle cx={100.5} cy={111} r={2} fill="#FFFFFF" stroke="none" />
                    <circle cx={146.5} cy={111} r={2} fill="#FFFFFF" stroke="none" />
                  </>
                )}
              </>
            )}
            {/* Nose */}
            <path d="M 119 116 L 116 131 Q 120 134 125 131" fill="none" stroke="#9A6B4C" strokeWidth={3} strokeLinecap="round" />
            {/* Mouth */}
            {mouthOpen > 0 ? (
              <ellipse cx={120} cy={147} rx={9} ry={mouthOpen} fill="#1E293B" stroke={K.ink} strokeWidth={3} />
            ) : face === "shock" ? (
              <ellipse cx={120} cy={148} rx={7.5} ry={9.5} fill="#1E293B" stroke={K.ink} strokeWidth={3} />
            ) : face === "happy" ? (
              <path d="M 105 144 Q 120 158 136 143" fill="none" stroke="#1E1B18" strokeWidth={3.8} strokeLinecap="round" />
            ) : (
              <path d="M 107 146 Q 122 153 135 143" fill="none" stroke="#1E1B18" strokeWidth={3.6} strokeLinecap="round" />
            )}
            {/* Round Black Glasses + Cyan Lens Reflection (matching profile) */}
            <g stroke="#0F172A" strokeWidth={4.2}>
              <circle cx={97} cy={113} r={18} fill="rgba(56,189,248,0.22)" />
              <circle cx={143} cy={113} r={18} fill="rgba(56,189,248,0.22)" />
              <path d="M 115 112 Q 120 108 125 112" fill="none" />
              <line x1={74} y1={110} x2={79} y2={112} strokeWidth={3.5} />
              <line x1={161} y1={112} x2={166} y2={110} strokeWidth={3.5} />
            </g>
            <line x1={87} y1={103} x2={96} y2={121} stroke="rgba(255,255,255,0.6)" strokeWidth={2.8} strokeLinecap="round" />
            <line x1={133} y1={103} x2={142} y2={121} stroke="rgba(255,255,255,0.6)" strokeWidth={2.8} strokeLinecap="round" />
            {/* Curved Navy Fedora Hat with Bright Cyan Band (matching profile) */}
            <path d="M 76 78 L 88 30 Q 108 24 120 28 Q 132 24 152 30 L 164 78 Z" fill="#1B2A4A" />
            <path d="M 79 65 Q 120 60 161 65 L 163 75 Q 120 70 77 75 Z" fill="#38BDF8" stroke="none" />
            <path d="M 48 80 Q 120 66 192 80 Q 120 94 48 80 Z" fill="#111C35" />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* Small Floating Helper Robot Head */
export const MiniBot: React.FC<{ x: number; y: number; size?: number; color?: string; face?: "normal" | "shock" | "happy"; enterAt?: number; id?: string }> = ({
  x,
  y,
  size = 130,
  color = "#38BDF8",
  face = "normal",
  enterAt = 0.15,
  id = "mbot",
}) => {
  const frame = useCurrentFrame();
  const p = usePopAt(enterAt, 14, 200);
  const floatY = Math.sin(frame / 8 + x) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2 + floatY,
        width: size,
        height: size,
        transformOrigin: "50% 50%",
        scale: String(interpolate(p, [0, 1], [0.3, 1])),
        opacity: Math.min(1, p * 2.5),
        filter: "drop-shadow(0 0 12px rgba(56,189,248,0.55)) drop-shadow(0 8px 14px rgba(0,0,0,0.35))",
        zIndex: 14,
      }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} overflow="visible">
        <defs>
          <Sticker id={`stk-mb-${id}`} />
        </defs>
        <g filter={`url(#stk-mb-${id})`} stroke={K.ink} strokeWidth={4.5} strokeLinejoin="round">
          <line x1={60} y1={22} x2={60} y2={8} strokeWidth={4} />
          <circle cx={60} cy={6} r={5} fill="#FACC15" />
          <rect x={20} y={24} width={80} height={68} rx={22} fill="#E2E8F0" />
          <rect x={30} y={36} width={60} height={42} rx={12} fill="#0F172A" />
          {face === "shock" ? (
            <>
              <circle cx={46} cy={54} r={6} fill={color} stroke="none" />
              <circle cx={74} cy={54} r={6} fill={color} stroke="none" />
              <circle cx={60} cy={68} r={4.5} fill={color} stroke="none" />
            </>
          ) : face === "happy" ? (
            <>
              <path d="M 40 56 Q 46 48 52 56" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
              <path d="M 68 56 Q 74 48 80 56" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
              <path d="M 50 66 Q 60 74 70 66" fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx={46} cy={55} r={5} fill={color} stroke="none" />
              <circle cx={74} cy={55} r={5} fill={color} stroke="none" />
              <line x1={52} y1={68} x2={68} y2={68} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export const Elif: React.FC<HumanProps> = ({ x, y, size = 400, face = "normal", armL = 12, armR = 12, hold, flip, enterAt = 0, id, talk }) => {
  const frame = useCurrentFrame();
  const blink = useBlink(id);
  const p = usePopAt(enterAt, 14, 190);
  const bob = Math.sin(frame / 9 + 1) * 3.5;
  const W = 220,
    H = 320;
  const w = (size * W) / H;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - size,
        width: w,
        height: size,
        transformOrigin: "50% 100%",
        scale: `${(flip ? -1 : 1) * interpolate(p, [0, 1], [0.5, 1])} ${interpolate(p, [0, 1], [0.5, 1])}`,
        opacity: Math.min(1, p * 2),
        filter: shadow,
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={w} height={size} overflow="visible">
        <defs>
          <Sticker id={`stk-elif-${id}`} />
        </defs>
        <g filter={`url(#stk-elif-${id})`} stroke={K.ink} strokeWidth={5} strokeLinejoin="round">
          {/* Legs */}
          <rect x={80} y={262} width={22} height={42} rx={10} fill="#1E293B" />
          <rect x={118} y={262} width={22} height={42} rx={10} fill="#1E293B" />
          <ellipse cx={89} cy={306} rx={21} ry={10} fill={K.ink} />
          <ellipse cx={131} cy={306} rx={21} ry={10} fill={K.ink} />
          <g transform={`translate(0 ${bob})`}>
            {/* Ponytail back */}
            <path d="M 142 74 Q 182 84 172 136 Q 158 144 148 122 Z" fill="#271C19" />
            {/* Arms */}
            <g transform={`rotate(${armL} 62 190)`}>
              <rect x={50} y={184} width={22} height={70} rx={11} fill="#9F1239" />
              <circle cx={61} cy={260} r={14} fill="#F7D3BA" />
            </g>
            <g transform={`rotate(${-armR} 158 190)`}>
              <rect x={148} y={184} width={22} height={70} rx={11} fill="#9F1239" />
              <circle cx={159} cy={260} r={14} fill="#F7D3BA" />
              {hold && <g transform="translate(159 260)">{hold}</g>}
            </g>
            {/* Sweatshirt body */}
            <rect x={62} y={174} width={96} height={92} rx={24} fill="#9F1239" />
            {/* Neck & Head */}
            <rect x={97} y={154} width={26} height={22} rx={6} fill="#F7D3BA" />
            <rect x={68} y={64} width={84} height={92} rx={38} fill="#F7D3BA" />
            <HumanFaceExpr face={face} blink={blink} talk={talk} cx={110} cy={108} />
            {/* Front hair */}
            <path d="M 66 96 Q 66 56 110 56 Q 154 56 154 96 Q 134 74 110 82 Q 86 74 66 96 Z" fill="#271C19" />
            {/* Studio Headphones */}
            <path d="M 62 104 Q 60 44 110 44 Q 160 44 158 104" fill="none" stroke="#1E293B" strokeWidth={9} strokeLinecap="round" />
            <rect x={52} y={92} width={16} height={32} rx={8} fill="#1E293B" />
            <rect x={152} y={92} width={16} height={32} rx={8} fill="#1E293B" />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ---------- Viral Reels Kit: HUD, Headlines, SpeedLines, SweatDrops, ViralCaptions, RealPhotoBg ---------- */
export const RealPhotoBg: React.FC<{ src: string; duration: number; opacity?: number; tint?: string }> = ({
  src,
  duration,
  opacity = 0.42,
  tint = "rgba(2, 6, 23, 0.52)",
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, duration], [1.0, 1.14]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <Img
        src={staticFile(src)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", scale: String(s), opacity }}
      />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${tint} 0%, rgba(2,6,23,0.18) 45%, ${tint} 100%)` }} />
    </AbsoluteFill>
  );
};

export const rimGlow = "drop-shadow(0 0 5px rgba(255,255,255,0.7)) drop-shadow(0 10px 14px rgba(0,0,0,0.32))";

export const ChapterHud: React.FC<{ channel?: string; sub: string; dotColor?: string }> = ({
  channel = "DİJİTALİZ",
  sub,
  dotColor = "#FACC15",
}) => (
  <div
    style={{
      position: "absolute",
      left: 54,
      top: 66,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      zIndex: 20,
      textShadow: "0 3px 10px rgba(0,0,0,0.7)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 14, height: 14, borderRadius: 99, background: dotColor, boxShadow: `0 0 12px ${dotColor}` }} />
      <span style={{ fontFamily: slab, fontSize: 28, fontWeight: 900, letterSpacing: 1.5, color: "#FEF08A" }}>{channel}</span>
    </div>
    <div style={{ fontFamily: sans, fontSize: 21, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,0.86)", paddingLeft: 24 }}>{sub}</div>
  </div>
);

export const ViralHeadline: React.FC<{
  line1: string;
  line2?: string;
  color1?: string;
  color2?: string;
  y?: number;
  at?: number;
}> = ({ line1, line2, color1 = "#FFFFFF", color2 = "#FACC15", y = 175, at = 0.08 }) => {
  const p = usePopAt(at, 15, 210);
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: y,
        textAlign: "center",
        transformOrigin: "50% 50%",
        scale: String(interpolate(p, [0, 1], [0.84, 1])),
        opacity: Math.min(1, p * 2.5),
        zIndex: 18,
      }}
    >
      <div
        style={{
          fontFamily: slab,
          fontSize: 74,
          fontWeight: 900,
          lineHeight: 1.02,
          letterSpacing: 1,
          color: color1,
          WebkitTextStroke: "4px #0F172A",
          paintOrder: "stroke fill",
          textShadow: "0 8px 24px rgba(0,0,0,0.65)",
        }}
      >
        {line1}
      </div>
      {line2 && (
        <div
          style={{
            fontFamily: slab,
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: 1,
            color: color2,
            WebkitTextStroke: "4px #0F172A",
            paintOrder: "stroke fill",
            textShadow: "0 8px 24px rgba(0,0,0,0.65)",
            marginTop: 6,
          }}
        >
          {line2}
        </div>
      )}
    </div>
  );
};

export const SpeedLines: React.FC<{ opacity?: number }> = ({ opacity = 0.22 }) => {
  const frame = useCurrentFrame();
  const rows = [140, 260, 410, 560, 720, 880, 1050, 1240, 1460];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {rows.map((ry, i) => {
        const w = 180 + ((i * 97) % 240);
        const speed = 28 + (i % 3) * 14;
        const x = ((frame * speed + i * 230) % 1400) - 320;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: ry,
              width: w,
              height: i % 2 === 0 ? 5 : 3,
              borderRadius: 99,
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const SweatDrops: React.FC<{ x: number; y: number; at?: number }> = ({ x, y, at = 0.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame / fps < at) return null;
  const dy = ((frame % 18) / 18) * 18;
  const op = interpolate(frame % 18, [0, 4, 14, 18], [0, 1, 1, 0]);
  return (
    <svg
      width={180}
      height={90}
      viewBox="0 0 180 90"
      style={{ position: "absolute", left: x - 90, top: y - 45, opacity: op, pointerEvents: "none", zIndex: 15 }}
    >
      <path d={`M 24 ${18 + dy} Q 14 ${34 + dy} 24 ${42 + dy} Q 34 ${34 + dy} 24 ${18 + dy} Z`} fill="#38BDF8" stroke="#0F172A" strokeWidth={3} />
      <path d={`M 156 ${12 + dy} Q 146 ${28 + dy} 156 ${36 + dy} Q 166 ${28 + dy} 156 ${12 + dy} Z`} fill="#38BDF8" stroke="#0F172A" strokeWidth={3} />
    </svg>
  );
};

export const ViralCaptions: React.FC<{ words: VWord[]; y?: number; highlight?: string[] }> = ({
  words,
  y = 1480,
  highlight = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = words.findIndex((w) => t >= w.start && t <= w.end + 0.14);
  if (idx === -1) return null;
  const w = words[idx];
  const age = Math.max(0, t - w.start);
  const scale = interpolate(age, [0, 0.08], [1.18, 1], clamp);
  const clean = w.text.replace(/[.,!?;:]/g, "").toLocaleLowerCase("tr");
  const isHot = highlight.some((h) => clean.startsWith(h.toLocaleLowerCase("tr")));
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        textAlign: "center",
        transform: `scale(${scale})`,
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: sans,
          fontSize: 78,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: isHot ? "#FACC15" : "#FFFFFF",
          WebkitTextStroke: "14px #0F172A",
          paintOrder: "stroke fill",
          textShadow: "0 10px 24px rgba(0,0,0,0.75)",
        }}
      >
        {w.text}
      </span>
    </div>
  );
};
