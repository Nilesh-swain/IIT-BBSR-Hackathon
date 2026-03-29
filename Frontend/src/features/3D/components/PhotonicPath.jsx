import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

/**
 * TACTICAL PHOTONIC PATHS (NEOSCAN_V5)
 * Features: High-velocity data pulses, atmospheric bloom, and GPU-optimized rotation.
 */
const PhotonicPath = ({ radius, color, active }) => {
  const flowRef = useRef();
  const glowRef = useRef();

  // 1. GENERATE ORBIT GEOMETRY (Memoized for zero-overhead)
  const points = useMemo(() => {
    const pts = [];
    const segments = 180; // Increased for a smoother "Cyber" curve
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  // 2. ANIMATION ENGINE
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (flowRef.current) {
      // Fast rotation for active links, slow drift for idle
      flowRef.current.rotation.y = time * (active ? 0.25 : 0.04);
    }
    
    if (glowRef.current && active) {
      // Breathing effect for the selection glow
      const pulse = Math.sin(time * 3) * 0.2 + 0.8;
      glowRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group>
      {/* --- LAYER 1: THE TACTICAL GRID (Static Foundation) --- */}
      <Line
        points={points}
        color={color}
        opacity={active ? 0.3 : 0.08}
        transparent
        lineWidth={0.6}
        depthWrite={false}
      />

      {/* --- LAYER 2: THE DATA FLOW (Animated Dashing) --- */}
      <group ref={flowRef}>
        <Line
          points={points}
          color={color}
          opacity={active ? 0.9 : 0.15}
          transparent
          lineWidth={active ? 2.8 : 1.2}
          dashed
          dashScale={active ? 8 : 15}
          dashArray={0.4}
          // We use rotation for movement to avoid CPU-intensive dashOffset updates
        />
      </group>

      {/* --- LAYER 3: THE SELECTION GLOW (Active State Only) --- */}
      {active && (
        <group ref={glowRef}>
          {/* Broad Atmospheric Glow */}
          <Line
            points={points}
            color={color}
            opacity={0.12}
            transparent
            lineWidth={15}
            depthWrite={false}
          />
          
          {/* Core Photon Highlight (White center line) */}
          <Line
            points={points}
            color="#ffffff"
            opacity={0.6}
            transparent
            lineWidth={0.8}
            depthWrite={false}
          />
          
          {/* Orbital Floor Shadow (Sector Highlight) */}
          <Line
            points={points}
            color={color}
            opacity={0.03}
            lineWidth={60}
            transparent
            depthWrite={false}
          />
        </group>
      )}

      {/* --- LAYER 4: DEPTH INDICATORS (Subtle "Scanning" Marks) --- */}
      {!active && (
        <Line
          points={points}
          color={color}
          opacity={0.02}
          lineWidth={3}
          transparent
        />
      )}
    </group>
  );
};

// Optimization: Prevents re-calculation of the 180-point array unless radius changes
export default React.memo(PhotonicPath);