import React, { useState, useEffect } from "react";
import { useCosmos } from "../contexts/CosmosContext";
import { 
  Radio, 
  Target, 
  Zap, 
  ShieldCheck, 
  Activity 
} from "lucide-react";
import NotificationBell from "./NotificationBell.jsx";

export default function Topbar() {
  const [time, setTime] = useState(new Date());
  const { selectedPlanet } = useCosmos();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-24 bg-[#050505] border-b border-white/10 z-[150] px-12 flex items-center justify-between font-mono select-none overflow-visible">
      
      {/* 1. INDUSTRIAL SUBSTRATE */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.01] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF5E00]/40 to-transparent" />

      {/* LEFT: GROUND STATION TELEMETRY */}
      <div className="flex items-center gap-14 relative z-10">
        <div className="flex flex-col relative">
          {/* Hardware Corner Accent */}
          <div className="absolute -left-3 -top-1 w-2 h-2 border-t border-l border-[#FF5E00]" />
          
          <div className="flex items-center gap-2 mb-1">
            <Radio size={12} className="text-[#FF5E00] animate-pulse" />
            <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">
              Primary_Station
            </span>
          </div>
          <span className="text-base font-black text-white tracking-widest uppercase">
            ISTRAC <span className="text-[#FF5E00]">BLR_STR_04</span>
          </span>
        </div>

        <div className="flex flex-col border-l border-white/10 pl-8">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={12} className="text-emerald-500" />
            <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">
              Uplink_Sync
            </span>
          </div>
          <span className="text-base font-black text-emerald-500 tracking-tighter uppercase italic">
            99.99% STABLE
          </span>
        </div>
      </div>

      {/* CENTER: PAYLOAD ACQUISITION STATUS */}
      <div className="flex-1 flex justify-center px-10">
        {selectedPlanet ? (
          <div className="flex items-center gap-10 bg-[#080808] px-10 py-3 border border-white/10 rounded-none shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative">
            <div className="absolute -top-px left-0 w-full h-[1px] bg-[#FF5E00]/50" />
            
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-[#FF5E00] font-black uppercase tracking-[0.4em]">Target_ID</span>
              <span className="text-lg font-black text-white uppercase tracking-tight italic">
                {selectedPlanet.name}
              </span>
            </div>

            <div className="relative">
              <Target size={28} className="text-[#FF5E00] animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-0 border border-[#FF5E00]/20 rounded-full animate-ping" />
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] text-[#FF5E00] font-black uppercase tracking-[0.4em]">Risk_Index</span>
              <span className="text-lg font-black text-white uppercase tracking-tight italic">
                CAT_01_SECURE
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 py-3 px-10 border border-dashed border-white/10 opacity-30">
            <Zap size={16} className="text-white animate-bounce" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.6em]">
              Awaiting Orbital Payload_V4.1...
            </span>
          </div>
        )}
      </div>

      {/* RIGHT: CHRONOS & AUTHENTICATION */}
      <div className="flex items-center gap-8 relative z-10">
        
        {/* Tactical Alerts */}
        <NotificationBell />

        <div className="h-10 w-[1px] bg-white/10" />

        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mb-1">
            Chronos_Sync
          </span>
          <span className="text-2xl font-black text-white tracking-[0.1em] tabular-nums leading-none">
            {formatTime(time)}
          </span>
        </div>

        {/* ISRO-Style Secure Button */}
        <button className="flex items-center gap-4 px-8 py-4 bg-[#FF5E00] text-black hover:bg-white transition-all duration-300 transform skew-x-[-12deg] group">
          <div className="skew-x-[12deg] flex items-center gap-3">
            <ShieldCheck size={18} strokeWidth={3} />
            <div className="flex flex-col leading-none items-start">
              <span className="text-[10px] font-black uppercase tracking-tighter">Verified_Access</span>
              <span className="text-[7px] font-bold opacity-70 uppercase tracking-widest mt-1">Uplink_Secure</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
