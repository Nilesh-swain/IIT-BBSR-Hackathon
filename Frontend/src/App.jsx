import React, { useState, useEffect } from "react";
import AppNavigator from "./navigation/AppNavigator";
import { apiGet } from "./utils/api.js";

function App() {
  const [serverStatus, setServerStatus] = useState({
    label: "PINGING UPLINK...",
    detail: "Checking backend health.",
    tone: "amber",
  });

  useEffect(() => {
    apiGet("/api/status")
      .then((res) => {
        setServerStatus(
          res?.status === "ok"
            ? {
                label: "UPLINK SECURE",
                detail: "Backend is responding normally.",
                tone: "emerald",
              }
            : {
                label: "UPLINK UNSTABLE",
                detail: "Backend responded with an unexpected status.",
                tone: "amber",
              },
        );
      })
      .catch((error) => {
        const wakingUp = error.message?.toLowerCase().includes("waking up");
        setServerStatus({
          label: wakingUp ? "SERVER WAKING" : "UPLINK OFFLINE",
          detail: wakingUp
            ? "Server is waking up, please wait..."
            : "Backend is unreachable right now.",
          tone: wakingUp ? "amber" : "red",
        });
      });
  }, []);

  return (
    <div className="h-screen w-full bg-[#020308] overflow-hidden selection:bg-orange-500/30 relative">
      <AppNavigator />

      {/* Connection Test Overlay */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-sm border border-white/10 bg-black/80 p-3 backdrop-blur-md">
        <div 
          className={`h-2 w-2 animate-pulse rounded-full ${
            serverStatus.tone === "emerald" ? "bg-emerald-500" :
            serverStatus.tone === "amber" ? "bg-amber-500" : "bg-red-500"
          }`} 
        />
        <div className="font-mono text-[9px] font-black uppercase tracking-widest text-white/50">
          <div>
            Render API: <span className={
              serverStatus.tone === "emerald" ? "text-emerald-500" :
              serverStatus.tone === "amber" ? "text-amber-500" : "text-red-500"
            }>{serverStatus.label}</span>
          </div>
          <div className="mt-1 text-[8px] tracking-[0.14em] text-white/35">
            {serverStatus.detail}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
