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
  Send,
  Mail,
} from "lucide-react";
import gsap from "gsap";

const AntarikshLanding = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toISOString());
  const [contact, setContact] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactState, setContactState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toISOString()), 1000);
    const ctx = gsap.context(() => {
      const moveLayers = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5);
        const yPos = (clientY / window.innerHeight - 0.5);
        gsap.to(".ui-parallax", { x: xPos * 25, y: yPos * 25, duration: 2, ease: "power2.out" });
      };
      window.addEventListener("mousemove", moveLayers);
      return () => {
        window.removeEventListener("mousemove", moveLayers);
        clearInterval(timer);
      };
    });
    return () => ctx.revert();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactState({ loading: true, error: "", success: "" });

    try {
      const response = await apiPost("/api/community/contact", contact);
      setContactState({
        loading: false,
        error: "",
        success: response.message || "Message sent successfully.",
      });
      setContact({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setContactState({
        loading: false,
        error: error.message || "Unable to send message right now.",
        success: "",
      });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-[#040508] text-slate-200 overflow-x-hidden font-sans antialiased">
      
      {/* --- BACKGROUND ARCHITECTURE --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-600/5 via-transparent to-transparent" />
      </div>

      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="absolute top-0 w-full z-50 px-4 py-6 sm:px-6 lg:px-12 lg:py-8 flex justify-between items-center border-b border-white/5 bg-[#040508]/60 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">Antariksh</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" />
              <p className="text-[9px] font-bold tracking-[0.4em] text-orange-600/80 uppercase">Defense Network v2.0</p>
            </div>
          </div>
          <div className="hidden md:flex gap-8 border-l border-white/10 pl-10">
            <NavInfo icon={Globe} label="Region" val="IND-WEST" />
            <NavInfo icon={Cpu} label="System" val="Optimal" />
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Chronos_Sync</p>
              <p className="text-lg font-bold text-white tabular-nums tracking-tight">{time.split('T')[1].split('.')[0]}</p>
           </div>
           <button onClick={() => navigate("/auth/signup")} className="px-6 py-2.5 border border-white/10 hover:bg-white/5 text-white font-black text-[10px] uppercase tracking-widest transition-all rounded-sm">
             Enroll
           </button>
           <button onClick={() => navigate("/auth/login")} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest transition-all rounded-sm">
             Login
           </button>
        </div>
      </nav>

      {/* --- MAIN INTERFACE --- */}
      <main className="relative z-10 min-h-full pt-28 pb-36 px-4 sm:px-6 lg:px-12 flex flex-col justify-center">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: MISSION STATEMENT */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-orange-600/10 border border-orange-600/20 rounded-full mb-6">
                 <Radio size={12} className="text-orange-600 animate-pulse" />
                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">NASA-API-Integration</span>
              </div>
              
              <h1 className="text-6xl xl:text-7xl font-black text-white leading-[1.1] tracking-tight uppercase">
                Planetary <span className="text-orange-600 italic">Defense</span> <br /> 
                & Risk Analysis.
              </h1>

              <p className="mt-8 max-w-xl text-xl text-slate-400 font-normal leading-relaxed">
                The definitive dashboard for tracking <span className="text-white font-semibold">Near-Earth Objects (NEOs)</span>. 
                Utilizing trajectory modeling to categorize orbital threats in real-time.
              </p>

              <div className="flex gap-6 mt-12">
                <button 
                  onClick={() => navigate("/auth/signup")}
                  className="group flex items-center gap-6 px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-orange-900/10"
                >
                  Establish Uplink <ChevronRight size={18} />
                </button>
                <button className="px-10 py-5 border border-white/10 hover:bg-white/5 text-white font-black text-xs uppercase tracking-[0.3em] transition-all">
                  Documentation
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: TACTICAL BENTO GRID */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Object Card */}
            <div className="col-span-2 ui-parallax bg-white/[0.02] border border-white/10 p-8 backdrop-blur-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Compass size={80} className="text-orange-600" />
               </div>
               <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Priority_Target</p>
               <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Asteroid_99942</h3>
               <div className="mt-6 flex gap-10 border-t border-white/5 pt-6">
                  <DataBlock label="Velocity" val="30.7 km/s" />
                  <DataBlock label="Distance" val="0.024 AU" />
                  <DataBlock label="Risk" val="CAT-01" color="text-emerald-500" />
               </div>
            </div>

            {/* Small Metrics */}
            <MetricBox icon={Activity} label="Telemetry" val="Syncing" />
            <MetricBox icon={Database} label="NASA_DB" val="Connected" />
            <MetricBox icon={Layers} label="Objects" val="2.4M+" />
            <MetricBox icon={ShieldCheck} label="Defense" val="Active" />

            <div className="col-span-1 sm:col-span-2 ui-parallax bg-white/[0.02] border border-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5">
                <Mail size={16} className="text-orange-600" />
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">
                  Contact Relay
                </p>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    placeholder="Name"
                    className="landing-input"
                  />
                  <input
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="Email"
                    type="email"
                    className="landing-input"
                  />
                </div>
                <input
                  value={contact.subject}
                  onChange={(e) => setContact({ ...contact, subject: e.target.value })}
                  placeholder="Subject"
                  className="landing-input"
                />
                <textarea
                  value={contact.message}
                  onChange={(e) => setContact({ ...contact, message: e.target.value })}
                  placeholder="Send feedback or deployment issue details"
                  rows="4"
                  className="landing-input min-h-[110px] resize-none"
                />
                {contactState.error ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">
                    {contactState.error}
                  </p>
                ) : null}
                {contactState.success ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                    {contactState.success}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={contactState.loading}
                  className="w-full sm:w-auto px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {contactState.loading ? "Sending" : "Send Relay"}
                  <Send size={14} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>

      {/* --- STATUS FOOTER --- */}
      <footer className="relative w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-8 bg-[#040508]/80 backdrop-blur-md border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-16 font-mono">
            <FooterItem label="Network_Load" val="12.4%" />
            <FooterItem label="Uptime" val="99.99%" />
            <FooterItem label="Latency" val="14ms" />
          </div>
          <div className="flex items-center gap-4 px-5 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
            <Lock size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Secure Uplink Verified</span>
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
    <div className="flex items-center gap-2 mb-0.5">
      <Icon size={10} className="text-orange-600" />
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</span>
    </div>
    <span className="text-[11px] font-bold text-white uppercase">{val}</span>
  </div>
);

const DataBlock = ({ label, val, color = "text-white" }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-xl font-black italic tracking-tighter ${color}`}>{val}</span>
  </div>
);

const MetricBox = ({ icon: Icon, label, val }) => (
  <div className="ui-parallax bg-white/[0.02] border border-white/10 p-6 flex flex-col justify-between hover:bg-white/[0.04] transition-colors group cursor-crosshair">
    <Icon size={20} className="text-slate-600 group-hover:text-orange-600 transition-colors" />
    <div className="mt-4">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-white uppercase">{val}</p>
    </div>
  </div>
);

const FooterItem = ({ label, val }) => (
  <div className="flex items-baseline gap-3">
    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{label}:</span>
    <span className="text-sm font-bold text-white tabular-nums">{val}</span>
  </div>
);

const styles = `
  .landing-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.85rem 0.95rem;
    color: white;
    font-size: 0.85rem;
    outline: none;
    transition: all 0.2s ease;
  }
  .landing-input:focus {
    border-color: rgba(234, 88, 12, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }
  .landing-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`;

export default AntarikshLanding;
