import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";

/** Konturlu stilize 3D kutu (cel-shaded / @sonpart.dizi tarzı) */
export const OutlineBox: React.FC<{
  position?: [number, number, number];
  args: [number, number, number];
  color: string;
  outlineColor?: string;
  rotation?: [number, number, number];
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}> = ({
  position = [0, 0, 0],
  args,
  color,
  outlineColor = "#0F172A",
  rotation = [0, 0, 0],
  emissive = "#000000",
  emissiveIntensity = 0,
  opacity = 1,
}) => {
  const edges = useMemo(() => {
    const box = new THREE.BoxGeometry(args[0], args[1], args[2]);
    return new THREE.EdgesGeometry(box);
  }, [args[0], args[1], args[2]]);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.65}
          metalness={0.05}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={outlineColor} />
      </lineSegments>
    </group>
  );
};

/** 3D Fayans Zemin */
export const TileFloor: React.FC<{ width?: number; depth?: number; color?: string; gridColor?: string }> = ({
  width = 24,
  depth = 28,
  color = "#E2E8F0",
  gridColor = "#94A3B8",
}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
    <gridHelper args={[Math.max(width, depth), 24, gridColor, gridColor]} position={[0, 0.006, 0]} />
  </group>
);

/** Deterministik Remotion Frame tabanlı Kayan 3D Kamera */
export const CameraRig: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}> = ({ position, target, fov = 46 }) => {
  const { camera, setSize } = useThree();
  useLayoutEffect(() => {
    setSize(1080, 1920);
    camera.position.set(position[0], position[1], position[2]);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = 1080 / 1920;
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, setSize, position[0], position[1], position[2], target[0], target[1], target[2], fov]);
  return null;
};

/** 3D Uzayda Yaşayan 2D Arda Aktörü (zemine basan konturlu CanvasTexture billboard) */
export const Arda3D: React.FC<{
  position?: [number, number, number];
  height?: number;
  face?: "normal" | "shock" | "happy" | "wink";
  walking?: boolean;
  flip?: boolean;
}> = ({ position = [0, 0, 0], height = 2.0, face = "normal", walking = false, flip = false }) => {
  const frame = useCurrentFrame();

  const blink = (frame % 95) > 90;
  const bob = walking ? Math.abs(Math.sin(frame / 4)) * 0.08 : Math.sin(frame / 10) * 0.02;
  const swing = walking ? Math.sin(frame / 4) * 14 : 0;

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 680;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 480, 680);
    ctx.save();
    ctx.scale(2, 2); // 240x340 coordinate space matching kit.tsx Arda

    const ink = "#0F172A";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // White sticker halo
    ctx.shadowColor = "rgba(255,255,255,0.95)";
    ctx.shadowBlur = 0;

    // Legs
    ctx.fillStyle = "#1E293B";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(88, 276 + (swing > 0 ? -swing * 0.3 : 0), 24, 44, 10);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(128, 276 + (swing < 0 ? swing * 0.3 : 0), 24, 44, 10);
    ctx.fill();
    ctx.stroke();

    // Shoes
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(98, 322, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(142, 322, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    const drawArm = (x: number, angleDeg: number) => {
      ctx.save();
      ctx.translate(x, 202);
      ctx.rotate((angleDeg * Math.PI) / 180);
      ctx.fillStyle = "#2B3445";
      ctx.beginPath();
      ctx.roundRect(-12, -6, 24, 74, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#F4C095";
      ctx.beginPath();
      ctx.arc(0, 74, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawArm(66, 15 + swing);
    drawArm(174, -15 - swing);

    // Charcoal Trenchcoat
    ctx.fillStyle = "#2B3445";
    ctx.beginPath();
    ctx.moveTo(68, 184);
    ctx.lineTo(172, 184);
    ctx.lineTo(182, 284);
    ctx.lineTo(58, 284);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner V-neck
    ctx.fillStyle = "#0B1120";
    ctx.beginPath();
    ctx.moveTo(96, 184);
    ctx.lineTo(120, 224);
    ctx.lineTo(144, 184);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Popped Collar
    ctx.fillStyle = "#3B4659";
    ctx.beginPath();
    ctx.moveTo(66, 188);
    ctx.lineTo(74, 142);
    ctx.lineTo(100, 186);
    ctx.lineTo(90, 202);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(174, 188);
    ctx.lineTo(166, 142);
    ctx.lineTo(140, 186);
    ctx.lineTo(150, 202);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Neck & Ears
    ctx.fillStyle = "#E6AE82";
    ctx.fillRect(105, 162, 30, 28);
    ctx.strokeRect(105, 162, 30, 28);
    ctx.fillStyle = "#F4C095";
    ctx.beginPath();
    ctx.ellipse(72, 120, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(168, 120, 10, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Face
    ctx.fillStyle = "#F4C095";
    ctx.beginPath();
    ctx.moveTo(74, 82);
    ctx.quadraticCurveTo(74, 66, 120, 66);
    ctx.quadraticCurveTo(166, 66, 166, 82);
    ctx.lineTo(164, 132);
    ctx.quadraticCurveTo(158, 166, 120, 172);
    ctx.quadraticCurveTo(82, 166, 76, 132);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eyebrows
    ctx.strokeStyle = "#1E1B18";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    if (face === "shock") {
      ctx.moveTo(84, 94);
      ctx.quadraticCurveTo(96, 86, 108, 92);
      ctx.moveTo(132, 92);
      ctx.quadraticCurveTo(144, 86, 156, 94);
    } else {
      ctx.moveTo(84, 97);
      ctx.quadraticCurveTo(98, 91, 110, 96);
      ctx.moveTo(130, 96);
      ctx.quadraticCurveTo(142, 91, 156, 97);
    }
    ctx.stroke();

    // Eyes
    const ry = blink ? 1.5 : face === "shock" ? 9 : 7.5;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(97, 113, 9.5, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    if (face === "wink") {
      ctx.strokeStyle = "#1E1B18";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(132, 113);
      ctx.quadraticCurveTo(143, 105, 153, 113);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(143, 113, 9.5, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!blink) {
      ctx.fillStyle = "#1E3A5F";
      ctx.beginPath();
      ctx.arc(99, 113, 5, 0, Math.PI * 2);
      ctx.fill();
      if (face !== "wink") {
        ctx.beginPath();
        ctx.arc(145, 113, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Nose & Mouth
    ctx.strokeStyle = "#9A6B4C";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(119, 116);
    ctx.lineTo(116, 131);
    ctx.quadraticCurveTo(120, 134, 125, 131);
    ctx.stroke();

    ctx.strokeStyle = "#1E1B18";
    ctx.lineWidth = 3.8;
    if (face === "shock") {
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.ellipse(120, 148, 7.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (face === "happy") {
      ctx.beginPath();
      ctx.moveTo(105, 144);
      ctx.quadraticCurveTo(120, 158, 136, 143);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(107, 146);
      ctx.quadraticCurveTo(122, 153, 135, 143);
      ctx.stroke();
    }

    // Round Glasses with Cyan Tint
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4.2;
    ctx.fillStyle = "rgba(56,189,248,0.22)";
    ctx.beginPath();
    ctx.arc(97, 113, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(143, 113, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(115, 112);
    ctx.quadraticCurveTo(120, 108, 125, 112);
    ctx.stroke();

    // Navy Fedora with Cyan Band
    ctx.fillStyle = "#1B2A4A";
    ctx.beginPath();
    ctx.moveTo(76, 78);
    ctx.lineTo(88, 30);
    ctx.quadraticCurveTo(120, 24, 152, 30);
    ctx.lineTo(164, 78);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38BDF8";
    ctx.beginPath();
    ctx.moveTo(79, 65);
    ctx.quadraticCurveTo(120, 60, 161, 65);
    ctx.lineTo(163, 75);
    ctx.quadraticCurveTo(120, 70, 77, 75);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#111C35";
    ctx.beginPath();
    ctx.moveTo(48, 80);
    ctx.quadraticCurveTo(120, 66, 192, 80);
    ctx.quadraticCurveTo(120, 94, 48, 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [face, blink, Math.round(swing / 4)]);

  const w = height * (240 / 340);

  return (
    <group position={[position[0], position[1] + height / 2 + bob, position[2]]}>
      {/* Ground shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 - bob + 0.015, 0]}>
        <circleGeometry args={[w * 0.42, 24]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.28} />
      </mesh>
      <mesh scale={[flip ? -1 : 1, 1, 1]}>
        <planeGeometry args={[w, height]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
