import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame } from "remotion";
import { OutlineBox, TileFloor } from "./world";

/** Hafif önbellekli Canvas ürün etiketi */
function makeLabelTex(bg: string, stripe: string, label: string, fg = "#FFFFFF"): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 86, 256, 84);
  ctx.fillStyle = fg;
  ctx.font = "900 54px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 130);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 3D Yüzeye Net Yazılı Tabela */
const SignPlate: React.FC<{
  position: [number, number, number];
  size: [number, number];
  text: string;
  bg: string;
  fg: string;
  fontSize?: number;
}> = ({ position, size, text, bg, fg, fontSize = 72 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = "#161616";
    ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, 1006, 238);
    ctx.fillStyle = fg;
    ctx.font = `900 ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 130);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, bg, fg, fontSize]);

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
};

/** Konturlu 3D Silindir (Kola kutusu / şişe için) */
const OutlineCylinder: React.FC<{
  position: [number, number, number];
  radius: number;
  height: number;
  color: string;
  map?: THREE.Texture;
}> = ({ position, radius, height, color, map }) => {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.CylinderGeometry(radius, radius, height, 14)), [radius, height]);
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 14]} />
        <meshStandardMaterial color={map ? "#FFFFFF" : color} map={map} roughness={0.55} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#161616" />
      </lineSegments>
    </group>
  );
};

/** Gerçekçi Stilize 3D Market Ürünleri (Süt, Cips, Kola, Çikolata, Ekmek) */
const GroceryProduct3D: React.FC<{ kind: "milk" | "chips" | "cola" | "choco" | "bread"; position: [number, number, number] }> = ({
  kind,
  position,
}) => {
  const tex = useMemo(() => {
    if (kind === "milk") return makeLabelTex("#FFFFFF", "#2563EB", "SÜT", "#FFFFFF");
    if (kind === "chips") return makeLabelTex("#FACC15", "#DC2626", "CİPS", "#FFFFFF");
    if (kind === "cola") return makeLabelTex("#DC2626", "#161616", "KOLA", "#FFFFFF");
    if (kind === "choco") return makeLabelTex("#78350F", "#F59E0B", "ÇİKO", "#161616");
    return makeLabelTex("#D97706", "#B45309", "EKMEK", "#FFFBEB");
  }, [kind]);

  if (kind === "milk") {
    return (
      <group position={position}>
        <OutlineBox args={[0.18, 0.28, 0.18]} position={[0, 0, 0]} color="#FFFFFF" map={tex} />
        <OutlineBox args={[0.18, 0.08, 0.12]} position={[0, 0.17, 0]} color="#2563EB" rotation={[0.45, 0, 0]} />
      </group>
    );
  }
  if (kind === "cola") {
    return <OutlineCylinder position={position} radius={0.09} height={0.25} color="#DC2626" map={tex} />;
  }
  if (kind === "chips") {
    return <OutlineBox args={[0.21, 0.29, 0.12]} position={position} color="#FACC15" map={tex} />;
  }
  if (kind === "choco") {
    return <OutlineBox args={[0.24, 0.18, 0.15]} position={position} color="#78350F" map={tex} />;
  }
  return (
    <group position={position}>
      <OutlineBox args={[0.3, 0.18, 0.18]} position={[0, 0, 0]} color="#D97706" map={tex} />
      <OutlineBox args={[0.26, 0.07, 0.14]} position={[0, 0.11, 0]} color="#F59E0B" />
    </group>
  );
};

/** 3D Raf Tahtalı & Tam Türkçe Etiketli 4 Katlı Market Rafı */
const MarketShelf: React.FC<{ position: [number, number, number]; length?: number; side?: "left" | "right" }> = ({
  position,
  length = 6.0,
  side = "left",
}) => {
  const items = 8;
  const dir = side === "left" ? 1 : -1;
  const palette = useMemo(
    () => [
      makeLabelTex("#FFFFFF", "#2563EB", "SÜT", "#FFFFFF"),
      makeLabelTex("#16A34A", "#FFFFFF", "ÇAY", "#161616"),
      makeLabelTex("#FACC15", "#DC2626", "CİPS", "#FFFFFF"),
      makeLabelTex("#E63946", "#FFFFFF", "SOS", "#161616"),
      makeLabelTex("#78350F", "#F59E0B", "KAHVE", "#161616"),
      makeLabelTex("#F8FAFC", "#DC2626", "UN", "#FFFFFF"),
    ],
    [],
  );

  return (
    <group position={position}>
      {/* Arka raf gövdesi */}
      <OutlineBox args={[0.72, 3.15, length]} position={[-dir * 0.12, 1.575, 0]} color="#E5DED0" outlineColor="#161616" />
      {[0.55, 1.25, 1.95, 2.65].map((ry, row) => (
        <group key={`row-${row}`}>
          {/* Siyah konturlu 3D raf tahtası (ürünler havada veya duvara yapışık durmaz!) */}
          <OutlineBox args={[0.56, 0.06, length + 0.04]} position={[dir * 0.34, ry - 0.21, 0]} color="#D6CEC0" outlineColor="#161616" />
          {Array.from({ length: items }).map((_, i) => {
            const z = -length / 2 + 0.4 + i * ((length - 0.8) / (items - 1));
            if ((row + i) % 3 === 1) {
              return (
                <OutlineCylinder
                  key={`${row}-${i}`}
                  position={[dir * 0.36, ry, z]}
                  radius={0.13}
                  height={0.36}
                  color={i % 2 === 0 ? "#DC2626" : "#2563EB"}
                />
              );
            }
            const h = 0.34;
            return (
              <OutlineBox
                key={`${row}-${i}`}
                args={[0.38, h, 0.44]}
                position={[dir * 0.36, ry, z]}
                color="#FFFFFF"
                map={palette[(row * 2 + i) % palette.length]}
              />
            );
          })}
        </group>
      ))}
    </group>
  );
};

/** Metal Kafesli 3D Market Arabası (Ürünler kafes merkezine tam oturur) */
export const Cart3D: React.FC<{
  position?: [number, number, number];
  scale?: number;
  rotationY?: number;
  dropProgress?: number;
}> = ({ position = [0, 0, 0], scale = 1, rotationY = 0, dropProgress = 0 }) => {
  // Sepet içi net koordinatlar: X [-0.15, +0.15], Z [-0.20, +0.14], targetY = 0.67
  const dropItems: { kind: "milk" | "chips" | "cola" | "choco"; x: number; z: number; targetY: number }[] = [
    { kind: "milk", x: -0.14, z: -0.18, targetY: 0.66 },
    { kind: "chips", x: 0.13, z: -0.16, targetY: 0.67 },
    { kind: "cola", x: -0.13, z: 0.12, targetY: 0.64 },
    { kind: "choco", x: 0.14, z: 0.13, targetY: 0.62 },
  ];

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {[
        [-0.32, 0.09, -0.45],
        [0.32, 0.09, -0.45],
        [-0.32, 0.09, 0.45],
        [0.32, 0.09, 0.45],
      ].map(([wx, wy, wz], i) => (
        <OutlineBox key={i} args={[0.11, 0.18, 0.18]} position={[wx, wy, wz]} color="#161616" outlineColor="#000000" />
      ))}
      <OutlineBox args={[0.74, 0.08, 1.06]} position={[0, 0.22, 0]} color="#94A3B8" outlineColor="#161616" />
      <OutlineBox args={[0.76, 0.06, 1.04]} position={[0, 0.48, -0.02]} color="#CBD5E1" outlineColor="#161616" />

      {[-0.38, 0.38].map((sx, si) =>
        [-0.44, -0.22, 0, 0.22, 0.44].map((sz, zi) => (
          <OutlineBox key={`v-${si}-${zi}`} args={[0.04, 0.56, 0.04]} position={[sx, 0.76, sz]} color="#CBD5E1" outlineColor="#161616" />
        )),
      )}
      {[-0.24, 0, 0.24].map((fx, fi) => (
        <OutlineBox key={`f-${fi}`} args={[0.04, 0.56, 0.04]} position={[fx, 0.76, -0.52]} color="#CBD5E1" outlineColor="#161616" />
      ))}
      {[0.68, 1.02].map((hy, hi) => (
        <group key={`h-${hi}`}>
          <OutlineBox args={[0.05, 0.05, 1.06]} position={[-0.38, hy, -0.01]} color="#94A3B8" outlineColor="#161616" />
          <OutlineBox args={[0.05, 0.05, 1.06]} position={[0.38, hy, -0.01]} color="#94A3B8" outlineColor="#161616" />
          <OutlineBox args={[0.8, 0.05, 0.05]} position={[0, hy, -0.52]} color="#94A3B8" outlineColor="#161616" />
          <OutlineBox args={[0.8, 0.05, 0.05]} position={[0, hy, 0.48]} color="#94A3B8" outlineColor="#161616" />
        </group>
      ))}

      <OutlineBox args={[0.86, 0.1, 0.1]} position={[0, 1.12, 0.58]} color="#D62828" outlineColor="#161616" />
      <OutlineBox args={[0.07, 0.36, 0.07]} position={[-0.36, 0.94, 0.53]} color="#64748B" outlineColor="#161616" />
      <OutlineBox args={[0.07, 0.36, 0.07]} position={[0.36, 0.94, 0.53]} color="#64748B" outlineColor="#161616" />

      {dropItems.map((it, idx) => {
        const p = Math.min(1, Math.max(0, dropProgress - idx));
        if (p <= 0) return null;
        const y = interpolate(p, [0, 1], [2.3, it.targetY]);
        return <GroceryProduct3D key={idx} kind={it.kind} position={[it.x, y, it.z]} />;
      })}
    </group>
  );
};

/** Gece Dış Otopark + Sıcak Krem Market İçi + Dinamik Kasa Ekranı */
export const MarketWorld: React.FC<{ checkoutText?: string; checkoutBg?: string }> = ({
  checkoutText = "840,00 ₺",
  checkoutBg = "#DC2626",
}) => {
  const frame = useCurrentFrame();
  const doorSlide = Math.min(1, Math.max(0, (frame - 14) / 34)) * 1.15;

  return (
    <group>
      <ambientLight intensity={0.95} color="#FFF8EE" />
      <directionalLight position={[4, 10, 8]} intensity={1.15} color="#FFFBEB" />
      <pointLight position={[0, 3.6, -7.5]} intensity={2.0} color="#BAE6FD" distance={12} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 18]}>
        <planeGeometry args={[28, 18]} />
        <meshStandardMaterial color="#1E293B" roughness={0.9} />
      </mesh>
      {[-3.2, 0, 3.2].map((px, i) => (
        <OutlineBox key={`park-${i}`} args={[0.14, 0.02, 4.5]} position={[px, 0.01, 15.2]} color="#E2E8F0" outlineColor="#1E293B" />
      ))}

      {/* İnce derz çizgili kare fayans zemin */}
      <TileFloor width={12} depth={22} positionZ={-0.8} />
      <OutlineBox args={[12, 0.2, 22]} position={[0, 4.5, -0.8]} color="#FAF6F0" outlineColor="#161616" />

      {[-7, -2.5, 2, 6.5].map((lz, i) => (
        <OutlineBox key={i} args={[3.0, 0.1, 0.5]} position={[0, 4.35, lz]} color="#FFFFFF" emissive="#FEF9C3" emissiveIntensity={0.85} outlineColor="#161616" />
      ))}

      <OutlineBox args={[0.3, 4.5, 22]} position={[-5.6, 2.25, -0.8]} color="#F4EDE2" outlineColor="#161616" />
      <OutlineBox args={[0.3, 4.5, 22]} position={[5.6, 2.25, -0.8]} color="#F4EDE2" outlineColor="#161616" />
      <OutlineBox args={[0.34, 0.38, 22]} position={[-5.56, 3.65, -0.8]} color="#D62828" outlineColor="#161616" />
      <OutlineBox args={[0.34, 0.38, 22]} position={[5.56, 3.65, -0.8]} color="#D62828" outlineColor="#161616" />

      {/* Arka Duvar & Işıklı Süt / Ekmek Dolabı */}
      <OutlineBox args={[11.4, 4.5, 0.4]} position={[0, 2.25, -10.8]} color="#F4EDE2" outlineColor="#161616" />
      <OutlineBox args={[11.4, 0.38, 0.44]} position={[0, 3.65, -10.76]} color="#D62828" outlineColor="#161616" />
      <OutlineBox args={[5.8, 3.2, 0.65]} position={[0, 1.6, -10.1]} color="#1E293B" outlineColor="#161616" />
      <OutlineBox args={[5.2, 2.3, 0.16]} position={[0, 1.65, -9.7]} color="#E0F2FE" emissive="#7DD3FC" emissiveIntensity={0.75} opacity={0.9} outlineColor="#161616" />
      <SignPlate position={[0, 3.05, -9.68]} size={[4.6, 0.56]} text="SÜT & EKMEK" bg="#D62828" fg="#FFFFFF" fontSize={110} />
      <GroceryProduct3D kind="milk" position={[-1.4, 1.1, -9.85]} />
      <GroceryProduct3D kind="milk" position={[-0.5, 1.1, -9.85]} />
      <GroceryProduct3D kind="bread" position={[0.6, 1.05, -9.85]} />
      <GroceryProduct3D kind="bread" position={[1.5, 1.05, -9.85]} />

      {/* ÖN CEPHE: Cam Vitrin + Açılan Cam Kapılar + "DİJİTALİZ MARKET 7/24" */}
      <OutlineBox args={[3.2, 3.3, 0.18]} position={[-3.8, 1.65, 9.8]} color="#BAE6FD" opacity={0.35} outlineColor="#161616" />
      <OutlineBox args={[3.2, 3.3, 0.18]} position={[3.8, 1.65, 9.8]} color="#BAE6FD" opacity={0.35} outlineColor="#161616" />
      <OutlineBox args={[1.2, 3.2, 0.14]} position={[-0.62 - doorSlide, 1.6, 9.8]} color="#7DD3FC" opacity={0.42} outlineColor="#161616" />
      <OutlineBox args={[1.2, 3.2, 0.14]} position={[0.62 + doorSlide, 1.6, 9.8]} color="#7DD3FC" opacity={0.42} outlineColor="#161616" />
      <OutlineBox args={[11.4, 1.1, 0.3]} position={[0, 3.95, 9.8]} color="#1E293B" outlineColor="#161616" />
      <SignPlate position={[-0.75, 3.95, 9.98]} size={[4.5, 0.78]} text="DİJİTALİZ MARKET" bg="#D62828" fg="#FFFFFF" fontSize={85} />
      <SignPlate position={[2.35, 3.95, 9.98]} size={[1.5, 0.78]} text="7/24" bg="#FACC15" fg="#161616" fontSize={110} />
      <SignPlate position={[-2.9, 2.2, 9.92]} size={[1.1, 0.45]} text="AÇIK" bg="#DC2626" fg="#FFFFFF" fontSize={110} />

      {/* İki Yanda 3D Raf Tahtalı & Türkçe Etiketli Raflar */}
      <MarketShelf position={[-2.75, 0, -4.0]} length={6.2} side="left" />
      <MarketShelf position={[2.75, 0, -4.0]} length={6.2} side="right" />
      <MarketShelf position={[-2.75, 0, 2.8]} length={5.0} side="left" />
      <MarketShelf position={[2.75, 0, 2.8]} length={5.0} side="right" />

      {/* KASA TEZGÂHI (Sağ ön köşe z = 7.8) + Dinamik 15 -> 240 -> 840 TL Dijital Ekran */}
      <group position={[3.1, 0, 7.8]} rotation={[0, -Math.PI / 2, 0]}>
        <OutlineBox args={[2.5, 1.05, 1.1]} position={[0, 0.525, 0]} color="#78350F" outlineColor="#161616" />
        <OutlineBox args={[2.6, 0.12, 1.2]} position={[0, 1.08, 0]} color="#94A3B8" outlineColor="#161616" />
        <OutlineBox args={[0.82, 0.5, 0.52]} position={[0.45, 1.39, 0]} color="#1E293B" outlineColor="#161616" />
        <SignPlate position={[0.45, 1.44, 0.27]} size={[0.7, 0.3]} text={checkoutText} bg={checkoutBg} fg="#FFFFFF" fontSize={130} />
      </group>
    </group>
  );
};
