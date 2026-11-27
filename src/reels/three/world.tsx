import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";

export type ArdaPose = "front" | "back" | "pushCart" | "holdReceipt" | "closeupShock";

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
  map?: THREE.Texture;
}> = ({
  position = [0, 0, 0],
  args,
  color,
  outlineColor = "#161616",
  rotation = [0, 0, 0],
  emissive = "#000000",
  emissiveIntensity = 0,
  opacity = 1,
  map,
}) => {
  const edges = useMemo(() => {
    const box = new THREE.BoxGeometry(args[0], args[1], args[2]);
    return new THREE.EdgesGeometry(box);
  }, [args[0], args[1], args[2]]);

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color={map ? "#FFFFFF" : color}
          map={map}
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

/** İnce Derz Çizgili Açık Bej Kare Fayans Zemin (Canvas Texture) */
export const TileFloor: React.FC<{ width?: number; depth?: number; positionZ?: number }> = ({
  width = 24,
  depth = 28,
  positionZ = 0,
}) => {
  const tileTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#EFE6D5";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#E8DEC9";
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillRect(128, 128, 128, 128);
    ctx.strokeStyle = "#C9BCA6";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeRect(128, 0, 128, 128);
    ctx.strokeRect(0, 128, 128, 128);
    ctx.strokeRect(128, 128, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(width / 1.6, depth / 1.6);
    return t;
  }, [width, depth]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, positionZ]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={tileTex} roughness={0.82} />
    </mesh>
  );
};

/** Deterministik Remotion Frame tabanlı Kayan 3D Kamera */
export const CameraRig: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}> = ({ position, target, fov = 48 }) => {
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

/** Aksiyonlu 2D Arda Aktörü (zıplamasız sağlam duruş, belirgin adım yürüyüşü, yanak hizası ter) */
export const Arda3D: React.FC<{
  position?: [number, number, number];
  camPos?: [number, number, number];
  height?: number;
  pose?: ArdaPose;
  face?: "normal" | "shock" | "happy" | "wink";
  walking?: boolean;
  talking?: boolean;
  sweating?: boolean;
  flip?: boolean;
}> = ({
  position = [0, 0, 0],
  camPos,
  height = 2.0,
  pose = "front",
  face = "normal",
  walking = false,
  talking = false,
  sweating = false,
  flip = false,
}) => {
  const frame = useCurrentFrame();

  const blink = (frame % 90) > 85;
  // Zıplama yok! Yalnızca yürürken çok hafif adım ritmi, dururken sağlam zemin teması
  const bob = walking ? Math.abs(Math.sin(frame / 4)) * 0.018 : 0;
  const breath = !walking ? Math.sin(frame / 14) * 0.01 : 0;
  const stridePhase = walking ? Math.sin(frame / 4) : 0; // -1..+1
  const mouthTalk = talking ? (Math.sin(frame / 2.2) > 0.2 ? 1 : 0) : 0;
  const rotY = camPos ? Math.atan2(camPos[0] - position[0], camPos[2] - position[2]) : 0;
  const activeFace = pose === "closeupShock" ? "shock" : face;
  const showSweat = sweating || pose === "closeupShock";
  const sweatStep = Math.floor((frame % 18) / 6);
  const strideBucket = walking ? Math.round(stridePhase * 5) : 0;

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 680;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 480, 680);
    ctx.save();
    ctx.scale(2, 2); // 240x340

    const ink = "#0F172A";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4.5;

    // Belirgin sol-sağ bacak adım salınımı ve ayakkabı hareketi (yalnızca yürürken)
    const s = strideBucket / 5;
    const liftL = walking ? Math.max(0, s) * 16 : 0;
    const liftR = walking ? Math.max(0, -s) * 16 : 0;
    const shiftL = walking ? s * 6 : 0;
    const shiftR = walking ? -s * 6 : 0;

    // Left leg & shoe
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.roundRect(88 + shiftL * 0.4, 272 - liftL * 0.5, 22, 48 - liftL * 0.3, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(98 + shiftL * 0.5, 323 - liftL, 21, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right leg & shoe
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.roundRect(130 + shiftR * 0.4, 272 - liftR * 0.5, 22, 48 - liftR * 0.3, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(142 + shiftR * 0.5, 323 - liftR, 21, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const armSwing = s * 24;
    const drawArm = (x: number, y: number, angleDeg: number, len = 72) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angleDeg * Math.PI) / 180);
      ctx.fillStyle = "#2B3445";
      ctx.beginPath();
      ctx.roundRect(-11, -6, 22, len, 11);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#3B4659";
      ctx.fillRect(-11, len - 18, 22, 10);
      ctx.strokeRect(-11, len - 18, 22, 10);
      ctx.fillStyle = "#F4C095";
      ctx.beginPath();
      ctx.arc(0, len + 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    if (pose === "back") {
      drawArm(65, 200, 10 + armSwing);
      drawArm(175, 200, -10 - armSwing);

      ctx.fillStyle = "#2B3445";
      ctx.beginPath();
      ctx.moveTo(70, 182);
      ctx.lineTo(170, 182);
      ctx.lineTo(180, 282);
      ctx.lineTo(60, 282);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1E293B";
      ctx.fillRect(66, 222, 108, 12);
      ctx.strokeRect(66, 222, 108, 12);

      ctx.fillStyle = "#3B4659";
      ctx.fillRect(92, 174, 56, 16);
      ctx.strokeRect(92, 174, 56, 16);
      ctx.beginPath();
      ctx.moveTo(120, 234);
      ctx.lineTo(120, 282);
      ctx.stroke();

      ctx.fillStyle = "#E6AE82";
      ctx.fillRect(105, 152, 30, 24);
      ctx.strokeRect(105, 152, 30, 24);
      ctx.fillStyle = "#27201E";
      ctx.beginPath();
      ctx.roundRect(76, 78, 88, 76, 30);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1B2A4A";
      ctx.beginPath();
      ctx.moveTo(78, 78);
      ctx.lineTo(90, 32);
      ctx.quadraticCurveTo(120, 26, 150, 32);
      ctx.lineTo(162, 78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#38BDF8";
      ctx.fillRect(80, 64, 80, 9);
      ctx.fillStyle = "#111C35";
      ctx.beginPath();
      ctx.ellipse(120, 80, 70, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      if (pose === "pushCart") {
        drawArm(76, 198, -56, 72);
        drawArm(168, 198, -70, 76);
      } else if (pose === "holdReceipt") {
        drawArm(65, 200, 14);
        drawArm(174, 200, -52, 68);
      } else if (pose === "closeupShock") {
        drawArm(64, 200, 112);
        drawArm(176, 200, -112);
      } else {
        drawArm(65, 200, 12 + armSwing);
        drawArm(175, 200, -12 - armSwing);
      }

      ctx.fillStyle = "#2B3445";
      ctx.beginPath();
      ctx.moveTo(70, 182);
      ctx.lineTo(170, 182);
      ctx.lineTo(180, 282);
      ctx.lineTo(60, 282);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0B1120";
      ctx.beginPath();
      ctx.moveTo(98, 182);
      ctx.lineTo(120, 222);
      ctx.lineTo(142, 182);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1E293B";
      ctx.fillRect(65, 226, 110, 11);
      ctx.strokeRect(65, 226, 110, 11);
      ctx.fillStyle = "#94A3B8";
      ctx.fillRect(113, 225, 14, 13);
      ctx.strokeRect(113, 225, 14, 13);

      ctx.fillStyle = "#3B4659";
      ctx.beginPath();
      ctx.moveTo(68, 186);
      ctx.lineTo(76, 142);
      ctx.lineTo(100, 184);
      ctx.lineTo(90, 200);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(172, 186);
      ctx.lineTo(164, 142);
      ctx.lineTo(140, 184);
      ctx.lineTo(150, 200);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (pose === "holdReceipt") {
        ctx.save();
        ctx.translate(216, 228);
        ctx.rotate(-0.18);
        ctx.fillStyle = "#FAF8F5";
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(-16, -24, 34, 48, 3);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#64748B";
        ctx.lineWidth = 2;
        for (let ry = -14; ry <= 14; ry += 7) {
          ctx.beginPath();
          ctx.moveTo(-10, ry);
          ctx.lineTo(12, ry);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 4.5;
      }

      ctx.fillStyle = "#E6AE82";
      ctx.fillRect(106, 160, 28, 26);
      ctx.strokeRect(106, 160, 28, 26);
      ctx.fillStyle = "#F4C095";
      ctx.beginPath();
      ctx.ellipse(74, 120, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(166, 120, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F4C095";
      ctx.beginPath();
      ctx.moveTo(76, 82);
      ctx.quadraticCurveTo(76, 66, 120, 66);
      ctx.quadraticCurveTo(164, 66, 164, 82);
      ctx.lineTo(162, 132);
      ctx.quadraticCurveTo(156, 166, 120, 171);
      ctx.quadraticCurveTo(84, 166, 78, 132);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#1E1B18";
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      if (activeFace === "shock") {
        ctx.moveTo(85, 92);
        ctx.quadraticCurveTo(97, 84, 108, 90);
        ctx.moveTo(132, 90);
        ctx.quadraticCurveTo(143, 84, 155, 92);
      } else {
        ctx.moveTo(85, 97);
        ctx.quadraticCurveTo(98, 91, 110, 96);
        ctx.moveTo(130, 96);
        ctx.quadraticCurveTo(142, 91, 155, 97);
      }
      ctx.stroke();

      const ry = blink ? 1.5 : activeFace === "shock" ? 8.5 : 7.2;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(98, 113, 9, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      if (activeFace === "wink") {
        ctx.strokeStyle = "#1E1B18";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(132, 113);
        ctx.quadraticCurveTo(143, 105, 152, 113);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(142, 113, 9, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!blink) {
        ctx.fillStyle = "#1E3A5F";
        ctx.beginPath();
        ctx.arc(99, 113, 4.8, 0, Math.PI * 2);
        ctx.fill();
        if (activeFace !== "wink") {
          ctx.beginPath();
          ctx.arc(143, 113, 4.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = "#9A6B4C";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(119, 116);
      ctx.lineTo(116, 130);
      ctx.quadraticCurveTo(120, 133, 125, 130);
      ctx.stroke();

      ctx.strokeStyle = "#1E1B18";
      ctx.lineWidth = 3.6;
      if (activeFace === "shock") {
        ctx.fillStyle = "#1E293B";
        ctx.beginPath();
        ctx.ellipse(120, 148, 7.5, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (mouthTalk > 0) {
        ctx.fillStyle = "#1E293B";
        ctx.beginPath();
        ctx.ellipse(120, 146, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (activeFace === "happy") {
        ctx.beginPath();
        ctx.moveTo(106, 144);
        ctx.quadraticCurveTo(120, 156, 135, 143);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(108, 146);
        ctx.quadraticCurveTo(122, 152, 134, 143);
        ctx.stroke();
      }

      ctx.strokeStyle = ink;
      ctx.lineWidth = 4;
      ctx.fillStyle = "rgba(56,189,248,0.2)";
      ctx.beginPath();
      ctx.arc(98, 113, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(142, 113, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(115, 112);
      ctx.quadraticCurveTo(120, 108, 125, 112);
      ctx.stroke();

      ctx.fillStyle = "#1B2A4A";
      ctx.beginPath();
      ctx.moveTo(78, 78);
      ctx.lineTo(90, 32);
      ctx.quadraticCurveTo(120, 26, 150, 32);
      ctx.lineTo(162, 78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#38BDF8";
      ctx.fillRect(80, 64, 80, 9);

      ctx.fillStyle = "#111C35";
      ctx.beginPath();
      ctx.moveTo(50, 80);
      ctx.quadraticCurveTo(120, 67, 190, 80);
      ctx.quadraticCurveTo(120, 93, 50, 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ter damlaları şakak/yanak hizasında (şapka üstünde değil!)
      if (showSweat) {
        const dy = sweatStep * 5;
        ctx.fillStyle = "#38BDF8";
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.4;
        for (const sx of [66, 174]) {
          ctx.beginPath();
          ctx.moveTo(sx, 102 + dy);
          ctx.quadraticCurveTo(sx - 6, 114 + dy, sx, 119 + dy);
          ctx.quadraticCurveTo(sx + 6, 114 + dy, sx, 102 + dy);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.restore();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [pose, activeFace, blink, mouthTalk, showSweat, sweatStep, strideBucket]);

  const w = height * (240 / 340);

  return (
    <group
      position={[position[0], position[1] + height / 2 + bob, position[2]]}
      rotation={[pose === "pushCart" ? -0.05 : 0, rotY, 0]}
      scale={[1, 1 + breath, 1]}
    >
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
