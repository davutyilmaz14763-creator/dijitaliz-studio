import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { OutlineBox, TileFloor } from "./world";

const SHELF_COLORS = ["#E63946", "#2563EB", "#FACC15", "#16A34A", "#F97316", "#9333EA"];

/** Rengârenk ürün kutularıyla dolu 4 katlı konturlu 3D market rafı */
const MarketShelf: React.FC<{ position: [number, number, number]; length?: number; side?: "left" | "right" }> = ({
  position,
  length = 6.0,
  side = "left",
}) => {
  const items = 9;
  const dir = side === "left" ? 1 : -1;
  return (
    <group position={position}>
      {/* Ana raf gövdesi */}
      <OutlineBox args={[0.95, 3.1, length]} position={[0, 1.55, 0]} color="#E5DED0" outlineColor="#161616" />
      {/* 4 Katlı Renkli Ürün Kutuları */}
      {[0.55, 1.25, 1.95, 2.65].map((ry, row) =>
        Array.from({ length: items }).map((_, i) => {
          const z = -length / 2 + 0.36 + i * ((length - 0.72) / (items - 1));
          const col = SHELF_COLORS[(row * 2 + i) % SHELF_COLORS.length];
          const h = 0.34 + ((i + row) % 3) * 0.08;
          return <OutlineBox key={`${row}-${i}`} args={[0.42, h, 0.44]} position={[dir * 0.34, ry, z]} color={col} outlineColor="#161616" />;
        }),
      )}
    </group>
  );
};

/** Gerçekçi Stilize Metal Kafesli 3D Market Arabası + Düşen Ürün Animasyonu */
export const Cart3D: React.FC<{
  position?: [number, number, number];
  scale?: number;
  rotationY?: number;
  dropProgress?: number; // 0..4 arası düşen ürün sayısı (ondalıklı düşüş animasyonu)
}> = ({ position = [0, 0, 0], scale = 1, rotationY = 0, dropProgress = 0 }) => {
  const dropItems = [
    { color: "#FACC15", x: -0.16, z: -0.2, h: 0.28, targetY: 0.7 },
    { color: "#E63946", x: 0.16, z: -0.12, h: 0.34, targetY: 0.73 },
    { color: "#2563EB", x: -0.12, z: 0.18, h: 0.26, targetY: 0.69 },
    { color: "#16A34A", x: 0.15, z: 0.22, h: 0.32, targetY: 0.72 },
  ];

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* 4 Siyah Tekerlek */}
      {[
        [-0.32, 0.09, -0.45],
        [0.32, 0.09, -0.45],
        [-0.32, 0.09, 0.45],
        [0.32, 0.09, 0.45],
      ].map(([wx, wy, wz], i) => (
        <OutlineBox key={i} args={[0.11, 0.18, 0.18]} position={[wx, wy, wz]} color="#161616" outlineColor="#000000" />
      ))}
      {/* Alt metal şasi */}
      <OutlineBox args={[0.74, 0.08, 1.06]} position={[0, 0.22, 0]} color="#94A3B8" outlineColor="#161616" />
      {/* Sepet tabanı */}
      <OutlineBox args={[0.76, 0.06, 1.04]} position={[0, 0.48, -0.02]} color="#CBD5E1" outlineColor="#161616" />

      {/* Metal Kafes Yan & Ön/Arka Çubuklar */}
      {[-0.38, 0.38].map((sx, si) =>
        [-0.44, -0.22, 0, 0.22, 0.44].map((sz, zi) => (
          <OutlineBox key={`v-${si}-${zi}`} args={[0.04, 0.56, 0.04]} position={[sx, 0.76, sz]} color="#CBD5E1" outlineColor="#161616" />
        )),
      )}
      {[-0.24, 0, 0.24].map((fx, fi) => (
        <OutlineBox key={`f-${fi}`} args={[0.04, 0.56, 0.04]} position={[fx, 0.76, -0.52]} color="#CBD5E1" outlineColor="#161616" />
      ))}
      {/* Üst & Orta Yatay Çerçeve Çubukları */}
      {[0.68, 1.02].map((hy, hi) => (
        <group key={`h-${hi}`}>
          <OutlineBox args={[0.05, 0.05, 1.06]} position={[-0.38, hy, -0.01]} color="#94A3B8" outlineColor="#161616" />
          <OutlineBox args={[0.05, 0.05, 1.06]} position={[0.38, hy, -0.01]} color="#94A3B8" outlineColor="#161616" />
          <OutlineBox args={[0.8, 0.05, 0.05]} position={[0, hy, -0.52]} color="#94A3B8" outlineColor="#161616" />
          <OutlineBox args={[0.8, 0.05, 0.05]} position={[0, hy, 0.48]} color="#94A3B8" outlineColor="#161616" />
        </group>
      ))}

      {/* Kırmızı İtme Kolu */}
      <OutlineBox args={[0.86, 0.1, 0.1]} position={[0, 1.12, 0.58]} color="#D62828" outlineColor="#161616" />
      <OutlineBox args={[0.07, 0.36, 0.07]} position={[-0.36, 0.94, 0.53]} color="#64748B" outlineColor="#161616" />
      <OutlineBox args={[0.07, 0.36, 0.07]} position={[0.36, 0.94, 0.53]} color="#64748B" outlineColor="#161616" />

      {/* Sepetin İçine Düşen Renkli Ürün Kutuları */}
      {dropItems.map((it, idx) => {
        const p = Math.min(1, Math.max(0, dropProgress - idx));
        if (p <= 0) return null;
        const y = interpolate(p, [0, 1], [2.4, it.targetY]);
        return <OutlineBox key={idx} args={[0.26, it.h, 0.26]} position={[it.x, y, it.z]} color={it.color} outlineColor="#161616" />;
      })}
    </group>
  );
};

/** Sıcak Krem + Parlak Kırmızı Şeritli + Rengârenk Raflı Stilize 3D Market Dünyası */
export const MarketWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const doorSlide = Math.min(1, frame / 35) * 0.9;
  return (
    <group>
      {/* Sıcak ve canlı çizgi dizi aydınlatması */}
      <ambientLight intensity={0.95} color="#FFF8EE" />
      <directionalLight position={[4, 10, 8]} intensity={1.15} color="#FFFBEB" />
      <pointLight position={[0, 3.6, -7.5]} intensity={2.0} color="#BAE6FD" distance={12} />

      {/* Açık Bej/Krem Kare Fayans Zemin & Parlak Tavan */}
      <TileFloor width={20} depth={30} color="#EDE4D3" gridColor="#C8BBA6" />
      <OutlineBox args={[16, 0.2, 26]} position={[0, 4.5, -1]} color="#FAF6F0" outlineColor="#161616" />

      {/* Tavan Floresan Işıkları */}
      {[-7, -2.5, 2, 6.5].map((lz, i) => (
        <OutlineBox key={i} args={[3.0, 0.1, 0.5]} position={[0, 4.35, lz]} color="#FFFFFF" emissive="#FEF9C3" emissiveIntensity={0.85} outlineColor="#161616" />
      ))}

      {/* Sıcak Krem Duvarlar + Üst Boyunca Parlak Kırmızı Market Şeridi */}
      <OutlineBox args={[0.3, 4.5, 26]} position={[-5.6, 2.25, -1]} color="#F4EDE2" outlineColor="#161616" />
      <OutlineBox args={[0.3, 4.5, 26]} position={[5.6, 2.25, -1]} color="#F4EDE2" outlineColor="#161616" />
      <OutlineBox args={[0.34, 0.38, 26]} position={[-5.56, 3.65, -1]} color="#D62828" outlineColor="#161616" />
      <OutlineBox args={[0.34, 0.38, 26]} position={[5.56, 3.65, -1]} color="#D62828" outlineColor="#161616" />

      {/* Arka Duvar & Parlak Işıklı Süt / Ekmek Soğutucu Dolabı (z = -10.5) */}
      <OutlineBox args={[11.4, 4.5, 0.4]} position={[0, 2.25, -10.8]} color="#F4EDE2" outlineColor="#161616" />
      <OutlineBox args={[11.4, 0.38, 0.44]} position={[0, 3.65, -10.76]} color="#D62828" outlineColor="#161616" />
      <OutlineBox args={[5.8, 3.2, 0.65]} position={[0, 1.6, -10.1]} color="#1E293B" outlineColor="#161616" />
      <OutlineBox args={[5.2, 2.3, 0.16]} position={[0, 1.65, -9.7]} color="#E0F2FE" emissive="#7DD3FC" emissiveIntensity={0.75} opacity={0.9} outlineColor="#161616" />
      {/* Dolap üstü kırmızı/sarı SÜT & EKMEK tabelası */}
      <OutlineBox args={[4.4, 0.46, 0.2]} position={[0, 3.05, -9.72]} color="#D62828" outlineColor="#161616" />
      {/* Dolap içi süt & ekmek blokları */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((mx, i) => (
        <OutlineBox key={i} args={[0.45, 0.68, 0.35]} position={[mx, 1.15, -9.85]} color={i % 2 === 0 ? "#FFFFFF" : "#F59E0B"} outlineColor="#161616" />
      ))}

      {/* Market Cam Giriş Kapısı + Kırmızı "MARKET 7/24" Dış Tabelası (z = +9.8) */}
      <OutlineBox args={[2.1, 3.2, 0.14]} position={[-1.05 - doorSlide, 1.6, 9.8]} color="#BAE6FD" opacity={0.42} outlineColor="#161616" />
      <OutlineBox args={[2.1, 3.2, 0.14]} position={[1.05 + doorSlide, 1.6, 9.8]} color="#BAE6FD" opacity={0.42} outlineColor="#161616" />
      <OutlineBox args={[6.4, 0.72, 0.28]} position={[0, 3.7, 9.8]} color="#D62828" outlineColor="#161616" />
      <OutlineBox args={[1.8, 0.56, 0.32]} position={[1.8, 3.7, 9.82]} color="#FACC15" outlineColor="#161616" />

      {/* İki Yanda Rengârenk Ürünlerle Dolu 3D Koridor Rafları */}
      <MarketShelf position={[-2.75, 0, -4.0]} length={6.2} side="left" />
      <MarketShelf position={[2.75, 0, -4.0]} length={6.2} side="right" />
      <MarketShelf position={[-2.75, 0, 3.2]} length={5.4} side="left" />
      <MarketShelf position={[2.75, 0, 3.2]} length={5.4} side="right" />
    </group>
  );
};
