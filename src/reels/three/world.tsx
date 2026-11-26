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
}> = ({
  position = [0, 0, 0],
  args,
  color,
  outlineColor = "#161616",
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
export const TileFloor: React.FC<{ width?: number; depth?: number; positionZ?: number; color?: string; gridColor?: string }> = ({
  width = 24,
  depth = 28,
  positionZ = 0,
  color = "#EDE4D3",
  gridColor = "#C8BBA6",
}) => (
  <group position={[0, 0, positionZ]}>
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

/** Aksiyonlu 2D Arda Aktörü (5 poz: front, back, pushCart, holdReceipt, closeupShock) */
export const Arda3D: React.FC<{
  position?: [number, number, number];
  camPos?: [number, number, number];
  height?: number;
  pose?: ArdaPose;
  face?: "normal" | "shock" | "happy" | "wink";
  walking?: boolean;
  talking?: boolean;
  flip?: boolean;
}> = ({
  position = [0, 0, 0],
  camPos,
  height = 2.0,
  pose = "front",
  face = "normal",
  walking = false,
  talking = false,
  flip = false,
}) => {
  const frame = useCurrentFrame();

  const blink = (frame % 90) > 85;
  const bob = walking ? Math.abs(Math.sin(frame / 4)) * 0.09 : talking ? Math.sin(frame / 5) * 0.02 : Math.sin(frame / 11) * 0.015;
  const swing = walking ? Math.sin(frame / 4) * 18 : 0;
  const rotY = camPos ? Math.atan2(camPos[0] - position[0], camPos[2] - position[2]) : 0;
  const activeFace = pose === "closeupShock" ? "shock" : face;

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
    ctx.lineWidth = 5;

    // Legs (with walking swing)
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.roundRect(88, 276 + (swing > 0 ? -swing * 0.35 : 0), 24, 44, 10);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(128, 276 + (swing < 0 ? swing * 0.35 : 0), 24, 44, 10);
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

    const drawArm = (x: number, y: number, angleDeg: number, len = 74) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angleDeg * Math.PI) / 180);
      ctx.fillStyle = "#2B3445";
      ctx.beginPath();
      ctx.roundRect(-12, -6, 24, len, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#F4C095";
      ctx.beginPath();
      ctx.arc(0, len, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    if (pose === "back") {
      // Arms behind/sides
      drawArm(64, 202, 12 + swing * 0.8);
      drawArm(176, 202, -12 - swing * 0.8);

      // Back of Charcoal Trenchcoat
      ctx.fillStyle = "#2B3445";
      ctx.beginPath();
      ctx.moveTo(68, 184);
      ctx.lineTo(172, 184);
      ctx.lineTo(182, 284);
      ctx.lineTo(58, 284);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Back coat collar & center vent seam
      ctx.fillStyle = "#3B4659";
      ctx.fillRect(92, 174, 56, 18);
      ctx.strokeRect(92, 174, 56, 18);
      ctx.beginPath();
      ctx.moveTo(120, 220);
      ctx.lineTo(120, 284);
      ctx.stroke();

      // Back of neck & dark hair
      ctx.fillStyle = "#E6AE82";
      ctx.fillRect(104, 152, 32, 24);
      ctx.strokeRect(104, 152, 32, 24);
      ctx.fillStyle = "#27201E";
      ctx.beginPath();
      ctx.roundRect(74, 78, 92, 78, 32);
      ctx.fill();
      ctx.stroke();

      // Back of Navy Fedora + Cyan Band
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
      ctx.fillRect(78, 63, 84, 10);
      ctx.fillStyle = "#111C35";
      ctx.beginPath();
      ctx.ellipse(120, 80, 72, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Arms for front / pushCart / holdReceipt / closeupShock
      if (pose === "pushCart") {
        // Arms extended forward/right toward cart handle
        drawArm(76, 200, -52, 72);
        drawArm(168, 200, -68, 76);
      } else if (pose === "holdReceipt") {
        drawArm(66, 202, 18);
        drawArm(166, 204, 48, 64);
      } else if (pose === "closeupShock") {
        drawArm(64, 202, 115);
        drawArm(176, 202, -115);
      } else {
        drawArm(66, 202, 15 + swing);
        drawArm(174, 202, -15 - swing);
      }

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

      // Held white paper receipt in hand
      if (pose === "holdReceipt") {
        ctx.fillStyle = "#FAF8F5";
        ctx.strokeStyle = ink;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(124, 204, 44, 58, 4);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#64748B";
        ctx.lineWidth = 2.5;
        for (let ry = 216; ry <= 246; ry += 9) {
          ctx.beginPath();
          ctx.moveTo(132, ry);
          ctx.lineTo(160, ry);
          ctx.stroke();
        }
        ctx.strokeStyle = ink;
        ctx.lineWidth = 5;
      }

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
      if (activeFace === "shock") {
        ctx.moveTo(84, 92);
        ctx.quadraticCurveTo(96, 84, 108, 90);
        ctx.moveTo(132, 90);
        ctx.quadraticCurveTo(144, 84, 156, 92);
      } else {
        ctx.moveTo(84, 97);
        ctx.quadraticCurveTo(98, 91, 110, 96);
        ctx.moveTo(130, 96);
        ctx.quadraticCurveTo(142, 91, 156, 97);
      }
      ctx.stroke();

      // Eyes
      const ry = blink ? 1.5 : activeFace === "shock" ? 9 : 7.5;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(97, 113, 9.5, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      if (activeFace === "wink") {
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
        if (activeFace !== "wink") {
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
      if (activeFace === "shock") {
        ctx.fillStyle = "#1E293B";
        ctx.beginPath();
        ctx.ellipse(120, 148, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (activeFace === "happy") {
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

      // Round Glasses
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
    }

    ctx.restore();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [pose, activeFace, blink, Math.round(swing / 4)]);

  const w = height * (240 / 340);

  return (
    <group position={[position[0], position[1] + height / 2 + bob, position[2]]} rotation={[0, rotY, 0]}>
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
