import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Html,
  MeshDistortMaterial,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
  Stars,
  Trail,
} from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Crosshair,
  Database,
  Globe,
  Maximize2,
  Navigation,
  Power,
  RefreshCcw,
  Settings,
  Shield,
  Target,
  Zap,
  Bell,
  ShieldCheck,
  MessageSquare,
  User,
  LogOut
} from "lucide-react";
import * as THREE from "three";

import { useCosmos } from "../../contexts/CosmosContext";
import ErrorBoundary from "./ErrorBoundary";
import CelestialNode from "./components/CelestialNode";
import FlightRig from "./components/FlightRig";
import PhotonicPath from "./components/PhotonicPath";
import { CELESTIAL_DATA, SYSTEM_CONFIG } from "./data/celestialData";

// --- SYSTEM CONSTANTS ---
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";
const NASA_BASE_URL = "https://api.nasa.gov/neo/rest/v1";

// --- UTILITIES ---
const formatKM = (v) => (v ? Math.round(v).toLocaleString() : "0");

const normalizeNeo = (obj, index) => {
  const approach = obj?.close_approach_data?.[0] || {};
  return {
    id: obj.id,
    name: (obj.name || `NEO-${index}`).replace(/[()]/g, ""),
    is_hazardous: Boolean(obj.is_potentially_hazardous_asteroid),
    velocity: parseFloat(approach?.relative_velocity?.kilometers_per_hour || 0),
    distance_km: parseFloat(approach?.miss_distance?.kilometers || 0),
    orbiting_body: approach?.orbiting_body || "EARTH",
    orbitRange: 190 + (index % 12) * 32 + Math.random() * 18,
    orbitSpeed: 0.008 + (index % 8) * 0.0018,
    orbitOffset: index * 0.9,
    size: obj?.estimated_diameter?.meters?.estimated_diameter_max || 100,
  };
};

// --- 3D SCENE COMPONENTS ---

function EnergyCore() {
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[SYSTEM_CONFIG.SUN.radius, 96, 96]} />
          <MeshDistortMaterial
            color={SYSTEM_CONFIG.SUN.color}
            emissive={SYSTEM_CONFIG.SUN.color}
            emissiveIntensity={SYSTEM_CONFIG.SUN.emissiveIntensity}
            speed={0.95}
            distort={0.12}
            toneMapped={false}
          />
        </mesh>
      </Float>
      <pointLight intensity={11} distance={2200} color="#ffd58a" castShadow />
      <mesh scale={1.18}>
        <sphereGeometry args={[SYSTEM_CONFIG.SUN.radius, 64, 64]} />
        <meshBasicMaterial color="#ffcc7a" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function LunarCompanion({ hostDistance, hostSpeed }) {
  const moonOrbitRef = useRef();
  const moonMeshRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const earthAngle = t * hostSpeed;
    const earthX = Math.cos(earthAngle) * hostDistance;
    const earthZ = Math.sin(earthAngle) * hostDistance;
    const moonAngle = t * 0.9;

    if (moonOrbitRef.current) {
      moonOrbitRef.current.position.set(
        earthX + Math.cos(moonAngle) * 14,
        Math.sin(moonAngle * 0.6) * 1.8,
        earthZ + Math.sin(moonAngle) * 14,
      );
    }

    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += 0.0035;
    }
  });

  return (
    <group ref={moonOrbitRef}>
      <mesh ref={moonMeshRef}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshStandardMaterial
          color="#c8ccd1"
          roughness={0.95}
          metalness={0.02}
          emissive="#7f858d"
          emissiveIntensity={0.03}
        />
      </mesh>
    </group>
  );
}

function AsteroidNode({ data, onSelect, simulation, isSelected }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const shellRef = useRef();
  const detailMaterialRef = useRef();
  const glowRef = useRef();
  
  const asteroidTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const palette = data.is_hazardous
      ? ["#3e2a25", "#5d4037", "#8b5a4a", "#b56c49"]
      : ["#4f4943", "#6f655a", "#85786a", "#a09281"];

    ctx.fillStyle = palette[1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5000; i += 1) {
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.globalAlpha = 0.08 + Math.random() * 0.2;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 5 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [data.is_hazardous]);

  useEffect(() => () => asteroidTexture.dispose(), [asteroidTexture]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !simulation.active) return;
    const t = (clock.getElapsedTime() * data.orbitSpeed + data.orbitOffset) * simulation.timeScale;
    
    groupRef.current.position.set(
      Math.cos(t) * data.orbitRange,
      Math.sin(t * 0.45) * 18,
      Math.sin(t) * data.orbitRange
    );
    meshRef.current.rotation.y += 0.018;
    meshRef.current.rotation.x += 0.009;

    if (detailMaterialRef.current) {
      detailMaterialRef.current.emissiveIntensity = isSelected ? 3.5 : 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      <Trail width={isSelected ? 1.4 : 0.25} color={data.is_hazardous ? "#ff7a5c" : "#9ed8e5"} length={3.4} decay={0.9}>
        <mesh 
          ref={meshRef} 
          onClick={(e) => { e.stopPropagation(); onSelect(data, groupRef); }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "default")}
        >
          <icosahedronGeometry args={[data.is_hazardous ? 2.5 : 1.4, 1]} />
          <meshStandardMaterial 
            map={asteroidTexture}
            color={data.is_hazardous ? "#8b5a4a" : "#73695f"} 
            emissive={data.is_hazardous ? "#ff4a2a" : "#2a3e47"}
            emissiveIntensity={isSelected ? 1.4 : 0.15}
            roughness={0.98}
            metalness={0.02}
          />
        </mesh>
      </Trail>
      
      {isSelected && (
        <Html distanceFactor={12} position={[0, 6, 0]}>
          <div className={`${data.is_hazardous ? "bg-red-700" : "bg-cyan-700"} px-2 py-1 text-[9px] font-black border border-white/40 whitespace-nowrap animate-pulse uppercase`}>
            LOCKED: {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// --- HUD HELPERS ---

const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <div className={`group flex cursor-pointer items-center gap-3 px-5 py-3 transition-all ${active ? "bg-white/5 text-[#FF5E00]" : "text-white/40 hover:text-white"}`}>
    <Icon size={14} className={active ? "text-[#FF5E00]" : "text-white/20 group-hover:text-white"} />
    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
    {active && <div className="ml-auto h-1 w-1 rounded-full bg-[#FF5E00] shadow-[0_0_8px_#FF5E00]" />}
  </div>
);

const TelemetryData = ({ label, value, subValue, color = "text-white" }) => (
  <div className="flex flex-col px-6 border-r border-white/5">
    <span className="text-[8px] uppercase tracking-widest text-white/20 mb-1">{label}</span>
    <span className={`text-xs font-bold ${color}`}>{value}</span>
    {subValue && <span className="text-[9px] font-bold text-[#FF5E00] mt-0.5">{subValue}</span>}
  </div>
);

// --- MAIN DASHBOARD ---

export default function ThreeDView() {
  const { selectedPlanet, selectPlanet, clearSelection } = useCosmos();
  const [neos, setNeos] = useState([]);
  const [selectedNeo, setSelectedNeo] = useState(null);
  const [targetRef, setTargetRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState({ active: true, timeScale: 1, flightMode: "ORBIT" });
  const [latestEvent, setLatestEvent] = useState("Telemetry link established");
  const [stats, setStats] = useState({ cpu: 42, objects: 0, threats: 0 });

  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`${NASA_BASE_URL}/feed?start_date=${today}&api_key=${NASA_API_KEY}`);
      if (!res.ok) throw new Error("API_LIMIT");
      const data = await res.json();
      const raw = Object.values(data.near_earth_objects || {}).flat().slice(0, 30).map(normalizeNeo);
      setNeos(raw);
      setStats(s => ({ ...s, objects: raw.length, threats: raw.filter(n => n.is_hazardous).length }));
      setLatestEvent(`TELEMETRY_LINK_ESTABLISHED: ${raw.length} TARGETS`);
    } catch (e) {
      setLatestEvent("UPLINK_FAILURE: EMERGENCY RELAY ACTIVE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      setStats(s => ({ ...s, cpu: 35 + Math.floor(Math.random() * 20) }));
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const handlePlanetSelect = (planet, ref) => {
    if (selectedPlanet?.name === planet.name) {
      clearSelection(); setTargetRef(null);
    } else {
      setSelectedNeo(null); selectPlanet(planet); setTargetRef(ref);
    }
  };

  const handleNeoSelect = (neo, ref) => {
    clearSelection(); setSelectedNeo(neo); setTargetRef(ref);
  };

  const active = selectedNeo || selectedPlanet;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#080808] font-mono text-white selection:bg-[#FF5E00]/30">
      {/* Atmospheric backdrop */}
      <div className="pointer-events-none absolute inset-0 z-[40] bg-[radial-gradient(circle_at_18%_22%,rgba(255,94,0,0.08),transparent_35%),radial-gradient(circle_at_82%_8%,rgba(255,179,122,0.08),transparent_28%)]" />
      
      {/* 1. TOP COMMAND BAR */}
      <header className="absolute top-0 left-0 z-[100] flex h-20 w-full items-center border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="flex h-full w-64 items-center px-8 border-r border-white/5">
          <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">
            Neo<span className="text-[#FF5E00]">Scan</span>
          </h2>
        </div>
        
        <div className="flex flex-1 items-center h-full">
          <TelemetryData label="PRIMARY_STATION" value="ISTRAC" subValue="BLR_STR_04" />
          <TelemetryData label="UPLINK_SYNC" value={loading ? "SYNCING..." : "99.99% STABLE"} color="text-emerald-500" />
          <TelemetryData label="AWAITING" value="ORBITAL PAYLOAD_V5.5..." color="text-white/40" />
        </div>

        <div className="flex items-center gap-6 px-8">
          <Bell size={18} className="text-white/20 hover:text-white cursor-pointer" />
          <div className="text-right">
            <p className="text-[8px] text-white/20 uppercase tracking-widest">CHRONOS_SYNC</p>
            <p className="text-lg font-bold">21:17:47</p>
          </div>
          <div className="flex items-center gap-3 bg-[#FF5E00] px-4 py-2 text-black rounded-sm shadow-[0_0_20px_rgba(255,94,0,0.2)]">
            <ShieldCheck size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest text-black">Verified_Access</span>
          </div>
        </div>
      </header>

      {/* 2. DUAL SIDEBAR SYSTEM */}
      <aside className="absolute left-0 top-20 z-[90] flex h-[calc(100vh-80px)] w-64 flex-col border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          <p className="px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Core_Modules</p>
          <SidebarItem icon={Globe} label="Orbital_Canvas" active />
          <SidebarItem icon={Database} label="Data_Registry" />
          <SidebarItem icon={Activity} label="Impact_Analyzer" />
          <SidebarItem icon={Shield} label="Threat_Monitor" />
          <SidebarItem icon={Target} label="Research_Facility" />
          <SidebarItem icon={MessageSquare} label="Community_Page" />
          <SidebarItem icon={User} label="Core_Profile" />
        </div>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-white/30">
             <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Active_Target</span>
          </div>
          <div className="flex items-center gap-3 text-white/30">
             <RefreshCcw size={12} className="animate-spin" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Scanning_Uplink...</span>
          </div>
          <div className="flex items-center gap-4 pt-4">
             <Settings size={16} className="text-white/20 hover:text-white cursor-pointer" />
             <LogOut size={16} className="text-red-500/50 hover:text-red-500 cursor-pointer ml-auto" />
          </div>
        </div>
      </aside>

      {/* 3. MAIN INTERFACE AREA */}
      <main className="absolute inset-0 pl-[292px] pt-20">
        
        {/* INNER 3D CANVAS FRAME */}
        <div className="relative h-full w-full bg-[#050505] overflow-hidden">
          
          {/* Internal HUD Overlays */}
          <div className="absolute top-8 left-8 z-10">
             <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.4em] text-[#FF5E00]">
                <div className="h-1 w-4 bg-[#FF5E00]" /> SYSTEM: ASTRO-OS 5.5
             </div>
             <h1 className="text-7xl font-black italic tracking-tighter uppercase opacity-80 mt-2 leading-none">
                NeoScan
             </h1>
          </div>

          <div className="absolute top-8 right-8 z-10 flex gap-12 text-right">
             <div>
                <p className="text-[9px] text-white/20 uppercase tracking-widest">Grid Stability</p>
                <p className="text-xs font-bold text-emerald-500 italic uppercase">Nominal_Active</p>
             </div>
             <div>
                <p className="text-[9px] text-white/20 uppercase tracking-widest">Threat Level</p>
                <p className={`text-xs font-bold italic uppercase ${stats.threats > 0 ? "text-red-500" : "text-white"}`}>
                  {stats.threats > 0 ? "Critical" : "Clear"}
                </p>
             </div>
          </div>

          {/* Mission Info Box */}
          <aside className="absolute bottom-8 left-8 z-10 w-80 space-y-4">
             <div className="border border-white/5 bg-[#0a0a0a]/90 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5E00]">Mission Overview</span>
                   <div className="flex items-center gap-2 text-[9px] text-[#FF5E00]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#FF5E00]" /> LIVE
                   </div>
                </div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Active Event</p>
                <p className="text-xs text-white/70 mb-6 uppercase leading-relaxed">{latestEvent}</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-3">
                      <p className="text-[8px] text-white/20 uppercase tracking-widest mb-2">Threat Posture</p>
                      <p className={`text-[10px] font-black uppercase ${stats.threats > 0 ? "text-red-500" : "text-emerald-500"}`}>
                        {stats.threats > 0 ? "Elevated" : "Nominal"}
                      </p>
                   </div>
                   <div className="bg-white/5 p-3">
                      <p className="text-[8px] text-white/20 uppercase tracking-widest mb-2">Flight Mode</p>
                      <p className="text-[10px] font-black uppercase text-[#FF5E00]">{simulation.flightMode}</p>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a]/90 border border-white/5 p-4 backdrop-blur-md">
                   <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">Tracked Objects</p>
                   <p className="text-2xl font-black italic">{stats.objects}</p>
                </div>
                <div className="bg-[#0a0a0a]/90 border border-white/5 p-4 backdrop-blur-md">
                   <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">System Load</p>
                   <p className="text-2xl font-black italic">{stats.cpu}%</p>
                </div>
             </div>
          </aside>

          {/* Active Target Card */}
          {active && (
            <div className="absolute top-32 right-8 z-20 w-80 border border-white/5 bg-[#0a0a0a]/95 p-6 backdrop-blur-md">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 border border-[#FF5E00]/30 bg-[#FF5E00]/10">
                    <Crosshair size={18} className="text-[#FF5E00]" />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Target Locked</p>
                    <p className="text-xl font-black uppercase">{active.name}</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="border-l-2 border-[#FF5E00] bg-white/5 p-4">
                    <p className="text-[8px] text-white/40 uppercase mb-1">Velocity</p>
                    <p className="text-md font-bold italic">{formatKM(active.velocity)} <span className="text-[8px] text-[#FF5E00]">KM/H</span></p>
                  </div>
                  <div className={`border-l-2 ${active.is_hazardous ? "border-red-500" : "border-emerald-500"} bg-white/5 p-4`}>
                    <p className="text-[8px] text-white/40 uppercase mb-1">Hazard</p>
                    <p className="text-md font-bold italic">{active.is_hazardous ? "CRITICAL" : "STABLE"}</p>
                  </div>
               </div>
               <div className="bg-white/5 p-4 mb-6 border border-white/5">
                  <p className="text-[8px] text-white/40 uppercase mb-1">Proximity</p>
                  <p className="text-lg font-black mb-2">{formatKM(active.distance_km)} KM</p>
                  <div className="h-0.5 w-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#FF5E00] w-[70%] animate-pulse" />
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={fetchTelemetry} className="flex-1 border border-white/10 bg-white/5 py-3 text-[9px] font-black uppercase tracking-widest hover:border-[#FF5E00]">Refresh</button>
                  <button onClick={() => { setSelectedNeo(null); clearSelection(); setTargetRef(null); }} className="flex-1 bg-white text-black py-3 text-[9px] font-black uppercase tracking-widest hover:bg-[#FF5E00]">Close</button>
               </div>
            </div>
          )}

          {/* Canvas Engine */}
          <Canvas
            dpr={[1, 2]}
            shadows
            gl={{ antialias: true, logarithmicDepthBuffer: true, alpha: false }}
            onCreated={({ gl, scene }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              scene.background = new THREE.Color("#020202");
            }}
          >
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 450, 800]} fov={34} />
              <OrbitControls makeDefault enablePan={false} maxDistance={1200} minDistance={100} rotateSpeed={0.4} enableDamping />
              
              <fog attach="fog" args={["#000", 600, 1500]} />
              <Stars radius={900} count={50000} factor={7} fade speed={1.5} />
              <Sparkles count={200} scale={800} size={2} opacity={0.05} />
              
              <EnergyCore />
              <ambientLight intensity={0.36} color="#a4acb8" />
              <hemisphereLight intensity={0.42} color="#e5ecff" groundColor="#050608" />
              <directionalLight position={[120, 160, 90]} intensity={1.2} color="#ffe4bc" castShadow />
              <directionalLight position={[-180, 60, -120]} intensity={0.22} color="#9eb7ff" />
              <pointLight position={[0, 0, 0]} intensity={2.1} distance={900} color="#ffddaa" />

              {CELESTIAL_DATA.map((planet) => (
                <React.Fragment key={planet.name}>
                  <PhotonicPath radius={planet.distance} color={planet.color} active={active?.name === planet.name} />
                  <CelestialNode data={planet} onSelect={handlePlanetSelect} isSelected={active?.name === planet.name} />
                </React.Fragment>
              ))}

              <LunarCompanion hostDistance={180} hostSpeed={0.05} />

              {neos.map((neo) => (
                <AsteroidNode key={neo.id} data={neo} onSelect={handleNeoSelect} simulation={simulation} isSelected={active?.id === neo.id} />
              ))}

              <FlightRig targetRef={targetRef} isLocked={Boolean(active)} flightMode={simulation.flightMode} />

              <EffectComposer disableNormalPass>
                <Bloom intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.6} mipmapBlur />
                <Noise opacity={0.015} />
                <Vignette darkness={0.7} />
                <ChromaticAberration offset={new THREE.Vector2(0.0001, 0.0002)} />
              </EffectComposer>
            </Suspense>
          </Canvas>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-8 right-8 z-10 flex gap-4">
             <button onClick={fetchTelemetry} className="flex items-center gap-3 border border-white/10 bg-[#0a0a0a]/80 px-6 py-4 text-[9px] font-black uppercase tracking-widest backdrop-blur-md hover:border-[#FF5E00]">
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Refresh Feed
             </button>
             <button onClick={() => setSimulation(s => ({ ...s, active: !s.active }))} className={`px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${simulation.active ? "border border-red-500/40 bg-red-500/10 text-red-500" : "bg-[#FF5E00] text-black"}`}>
                {simulation.active ? "Pause Motion" : "Resume Motion"}
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}
