import React from "react";
import { AbsoluteFill } from "remotion";
import { K, sans, slab } from "./kit";

type HumanDef = {
  id: number;
  name: string;
  tag: string;
  bg: string;
  skin: string;
  shirt: string;
  hair: string;
  hairStyle: "short" | "ponytail" | "curly" | "bob" | "spiky" | "bun" | "long" | "anime" | "bald";
  glasses?: "round" | "square" | "shades" | "goggles";
  hat?: "cap" | "beanie" | "detective" | "beret" | "safari" | "helmet";
  hoodie?: boolean;
  headphones?: string;
  beard?: boolean;
  mustache?: boolean;
  mask?: boolean;
  scarf?: string;
};

const HUMAN_CHARS: HumanDef[] = [
  { id: 1, name: "Emre", tag: "Samimi Anlatıcı", bg: "#EFE6D3", skin: "#F3C6A5", shirt: "#374151", hair: "#4A3222", hairStyle: "short", hoodie: true },
  { id: 2, name: "Elif", tag: "Podcast & Bilgi", bg: "#FCE7F3", skin: "#F7D3BA", shirt: "#9F1239", hair: "#271C19", hairStyle: "ponytail", headphones: "#1E293B" },
  { id: 3, name: "Kaan", tag: "Tekno Yorumcu", bg: "#E0F2FE", skin: "#EDC09E", shirt: "#1E3A8A", hair: "#18181B", hairStyle: "spiky", glasses: "round" },
  { id: 4, name: "Zeynep", tag: "Enerjik Meraklı", bg: "#FEF3C7", skin: "#E5B28A", shirt: "#D97706", hair: "#3B2314", hairStyle: "curly" },
  { id: 5, name: "Can", tag: "Gece Coder", bg: "#0F172A", skin: "#F1C4A4", shirt: "#18181B", hair: "#1F2937", hairStyle: "short", glasses: "square", beard: true, hoodie: true },
  { id: 6, name: "Defne", tag: "Tasarım & Estetik", bg: "#F5EAE0", skin: "#F9DEC9", shirt: "#D6C7B2", hair: "#5C3A21", hairStyle: "bob", glasses: "round" },
  { id: 7, name: "Arda", tag: "Siber Dedektif", bg: "#1E293B", skin: "#E8BA98", shirt: "#785A3C", hair: "#292524", hairStyle: "short", hat: "detective", glasses: "square" },
  { id: 8, name: "Mira", tag: "Uzay Kaşifi", bg: "#1E1B4B", skin: "#F7D3BA", shirt: "#E8743B", hair: "#4A2C18", hairStyle: "bob", hat: "helmet" },
  { id: 9, name: "Mert", tag: "90'lar & Kültür", bg: "#FFEDD5", skin: "#E0AC84", shirt: "#EA580C", hair: "#18181B", hairStyle: "short", hat: "cap", glasses: "shades" },
  { id: 10, name: "Selin", tag: "Bilim & Deney", bg: "#ECFDF5", skin: "#F6CEB2", shirt: "#FFFFFF", hair: "#3F2618", hairStyle: "bun", glasses: "goggles" },
  { id: 11, name: "Kerem", tag: "Profesör", bg: "#F3E8D2", skin: "#F0C3A4", shirt: "#7C5E46", hair: "#E5E7EB", hairStyle: "short", glasses: "round", mustache: true },
  { id: 12, name: "Ada", tag: "2026 Siber Trend", bg: "#1A103D", skin: "#F7D5BE", shirt: "#7C3AED", hair: "#22D3EE", hairStyle: "long", headphones: "#EC4899" },
  { id: 13, name: "Barış", tag: "Sokak Gündemi", bg: "#DBEAFE", skin: "#E6B48E", shirt: "#EA580C", hair: "#1F2937", hairStyle: "short", hat: "beanie", hoodie: true },
  { id: 14, name: "Ece", tag: "Sanat & Kültür", bg: "#FFE4E6", skin: "#F8D9C4", shirt: "#18181B", hair: "#271C19", hairStyle: "bob", hat: "beret" },
  { id: 15, name: "Tolga", tag: "Gamer & Trend", bg: "#111827", skin: "#F1C2A0", shirt: "#065F46", hair: "#18181B", hairStyle: "spiky", headphones: "#10B981", hoodie: true },
  { id: 16, name: "Nehir", tag: "Dünya Gezgini", bg: "#DCFCE7", skin: "#DFAA82", shirt: "#65A30D", hair: "#4A2E1B", hairStyle: "ponytail", hat: "safari", scarf: "#E8743B" },
  { id: 17, name: "Deniz", tag: "İş & Ekonomi", bg: "#E2E8F0", skin: "#EDC09E", shirt: "#1E3A8A", hair: "#292524", hairStyle: "short", scarf: "#DC2626" },
  { id: 18, name: "Lina", tag: "Anime / Chibi", bg: "#FCE7F3", skin: "#FCE2D2", shirt: "#EC4899", hair: "#F472B6", hairStyle: "anime" },
  { id: 19, name: "Ozan", tag: "Lo-Fi Hikayeci", bg: "#27272A", skin: "#E8B794", shirt: "#4338CA", hair: "#18181B", hairStyle: "short", hat: "beanie", glasses: "round" },
  { id: 20, name: "Maske", tag: "Gizemli Viral", bg: "#09090B", skin: "#18181B", shirt: "#27272A", hair: "#09090B", hairStyle: "bald", hoodie: true, mask: true },
];

const HumanSvg: React.FC<{ c: HumanDef }> = ({ c }) => {
  const isAnime = c.hairStyle === "anime";
  return (
    <svg width={200} height={210} viewBox="-100 -100 200 200" style={{ marginTop: 10 }}>
      {/* Back hair for long/ponytail/curly/anime */}
      {c.hairStyle === "long" && <path d="M -46 -22 Q -58 35 -44 62 L 44 62 Q 58 35 46 -22 Z" fill={c.hair} stroke={K.ink} strokeWidth={5} />}
      {c.hairStyle === "curly" && (
        <g fill={c.hair} stroke={K.ink} strokeWidth={4}>
          <circle cx={-40} cy={-16} r={18} />
          <circle cx={40} cy={-16} r={18} />
          <circle cx={-42} cy={8} r={16} />
          <circle cx={42} cy={8} r={16} />
          <circle cx={-26} cy={-44} r={18} />
          <circle cx={26} cy={-44} r={18} />
          <circle cx={0} cy={-50} r={20} />
        </g>
      )}
      {c.hairStyle === "ponytail" && (
        <path d="M 30 -36 Q 64 -26 56 18 Q 44 26 36 8 Z" fill={c.hair} stroke={K.ink} strokeWidth={5} />
      )}
      {c.hairStyle === "bun" && <circle cx={0} cy={-62} r={20} fill={c.hair} stroke={K.ink} strokeWidth={5} />}
      {c.hairStyle === "anime" && <path d="M -46 -18 Q -56 36 -38 60 L 38 60 Q 56 36 46 -18 Z" fill={c.hair} stroke={K.ink} strokeWidth={5} />}

      {/* Hoodie back */}
      {c.hoodie && <path d="M -52 38 Q -58 -62 0 -64 Q 58 -62 52 38 Z" fill={c.shirt} stroke={K.ink} strokeWidth={5} />}

      {/* Body / Torso */}
      <path d="M -44 92 L -38 42 Q -36 24 0 24 Q 36 24 38 42 L 44 92 Z" fill={c.shirt} stroke={K.ink} strokeWidth={5} strokeLinejoin="round" />
      {c.scarf && <path d="M -26 28 Q 0 46 26 28 L 16 54 L -16 54 Z" fill={c.scarf} stroke={K.ink} strokeWidth={4} />}

      {/* Neck */}
      <rect x={-11} y={16} width={22} height={18} rx={6} fill={c.skin} stroke={K.ink} strokeWidth={4} />

      {/* Ears */}
      <circle cx={-40} cy={-10} r={10} fill={c.skin} stroke={K.ink} strokeWidth={4} />
      <circle cx={40} cy={-10} r={10} fill={c.skin} stroke={K.ink} strokeWidth={4} />

      {/* Head */}
      <rect x={-38} y={-50} width={76} height={74} rx={34} fill={c.skin} stroke={K.ink} strokeWidth={5} />

      {/* Mask option */}
      {c.mask ? (
        <g>
          <rect x={-32} y={-42} width={64} height={60} rx={26} fill="#0F172A" stroke="#22D3EE" strokeWidth={4} />
          <path d="M -20 -18 L -8 -14 L -20 -10" fill="none" stroke="#22D3EE" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 20 -18 L 8 -14 L 20 -10" fill="none" stroke="#22D3EE" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -16 4 Q 0 18 16 4" fill="none" stroke="#22D3EE" strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {/* Eyes */}
          {isAnime ? (
            <>
              <ellipse cx={-15} cy={-12} rx={7} ry={10} fill={K.ink} />
              <ellipse cx={15} cy={-12} rx={7} ry={10} fill={K.ink} />
              <circle cx={-13} cy={-16} r={3} fill="#FFF" />
              <circle cx={17} cy={-16} r={3} fill="#FFF" />
            </>
          ) : (
            <>
              <circle cx={-15} cy={-12} r={5.5} fill={K.ink} />
              <circle cx={15} cy={-12} r={5.5} fill={K.ink} />
              <circle cx={-13.5} cy={-14} r={1.8} fill="#FFF" />
              <circle cx={16.5} cy={-14} r={1.8} fill="#FFF" />
            </>
          )}
          {/* Eyebrows */}
          <path d="M -23 -24 Q -15 -28 -8 -24" fill="none" stroke={K.ink} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 8 -24 Q 15 -28 23 -24" fill="none" stroke={K.ink} strokeWidth={3.5} strokeLinecap="round" />

          {/* Beard / Mustache */}
          {c.beard && <path d="M -34 -2 Q -34 26 0 26 Q 34 26 34 -2 Q 24 8 0 8 Q -24 8 -34 -2 Z" fill={c.hair} opacity={0.85} />}
          {c.mustache && <path d="M -16 2 Q -8 -4 0 2 Q 8 -4 16 2" fill="none" stroke={c.hair} strokeWidth={6} strokeLinecap="round" />}

          {/* Mouth */}
          <path d="M -11 8 Q 0 18 11 8" fill="none" stroke={c.beard ? "#FFFDF7" : K.ink} strokeWidth={4} strokeLinecap="round" />

          {/* Glasses */}
          {c.glasses === "round" && (
            <g fill="none" stroke={K.ink} strokeWidth={3.8}>
              <circle cx={-16} cy={-12} r={12} fill="rgba(255,255,255,0.2)" />
              <circle cx={16} cy={-12} r={12} fill="rgba(255,255,255,0.2)" />
              <line x1={-4} y1={-12} x2={4} y2={-12} />
            </g>
          )}
          {c.glasses === "square" && (
            <g fill="none" stroke={K.ink} strokeWidth={3.8}>
              <rect x={-29} y={-22} width={25} height={18} rx={4} fill="rgba(56,189,248,0.18)" />
              <rect x={4} y={-22} width={25} height={18} rx={4} fill="rgba(56,189,248,0.18)" />
              <line x1={-4} y1={-13} x2={4} y2={-13} />
            </g>
          )}
          {c.glasses === "shades" && (
            <g stroke={K.ink} strokeWidth={3.5}>
              <rect x={-30} y={-22} width={26} height={18} rx={5} fill="#0F172A" />
              <rect x={4} y={-22} width={26} height={18} rx={5} fill="#0F172A" />
              <line x1={-4} y1={-14} x2={4} y2={-14} />
            </g>
          )}
        </g>
      )}

      {/* Front Hair */}
      {c.hairStyle === "short" && !c.hoodie && (
        <path d="M -39 -22 Q -40 -58 0 -58 Q 40 -58 39 -22 Q 20 -38 0 -34 Q -20 -38 -39 -22 Z" fill={c.hair} stroke={K.ink} strokeWidth={4.5} />
      )}
      {c.hairStyle === "spiky" && (
        <path d="M -39 -20 L -42 -48 L -22 -42 L -10 -64 L 4 -44 L 22 -62 L 32 -42 L 44 -48 L 38 -20 Q 16 -36 0 -32 Q -18 -36 -39 -20 Z" fill={c.hair} stroke={K.ink} strokeWidth={4.5} strokeLinejoin="round" />
      )}
      {(c.hairStyle === "bob" || c.hairStyle === "ponytail" || c.hairStyle === "bun" || c.hairStyle === "long" || c.hairStyle === "anime") && (
        <path d="M -40 -18 Q -42 -58 0 -58 Q 42 -58 40 -18 Q 22 -40 0 -32 Q -22 -40 -40 -18 Z" fill={c.hair} stroke={K.ink} strokeWidth={4.5} />
      )}

      {/* Goggles on forehead */}
      {c.glasses === "goggles" && (
        <g stroke={K.ink} strokeWidth={4}>
          <rect x={-30} y={-46} width={24} height={16} rx={6} fill="#BAE6FD" />
          <rect x={6} y={-46} width={24} height={16} rx={6} fill="#BAE6FD" />
          <line x1={-6} y1={-38} x2={6} y2={-38} />
        </g>
      )}

      {/* Hats */}
      {c.hat === "beanie" && (
        <path d="M -40 -26 Q -42 -66 0 -66 Q 42 -66 40 -26 Z" fill="#EF4444" stroke={K.ink} strokeWidth={5} />
      )}
      {c.hat === "cap" && (
        <g>
          <path d="M -40 -28 Q -38 -64 0 -64 Q 38 -64 40 -28 Z" fill="#2563EB" stroke={K.ink} strokeWidth={5} />
          <rect x={10} y={-34} width={44} height={10} rx={5} fill="#1D4ED8" stroke={K.ink} strokeWidth={4} />
        </g>
      )}
      {c.hat === "detective" && (
        <g>
          <path d="M -32 -32 L -24 -62 L 24 -62 L 32 -32 Z" fill="#57534E" stroke={K.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-32} rx={50} ry={10} fill="#44403C" stroke={K.ink} strokeWidth={4.5} />
        </g>
      )}
      {c.hat === "beret" && (
        <ellipse cx={-6} cy={-46} rx={40} ry={18} fill="#18181B" stroke={K.ink} strokeWidth={4.5} transform="rotate(-12)" />
      )}
      {c.hat === "safari" && (
        <g>
          <path d="M -30 -34 L -20 -60 L 20 -60 L 30 -34 Z" fill="#A16207" stroke={K.ink} strokeWidth={5} />
          <ellipse cx={0} cy={-34} rx={54} ry={10} fill="#CA8A04" stroke={K.ink} strokeWidth={4.5} />
        </g>
      )}
      {c.hat === "helmet" && (
        <circle cx={0} cy={-14} r={54} fill="rgba(186, 230, 253, 0.28)" stroke="#FFFDF7" strokeWidth={5} />
      )}

      {/* Headphones */}
      {c.headphones && (
        <g>
          <path d="M -44 -14 Q -46 -64 0 -64 Q 46 -64 44 -14" fill="none" stroke={c.headphones} strokeWidth={8} strokeLinecap="round" />
          <rect x={-52} y={-24} width={14} height={28} rx={7} fill={c.headphones} stroke={K.ink} strokeWidth={4} />
          <rect x={38} y={-24} width={14} height={28} rx={7} fill={c.headphones} stroke={K.ink} strokeWidth={4} />
        </g>
      )}
    </svg>
  );
};

export const KarakterVitrini: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "#F4ECDC",
        padding: 40,
        display: "flex",
        flexDirection: "column",
        fontFamily: sans,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: slab, fontSize: 50, fontWeight: 900, color: K.ink }}>20 İNSAN & TREND KARAKTER ÖNERİSİ</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#6B5E4E" }}>Numarasını seç — tüm ifadeleriyle kanalımıza özel canlandıralım</div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          gap: 22,
          flex: 1,
        }}
      >
        {HUMAN_CHARS.map((c) => {
          const dark = ["#0F172A", "#1E293B", "#1E1B4B", "#1A103D", "#111827", "#27272A", "#09090B"].includes(c.bg);
          return (
            <div
              key={c.id}
              style={{
                background: c.bg,
                borderRadius: 24,
                border: `5px solid ${K.ink}`,
                boxShadow: "0 8px 0 rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 12px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 12,
                  background: K.ink,
                  color: "#FFF",
                  fontWeight: 900,
                  fontSize: 22,
                  padding: "4px 12px",
                  borderRadius: 999,
                }}
              >
                #{c.id}
              </div>
              <HumanSvg c={c} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: slab, fontSize: 30, fontWeight: 900, color: dark ? "#FFFFFF" : K.ink }}>{c.name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: dark ? "#CBD5E1" : "#6B5E4E" }}>{c.tag}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
