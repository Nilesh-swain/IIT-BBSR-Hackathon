
import React, { useRef, useState, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles, Float, Trail, Ring } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Activity, ShieldAlert, Zap, Globe, AlertTriangle, Crosshair } from "lucide-react";

// --- 1. ATMOSPHERE EFFECT ---
const Atmosphere = () => (
  <mesh scale={[1.1, 1.1, 1.1]}>
    <sphereGeometry args={[2, 64, 64]} />
    <meshPhongMaterial
      color="#4ca9ff"
      transparent
      opacity={0.2}
      side={THREE.BackSide}
      blending={THREE.AdditiveBlending}
    />
  </mesh>
);

// --- 2. THE ENHANCED EARTH ---
const EarthModel = () => {
  const meshRef = useRef();
  const [color, normal, spec] = useLoader(THREE.TextureLoader, [
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg",
  ]);

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={color} 
          normalMap={normal} 
          specularMap={spec} 
          specular={new THREE.Color('#333333')}
          shininess={15}
        />
      </mesh>
      <Atmosphere />
    </group>
  );
};

// --- 3. DYNAMIC ASTEROID ---
const Asteroid = ({ active, config, onImpact }) => {
  const ref = useRef();
  const [progress, setProgress] = useState(0);

  const startPos = useMemo(() => {
    const phi = (config.angle * Math.PI) / 180;
    const radius = 15;
    return new THREE.Vector3(radius * Math.sin(phi), radius * Math.cos(phi), radius * Math.sin(phi) * 0.5);
  }, [config.angle]);

  const endPos = new THREE.Vector3(0, 0, 0);

  useFrame((state, delta) => {
    if (active && ref.current) {
      const nextProgress = progress + delta * (config.velocity * 5);
      if (nextProgress >= 0.86) { 
        onImpact(ref.current.position.clone());
        setProgress(0);
      } else {
        setProgress(nextProgress);
        ref.current.position.lerpVectors(startPos, endPos, nextProgress);
        ref.current.lookAt(0, 0, 0);
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={ref}>
      <Trail width={config.size * 3} length={12} color="#ffaa00" attenuation={(t) => t * t}>
        <mesh>
          <sphereGeometry args={[config.size, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ff6600" emissiveIntensity={10} />
        </mesh>
      </Trail>
      <pointLight color="#ff4400" intensity={100} distance={10} />
    </group>
  );
};

// --- 4. IMPACT EFFECTS ---
const ImpactEffect = ({ position, size }) => {
  const ringRef = useRef();
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.scale.multiplyScalar(1.08);
      ringRef.current.material.opacity *= 0.92;
    }
  });

  return (
    <group position={position}>
      <Ring ref={ringRef} args={[0.1, 0.3, 64]}>
        <meshBasicMaterial color="#ff7700" transparent opacity={1} side={THREE.DoubleSide} />
      </Ring>
      <Sparkles count={150} scale={size * 15} size={12} speed={4} color="#ffd400" />
    </group>
  );
};

// --- 5. NEW: DATA REPORT COMPONENT ---
const ImpactCard = ({ config, impactPoint }) => {
  // Kinetic Energy Calculation (Simplified E=1/2mv^2)
  const mass = config.size * 1000; 
  const velocity = config.velocity * 100;
  const energy = (0.5 * mass * Math.pow(velocity, 2)).toFixed(2);

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-black/80 border-l-4 border-orange-500 backdrop-blur-md p-6 shadow-2xl z-[120]"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-orange-500/30 pb-4">
        <AlertTriangle className="text-orange-500" size={24} />
        <div>
          <h2 className="text-white font-black text-lg leading-none">IMPACT REPORT</h2>
          <span className="text-[9px] text-orange-500 tracking-[0.2em]">POST_COLLISION_ANALYSIS</span>
        </div>
      </div>

      <div className="space-y-4">
        <DataRow label="Kinetic Yield" value={`${energy} Terajoules`} icon={<Zap size={14}/>} />
        <DataRow label="Object Mass" value={`${(config.size * 100).toFixed(1)} Metric Tons`} icon={<Activity size={14}/>} />
        <DataRow label="Velocity" value={`${(config.velocity * 7.5).toFixed(2)} km/s`} icon={<Crosshair size={14}/>} />
        <DataRow label="Surface Area" value={`${(config.size * 4).toFixed(2)} km²`} icon={<Globe size={14}/>} />
      </div>

      <div className="mt-8 p-3 bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-200">
        <p className="uppercase leading-relaxed">
          <span className="text-orange-500 font-bold">Status:</span> Severe atmospheric disturbance recorded. Thermal radiation peaked at 4,200K. Defensive grid re-calibrating.
        </p>
      </div>
    </motion.div>
  );
};

const DataRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-end border-b border-white/5 pb-1">
    <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-tighter">
      {icon} {label}
    </div>
    <div className="text-orange-400 font-bold text-sm">{value}</div>
  </div>
);

// --- 6. MAIN SIMULATOR ---
export default function AntarikshSimulator() {
  const [config, setConfig] = useState({ size: 0.1, velocity: 0.05, angle: 45 });
  const [stage, setStage] = useState("IDLE");
  const [impactPoint, setImpactPoint] = useState(null);

  const handleImpact = (pos) => {
    setImpactPoint(pos);
    setStage("REPORT");
    // Stay in report mode for 6 seconds then reset
    setTimeout(() => {
      setStage("IDLE");
      setImpactPoint(null);
    }, 8000);
  };

  return (
    <div className="h-screen w-full bg-[#020305] text-[#ff4d00] font-mono overflow-hidden">
      
      {/* GLOBAL UI OVERLAY */}
      <div className="absolute top-0 w-full p-8 flex justify-between items-start z-50 pointer-events-none">
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 border border-[#ff4d00] flex items-center justify-center bg-[#ff4d00]/10 shadow-[0_0_15px_rgba(255,77,0,0.3)]">
            <Target size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">ANTARIKSH // V4.2</h1>
            <p className="text-[10px] text-[#ff4d00] font-bold tracking-[0.3em]">ORBITAL_DEFENSE_GRID</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] opacity-60 uppercase mb-1">Impact Probability</div>
          <div className="text-xl font-black italic text-white">
            {stage === "IDLE" ? "0.02%" : "100%"} <span className="text-[10px] text-[#ff4d00] not-italic underline ml-2">DATA_SYNC</span>
          </div>
        </div>
      </div>

      {/* INPUT CONTROLS */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 w-72">
        <div className="bg-black/60 border border-white/10 p-6 backdrop-blur-xl">
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 flex items-center gap-2 border-b border-white/10 pb-2 text-white">
            <Activity size={14} className="text-orange-500"/> Registry_Parameters
          </h3>
          
          <div className="space-y-8">
            <Slider label="Object_Size" value={config.size} min={0.05} max={0.4} step={0.01} onChange={(v) => setConfig({...config, size: v})} />
            <Slider label="Velocity_KMS" value={config.velocity} min={0.01} max={0.2} step={0.01} onChange={(v) => setConfig({...config, velocity: v})} />
            <Slider label="Entry_Angle" value={config.angle} min={0} max={180} step={1} suffix="°" onChange={(v) => setConfig({...config, angle: v})} />
          </div>

          <button 
            onClick={() => setStage("FLIGHT")}
            disabled={stage !== "IDLE"}
            className="w-full mt-10 py-4 bg-orange-600 text-white text-[11px] font-black tracking-[0.4em] hover:bg-orange-400 transition-all disabled:opacity-20 shadow-[0_0_30px_rgba(234,88,12,0.3)]"
          >
            {stage === "IDLE" ? "INITIATE IMPACT" : "SIMULATION ACTIVE"}
          </button>
        </div>
      </div>

      {/* RENDERER */}
      <div className="absolute inset-0">
        <Canvas shadows camera={{ position: [8, 4, 8], fov: 35 }}>
          <Suspense fallback={null}>
            <color attach="background" args={["#010204"]} />
            <directionalLight position={[10, 10, 5]} intensity={2.5} castShadow />
            <hemisphereLight intensity={0.4} groundColor="#000000" color="#4ca9ff" />
            <ambientLight intensity={0.2} />
            <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1.5} />
            
            <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
                <EarthModel />
            </Float>

            <Asteroid active={stage === "FLIGHT"} config={config} onImpact={handleImpact} />
            {impactPoint && <ImpactEffect position={impactPoint} size={config.size} />}
            <OrbitControls enablePan={false} autoRotate={stage === "IDLE"} autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      {/* ANIMATED CARDS & OVERLAYS */}
      <AnimatePresence>
        {stage === "REPORT" && (
          <>
            {/* Post-Impact Report Card */}
            <ImpactCard config={config} impactPoint={impactPoint} />
            
            {/* Warning Banner */}
            <motion.div 
              initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-600 px-10 py-2 skew-x-[-20deg]"
            >
              <div className="skew-x-[20deg] flex items-center gap-4 text-white font-black italic tracking-widest">
                <ShieldAlert size={20} /> COLLISION DETECTED - ANALYZING DEBRIS
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HUD DECORATION */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none z-50">
        <div className="text-[10px] text-white/30 space-y-1">
          <p>LAT: 40.7128° N</p>
          <p>LNG: 74.0060° W</p>
          <p>ALT: 35,786 KM</p>
        </div>
        <div className="h-px bg-white/20 w-1/3" />
        <div className="text-[10px] text-white/30 text-right space-y-1 uppercase tracking-widest">
          <p>System Status: Optimal</p>
          <p>Sat_Link: Active</p>
        </div>
      </div>
    </div>
  );
}

const Slider = ({ label, value, min, max, step, onChange, suffix = "" }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
      <span className="text-white/40">{label}</span>
      <span className="text-orange-500">{value}{suffix}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-[1px] bg-white/20 appearance-none accent-orange-500 cursor-crosshair"
    />
  </div>
);