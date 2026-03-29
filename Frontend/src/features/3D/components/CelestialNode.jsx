import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

function createPlanetTexture(data) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const base = data.surfaceColor || data.color || "#888888";
  const glow = data.glowColor || data.color || "#aaaaaa";

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawBand = (y, height, color, alpha = 0.35) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(0, y, canvas.width, height);
    ctx.restore();
  };

  const drawNoiseDots = (count, colors, alpha = 0.15, size = 3) => {
    for (let i = 0; i < count; i += 1) {
      ctx.save();
      ctx.globalAlpha = alpha * (0.5 + Math.random() * 0.8);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * size + 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
  };

  const addCloudStreaks = (count, color, alpha = 0.18) => {
    for (let i = 0; i < count; i += 1) {
      const y = Math.random() * canvas.height;
      const h = 10 + Math.random() * 30;
      const x = -100 + Math.random() * 80;
      const w = canvas.width * (0.25 + Math.random() * 0.65);
      const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.3, color);
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
  };

  switch (data.name) {
    case "Earth":
      drawNoiseDots(7400, ["#1d4f7d", "#2c5e34", "#356d3c", "#6fa3d5", "#c2b38d"], 0.30, 5);
      addCloudStreaks(62, "rgba(255,255,255,1)", 0.24);
      drawBand(180, 30, "#1f5ba8", 0.18);
      drawBand(80, 18, "#e8f4ff", 0.08);
      drawBand(390, 22, "#eef7ff", 0.08);
      // city lights on night side
      drawNoiseDots(520, ["#ffb347", "#ffd27f", "#f7e7b5"], 0.5, 2.5);
      break;
    case "Mars":
      drawNoiseDots(5000, ["#7f3b28", "#9a5234", "#c9875e", "#5b2b1e", "#d8a27f"], 0.24, 4);
      drawBand(220, 24, "#d8a27f", 0.14);
      drawBand(90, 16, "#b56242", 0.1);
      break;
    case "Venus":
      addCloudStreaks(55, "rgba(241,219,172,1)", 0.28);
      drawNoiseDots(2600, ["#d3b06c", "#b58642", "#f1d7a2"], 0.12, 6);
      break;
    case "Jupiter":
      drawBand(30, 40, "#e6bf91", 0.55);
      drawBand(90, 55, "#9d6d49", 0.42);
      drawBand(170, 48, "#d4a173", 0.45);
      drawBand(250, 55, "#8f5c3d", 0.4);
      drawBand(340, 45, "#d7b089", 0.48);
      drawNoiseDots(1800, ["#f0d4b2", "#8d5a3e", "#c89167"], 0.08, 10);
      break;
    case "Saturn":
      drawBand(35, 34, "#f0dfb2", 0.48);
      drawBand(90, 30, "#cba86a", 0.4);
      drawBand(150, 34, "#efd39b", 0.44);
      drawBand(240, 34, "#b99459", 0.36);
      drawBand(320, 30, "#f5e6b6", 0.42);
      drawNoiseDots(1400, ["#f5e6b6", "#b99459", "#dcc48d"], 0.08, 8);
      break;
    case "Uranus":
      addCloudStreaks(24, "rgba(220,255,255,1)", 0.16);
      drawBand(190, 55, "#9ddadd", 0.18);
      break;
    case "Neptune":
      drawBand(60, 30, "#6f8fff", 0.3);
      drawBand(220, 50, "#3556b8", 0.24);
      addCloudStreaks(18, "rgba(198,220,255,1)", 0.12);
      break;
    default:
      drawNoiseDots(3200, [glow, "#666666", "#bbbbbb"], 0.12, 4);
  }

  for (let i = 0; i < 18; i += 1) {
    const gradient = ctx.createRadialGradient(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      0,
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      120 + Math.random() * 160,
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.06)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    60,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 1.2,
  );
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createRingTexture(color) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.15, color);
  gradient.addColorStop(0.45, "rgba(255,255,255,0.75)");
  gradient.addColorStop(0.75, color);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 120; i += 1) {
    ctx.fillStyle = i % 3 === 0 ? "rgba(80,60,30,0.16)" : "rgba(255,255,255,0.08)";
    ctx.fillRect(Math.random() * canvas.width, 0, 1 + Math.random() * 2, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function CelestialNode({ data, onSelect, isSelected }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const atmosphereRef = useRef();
  const cloudsRef = useRef();
  const selectionRef = useRef();

  const surfaceTexture = useMemo(() => createPlanetTexture(data), [data]);
  const ringTexture = useMemo(
    () => (data.hasRings ? createRingTexture(data.ringColor || data.glowColor || "#ead8aa") : null),
    [data],
  );

  useEffect(() => {
    return () => {
      surfaceTexture.dispose();
      ringTexture?.dispose();
    };
  }, [ringTexture, surfaceTexture]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const orbitalSpeed = data.speed ?? data.orbitalSpeed ?? 0.01;
    const rotationSpeed = data.rotationSpeed ?? 0.004;

    if (groupRef.current) {
      const angle = t * orbitalSpeed;
      groupRef.current.position.set(
        Math.cos(angle) * data.distance,
        0,
        Math.sin(angle) * data.distance,
      );
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;

      if (isSelected) {
        const pulse = 1 + Math.sin(t * 3) * 0.015;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotationSpeed * 0.45;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= 0.001;
    }

    if (selectionRef.current && isSelected) {
      selectionRef.current.rotation.z = t * 0.5;
    }
  });

  const glowColor = data.glowColor || data.color || "#44aaff";
  const atmosphereOpacity =
    data.atmosphere?.opacity ?? (data.hasAtmosphere === false ? 0.05 : 0.2);
  const atmosphereScale =
    data.atmosphere?.thickness ?? (data.hasAtmosphere === false ? 1.03 : 1.08);

  return (
    <group ref={groupRef}>
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[data.radius * atmosphereScale, 48, 48]} />
        <meshPhysicalMaterial
          transparent
          opacity={atmosphereOpacity}
          color={glowColor}
          roughness={1}
          side={THREE.BackSide}
          emissive={glowColor}
          emissiveIntensity={isSelected ? 2.5 : 0.6}
        />
      </mesh>

      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect(data, groupRef);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[data.radius, 96, 96]} />
    <meshStandardMaterial
      map={surfaceTexture}
      roughness={data.type === "GAS GIANT" ? 0.92 : 0.72}
      metalness={0.08}
      emissive={glowColor}
      emissiveIntensity={isSelected ? 0.12 : 0.02}
      envMapIntensity={0.6}
    />
      </mesh>

      {data.name === "Earth" || data.name === "Venus" || data.type === "GAS GIANT" ? (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[data.radius * 1.015, 64, 64]} />
          <meshPhysicalMaterial
            transparent
            opacity={data.name === "Earth" ? 0.18 : 0.12}
            color="#ffffff"
            roughness={0.9}
            clearcoat={0.2}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {data.hasRings && (
        <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <ringGeometry args={[data.radius * 1.4, data.radius * 2.2, 128]} />
          <meshStandardMaterial
            map={ringTexture}
            color={data.ringColor || glowColor}
            transparent
            opacity={0.72}
            side={THREE.DoubleSide}
            metalness={0.15}
            roughness={0.65}
          />
        </mesh>
      )}

      {isSelected && (
        <group ref={selectionRef} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[data.radius + 8, data.radius + 8.3, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <ringGeometry args={[data.radius + 10, data.radius + 13, 64, 1, 0, Math.PI * 0.3]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {isSelected && (
        <Html distanceFactor={14} position={[0, data.radius + 16, 0]}>
          <div className="pointer-events-none select-none">
            <div className="rounded-sm border border-[#FF5E00]/50 bg-[#120d09]/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB37A] shadow-[0_0_12px_rgba(255,94,0,0.35)]">
              Target Locked // {data.name}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default React.memo(CelestialNode);
