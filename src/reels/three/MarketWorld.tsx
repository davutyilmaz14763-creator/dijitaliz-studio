import React from "react";
import { OutlineBox, TileFloor } from "./world";

const SHELF_COLORS = ["#EF4444", "#3B82F6", "#FACC15", "#22C55E", "#F97316", "#A855F7"];

/** Renkli ürün dizili 3D market rafı */
const MarketShelf: React.FC<{ position: [number, number, number]; length?: number }> = ({ position, length = 5.2 }) => {
  const items = 7;
  return (
    <group position={position}>
      {/* Ana raf gövdesi */}
      <OutlineBox args={[0.9, 2.5, length]} position={[0, 1.25, 0]} color="#CBD5E1" />
      {/* 3 Katlı Renkli Ürün Kutuları */}
      {[0.65, 1.35, 2.05].map((ry, row) =>
        Array.from({ length: items }).map((_, i) => {
          const z = -length / 2 + 0.42 + i * ((length - 0.84) / (items - 1));
          const col = SHELF_COLORS[(row * 3 + i) % SHELF_COLORS.length];
          return <OutlineBox key={`${row}-${i}`} args={[0.42, 0.36, 0.44]} position={[0.32, ry, z]} color={col} />;
        }),
      )}
    </group>
  );
};

/** Stilize 3D Market Alışveriş Arabası (veya 1937 Küçük Sepeti) */
export const Cart3D: React.FC<{
  position?: [number, number, number];
  scale?: number;
  rotationY?: number;
  filled?: number; // 0..4 ürün
}> = ({ position = [0, 0, 0], scale = 1, rotationY = 0, filled = 0 }) => (
  <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
    {/* 4 Tekerlek */}
    {[
      [-0.32, 0.08, -0.45],
      [0.32, 0.08, -0.45],
      [-0.32, 0.08, 0.45],
      [0.32, 0.08, 0.45],
    ].map(([wx, wy, wz], i) => (
      <OutlineBox key={i} args={[0.1, 0.16, 0.16]} position={[wx, wy, wz]} color="#1E293B" />
    ))}
    {/* Alt şasi */}
    <OutlineBox args={[0.72, 0.08, 1.05]} position={[0, 0.22, 0]} color="#94A3B8" />
    {/* Sepet gövdesi */}
    <OutlineBox args={[0.78, 0.56, 1.08]} position={[0, 0.62, -0.02]} color="#CBD5E1" opacity={0.86} />
    {/* Kırmızı itme kolu */}
    <OutlineBox args={[0.84, 0.09, 0.1]} position={[0, 1.02, 0.56]} color="#EF4444" />
    <OutlineBox args={[0.07, 0.38, 0.07]} position={[-0.36, 0.84, 0.52]} color="#64748B" />
    <OutlineBox args={[0.07, 0.38, 0.07]} position={[0.36, 0.84, 0.52]} color="#64748B" />
    {/* Sepet içi ürünler */}
    {filled >= 1 && <OutlineBox args={[0.28, 0.28, 0.28]} position={[-0.16, 0.68, -0.2]} color="#FACC15" />}
    {filled >= 2 && <OutlineBox args={[0.26, 0.34, 0.26]} position={[0.16, 0.72, -0.1]} color="#EF4444" />}
    {filled >= 3 && <OutlineBox args={[0.3, 0.24, 0.3]} position={[-0.12, 0.72, 0.18]} color="#3B82F6" />}
    {filled >= 4 && <OutlineBox args={[0.24, 0.3, 0.24]} position={[0.15, 0.76, 0.22]} color="#22C55E" />}
  </group>
);

/** Ortak 3D Süpermarket Dünyası */
export const MarketWorld: React.FC = () => (
  <group>
    <ambientLight intensity={0.78} />
    <directionalLight position={[5, 9, 6]} intensity={0.95} />
    <pointLight position={[0, 3.6, -7]} intensity={1.8} color="#38BDF8" distance={10} />

    {/* Fayans Zemin & Tavan */}
    <TileFloor width={18} depth={26} color="#E2E8F0" gridColor="#94A3B8" />
    <OutlineBox args={[16, 0.2, 24]} position={[0, 4.4, 0]} color="#F8FAFC" />

    {/* Tavan Floresan Işıkları */}
    {[-6, -1.5, 3, 7.5].map((lz, i) => (
      <OutlineBox key={i} args={[2.8, 0.1, 0.45]} position={[0, 4.25, lz]} color="#FFFFFF" emissive="#E0F2FE" emissiveIntensity={0.85} />
    ))}

    {/* Sol & Sağ Duvarlar */}
    <OutlineBox args={[0.3, 4.4, 24]} position={[-5.6, 2.2, 0]} color="#F1F5F9" />
    <OutlineBox args={[0.3, 4.4, 24]} position={[5.6, 2.2, 0]} color="#F1F5F9" />
    {/* Kırmızı duvar şeridi (@sonpart.dizi stili) */}
    <OutlineBox args={[0.34, 0.32, 24]} position={[-5.58, 3.3, 0]} color="#DC2626" />
    <OutlineBox args={[0.34, 0.32, 24]} position={[5.58, 3.3, 0]} color="#DC2626" />

    {/* Arka Duvar & Işıklı Süt / Ekmek Soğutucu Dolabı (z = -10) */}
    <OutlineBox args={[11.4, 4.4, 0.4]} position={[0, 2.2, -10.5]} color="#1E293B" />
    <OutlineBox args={[5.4, 3.0, 0.6]} position={[0, 1.5, -9.9]} color="#0F172A" />
    <OutlineBox args={[4.8, 2.2, 0.15]} position={[0, 1.55, -9.55]} color="#E0F2FE" emissive="#38BDF8" emissiveIntensity={0.6} opacity={0.88} />
    {/* Dolap içi süt & ekmek blokları */}
    {[-1.6, -0.8, 0, 0.8, 1.6].map((mx, i) => (
      <OutlineBox key={i} args={[0.42, 0.62, 0.32]} position={[mx, 1.1, -9.7]} color={i % 2 === 0 ? "#FFFFFF" : "#F59E0B"} />
    ))}

    {/* Cam Giriş Kapısı (z = +10) */}
    <OutlineBox args={[4.4, 3.3, 0.16]} position={[0, 1.65, 10]} color="#7DD3FC" opacity={0.35} />
    <OutlineBox args={[5.2, 0.65, 0.25]} position={[0, 3.6, 10]} color="#1E3A8A" />

    {/* Koridor Rafları (Sol & Sağ) */}
    <MarketShelf position={[-2.9, 0, -3.5]} length={5.5} />
    <MarketShelf position={[2.9, 0, -3.5]} length={5.5} />
    <MarketShelf position={[-2.9, 0, 3.2]} length={4.8} />

    {/* Kasa Tezgâhı (Sağ ön, z = 4.2) */}
    <OutlineBox args={[1.6, 1.05, 3.2]} position={[3.2, 0.525, 4.2]} color="#78350F" />
    <OutlineBox args={[1.7, 0.12, 3.3]} position={[3.2, 1.08, 4.2]} color="#94A3B8" />
    <OutlineBox args={[0.55, 0.42, 0.5]} position={[3.1, 1.35, 3.5]} color="#1E293B" />
  </group>
);
