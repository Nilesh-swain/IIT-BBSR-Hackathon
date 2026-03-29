import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";

/**
 * ADVANCED CINEMATIC FLIGHT RIG (V5-TACTICAL)
 * Features: Variable FOV, Lagged Tracking, and "Lens Jitter" for macro-zoom.
 */
function FlightRig({ targetRef, isLocked, flightMode = "ORBIT" }) {
  const { camera, controls } = useThree();
  
  // Internal state for "Physics-based" movement
  const rigState = useRef({
    currentFOV: 45,
    lastTarget: new THREE.Vector3(),
    isTransitioning: false,
  });

  // Pre-allocate vectors for GC performance (zero memory leaks)
  const vec = useMemo(() => ({
    targetPos: new THREE.Vector3(),
    desiredPos: new THREE.Vector3(),
    center: new THREE.Vector3(0, 0, 0),
    offset: new THREE.Vector3(),
  }), []);

  useFrame((clockState, delta) => {
    if (!controls) return;

    const time = clockState.clock.getElapsedTime();

    if (isLocked && targetRef?.current) {
      // 1. EXTRACT SPATIAL COORDINATES
      // getWorldPosition is safer than .position for nested objects
      targetRef.current.getWorldPosition(vec.targetPos);
      
      // 2. CALCULATE DYNAMIC ORBITAL OFFSET
      // flightMode toggle: 'RECON' stays closer, 'ORBIT' keeps distance
      const orbitRadius = flightMode === "RECON" ? 45 : 85;
      const verticalBias = flightMode === "RECON" ? 15 : 30;
      const orbitSpeed = time * 0.35;
      
      vec.desiredPos.set(
        vec.targetPos.x + Math.sin(orbitSpeed) * orbitRadius,
        vec.targetPos.y + verticalBias, 
        vec.targetPos.z + Math.cos(orbitSpeed) * orbitRadius
      );

      // 3. ADAPTIVE FOV (Dynamic Focal Length)
      // Simulates a 35mm to 85mm lens transition based on distance
      const distance = camera.position.distanceTo(vec.targetPos);
      const targetFOV = THREE.MathUtils.clamp(distance * 0.45, 28, 52);
      
      // Lerp FOV for smooth zooming
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.08);
      camera.updateProjectionMatrix();

      // 4. THE "WEIGHTED" TRACKING (Cinematic Lerp)
      // Controls.target = Where we look (Fast tracking: 0.12)
      // Camera.position = Where we are (Heavy tracking: 0.06)
      // This mismatch creates the professional "Camera-trailing-target" feel.
      controls.target.lerp(vec.targetPos, 0.12);
      camera.position.lerp(vec.desiredPos, 0.06);

      // 5. HIGH-MAGNIFICATION LENS JITTER
      // Only active during "Recon" (Close-up) to simulate a mechanical gimbal fighting vibration
      if (distance < 120) {
        const shakeIntensity = flightMode === "RECON" ? 0.08 : 0.03;
        camera.position.x += Math.sin(time * 42) * shakeIntensity;
        camera.position.y += Math.cos(time * 38) * shakeIntensity;
      }

    } else {
      // --- RESET TO HOME GRID ---
      // Slowly return camera to the global system center
      controls.target.lerp(vec.center, 0.03);
      
      // Reset FOV to default dashboard view (45°)
      if (Math.abs(camera.fov - 45) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, 45, 0.05);
        camera.updateProjectionMatrix();
      }
    }

    // Required for OrbitControls to stay in sync with manual camera movement
    controls.update();
  });

  return null;
}

export default FlightRig;

