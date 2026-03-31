import React, { useState, useEffect } from "react";
import AppNavigator from "./navigation/AppNavigator";
import { apiGet } from "./utils/api.js";

function App() {
  const [serverStatus, setServerStatus] = useState("PINGING UPLINK...");

  useEffect(() => {
    // 🚀 Test Route: Proves frontend can talk to backend
    apiGet("/api/status")
      .then((res) => {
        setServerStatus(res?.status === "Active" ? "UPLINK SECURE" : "UPLINK UNSTABLE");
      })
      .catch(() => {
        setServerStatus("UPLINK OFFLINE");
      });
  }, []);

  return (
    <div className="h-screen w-full bg-[#020308] overflow-hidden selection:bg-orange-500/30 relative">
      <AppNavigator />

      {/* Connection Test Overlay */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-sm border border-white/10 bg-black/80 p-3 backdrop-blur-md">
        <div 
          className={`h-2 w-2 animate-pulse rounded-full ${
            serverStatus === "UPLINK SECURE" ? "bg-emerald-500" : 
            serverStatus === "PINGING UPLINK..." ? "bg-amber-500" : "bg-red-500"
          }`} 
        />
        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-white/50">
          Render API: <span className={
            serverStatus === "UPLINK SECURE" ? "text-emerald-500" : 
            serverStatus === "PINGING UPLINK..." ? "text-amber-500" : "text-red-500"
          }>{serverStatus}</span>
        </span>
      </div>
    </div>
  );
}

export default App;
