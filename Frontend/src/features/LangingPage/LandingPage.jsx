import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiPost } from "../../utils/api.js";
import {
  ChevronRight,
  Activity,
  ShieldCheck,
  Globe,
  Database,
  Lock,
  Compass,
  Radio,
  Cpu,
  Layers,
} from "lucide-react";
import gsap from "gsap";

const AntarikshLanding = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toISOString()), 1000);
    const ctx = gsap.context(() => {
      const moveLayers = (e) => {
        const { clientX, clientY } = e;
        const xPos = clientX / window.innerWidth - 0.5;
        const yPos = clientY / window.innerHeight - 0.5;
        gsap.to(".ui-parallax", {
          x: xPos * 25,
          y: yPos * 25,
          duration: 2,
          ease: "power2.out",
        });
      };
      window.addEventListener("mousemove", moveLayers);
      return () => {
        window.removeEventListener("mousemove", moveLayers);
        clearInterval(timer);
      };
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#040508] text-slate-200 overflow-x-hidden font-sans antialiased selection:bg-orange-600/30"
    >
      {/* --- BACKGROUND ARCHITECTURE --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/10 via-transparent to-blue-900/5" />
      </div>

      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 lg:px-12 flex justify-between items-center border-b border-white/5 bg-[#040508]/80 backdrop-blur-md">
        <div className="flex items-center gap-12">
          <div className="flex flex-col cursor-default">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
              Antariksh
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" />
              <p className="text-[8px] font-bold tracking-[0.4em] text-orange-600/80 uppercase leading-none">
                Defense Network
              </p>
            </div>
          </div>

          <div className="hidden md:flex gap-10 border-l border-white/10 pl-10">
            <NavInfo icon={Globe} label="Region" val="IND-WEST" />
            <NavInfo icon={Cpu} label="System" val="Optimal" />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block border-r border-white/10 pr-8 font-mono">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              Chronos_Sync
            </p>
            <p className="text-sm font-bold text-white tabular-nums">
              {time.split("T")[1].split(".")[0]}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/auth/signup")}
              className="px-5 py-2 border border-white/10 hover:bg-white/5 text-white font-black text-[10px] uppercase tracking-widest transition-all rounded-sm"
            >
              Enroll
            </button>
            <button
              onClick={() => navigate("/auth/login")}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-orange-600/20"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN INTERFACE --- */}
      <main className="relative z-10 min-h-screen pt-32 pb-24 px-6 lg:px-12 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-16 items-center">
          {/* LEFT: MISSION STATEMENT */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-orange-600/5 border border-orange-600/20 rounded-full mb-8">
                <Radio size={12} className="text-orange-600 animate-pulse" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                  NASA-API-Real-Time-Feed
                </span>
              </div>

              <h1 className="text-6xl xl:text-8xl font-black text-white leading-[0.95] tracking-tighter uppercase">
                Planetary{" "}
                <span className="text-orange-600 italic">Defense</span> <br />&
                Risk Analysis.
              </h1>

              <p className="mt-8 max-w-xl text-lg text-slate-400 font-normal leading-relaxed border-l-2 border-orange-600/20 pl-6">
                The definitive dashboard for tracking{" "}
                <span className="text-white font-semibold underline decoration-orange-600/50 underline-offset-4">
                  Near-Earth Objects (NEOs)
                </span>
                . Utilizing trajectory modeling to categorize orbital threats in
                real-time.
              </p>

              <div className="flex flex-wrap gap-4 mt-12">
                <button
                  onClick={() => navigate("/auth/signup")}
                  className="group flex items-center gap-8 px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all active:scale-95"
                >
                  Establish Uplink{" "}
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button className="px-10 py-5 border border-white/10 hover:border-white/30 text-white font-black text-xs uppercase tracking-[0.3em] transition-all backdrop-blur-sm">
                  Documentation
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: TACTICAL BENTO GRID */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full">
            {/* Object Card - Prominent Position */}
            <div className="col-span-2 ui-parallax bg-white/[0.03] border border-white/10 p-8 backdrop-blur-md relative overflow-hidden group hover:border-orange-600/30 transition-colors">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-20 transition-all duration-700">
                <Compass size={160} className="text-orange-600" />
              </div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">
                Priority_Target
              </p>
              <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                Asteroid_99942
              </h3>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                <DataBlock label="Velocity" val="30.7" unit="km/s" />
                <DataBlock label="Distance" val="0.024" unit="AU" />
                <DataBlock label="Risk" val="CAT-01" color="text-emerald-500" />
              </div>
            </div>

            {/* Metric Blocks - Staggered Grid */}
            <MetricBox icon={Activity} label="Telemetry" val="Syncing" />
            <MetricBox icon={Database} label="NASA_DB" val="Connected" />
            <MetricBox icon={Layers} label="Objects" val="2.4M+" />
            <MetricBox icon={ShieldCheck} label="Defense" val="Active" />
          </div>
        </div>
      </main>

      {/* --- STATUS FOOTER --- */}
      <footer className="fixed bottom-0 w-full px-6 lg:px-12 py-5 bg-[#040508]/90 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-12 font-mono overflow-x-auto w-full md:w-auto">
            <FooterItem label="Net_Load" val="12.4%" />
            <FooterItem label="Uptime" val="99.99%" />
            <FooterItem label="Latency" val="14ms" />
          </div>
          <div className="flex items-center gap-4 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-sm shrink-0">
            <Lock size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              Secure Uplink Verified
            </span>
          </div>
        </div>
      </footer>

      <style>{styles}</style>
    </div>
  );
};

// --- TECHNICAL HELPER COMPONENTS ---

const NavInfo = ({ icon: Icon, label, val }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={12} className="text-orange-600" />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
    <span className="text-[12px] font-black text-white uppercase tracking-tight">
      {val}
    </span>
  </div>
);

const DataBlock = ({ label, val, unit, color = "text-white" }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
      {label}
    </span>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-black italic tracking-tighter ${color}`}>
        {val}
      </span>
      {unit && (
        <span className="text-[10px] font-bold text-slate-600">{unit}</span>
      )}
    </div>
  </div>
);

const MetricBox = ({ icon: Icon, label, val }) => (
  <div className="ui-parallax bg-white/[0.02] border border-white/10 p-6 flex flex-col justify-between hover:bg-white/[0.06] hover:border-white/20 transition-all group cursor-crosshair">
    <Icon
      size={24}
      className="text-slate-600 group-hover:text-orange-600 transition-colors duration-500"
    />
    <div className="mt-6">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-base font-black text-white uppercase tracking-tight">
        {val}
      </p>
    </div>
  </div>
);

const FooterItem = ({ label, val }) => (
  <div className="flex items-baseline gap-2 whitespace-nowrap">
    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
      {label}:
    </span>
    <span className="text-xs font-bold text-white tabular-nums">{val}</span>
  </div>
);

const styles = `
  .ui-parallax {
    transition: transform 0.1s ease-out;
  }
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  ::-webkit-scrollbar-thumb {
    background: #ea580c;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export default AntarikshLanding;
