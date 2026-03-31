// // import React from "react";
// // import { Link, useLocation } from "react-router-dom";
// // import { useCosmos } from "../contexts/CosmosContext";
// // import { 
// //   Globe, 
// //   Database, 
// //   ShieldAlert, 
// //   Activity, 
// //   Settings, 
// //   LogOut, 
// //   Target, 
// //   Zap, 
// //   Box, 
// //   Cpu,
// //   User
// // } from "lucide-react";

// // export default function Sidebar() {
// //   const location = useLocation();
// //   const { selectedPlanet } = useCosmos();

// //   // HIGH-END TACTICAL NAMING CONVENTION
// //   const menuItems = [
// //     { name: "ORBITAL_CANVAS", path: "/cosmos", icon: <Globe size={18} /> },
// //     { name: "DATA_REGISTRY", path: "/registry", icon: <Database size={18} /> },
// //     { name: "Impact Analyzer", path: "/telemetry", icon: <Activity size={18} /> }, // Impact Analyzer
// //     { name: "THREAT_MONITOR", path: "/threats", icon: <ShieldAlert size={18} /> },
// //     { name: "RESEARCH_FACILITY", path: "/research-lab", icon: <Box size={18} /> },
// //     { name: "CORE_PROFILE", path: "/profile", icon: <User size={18} /> },
// //   ];

// //   return (
// //     <aside className="fixed left-0 top-0 h-screen w-72 bg-[#050505] border-r border-white/10 flex flex-col z-[200] font-mono select-none">
      
// //       {/* 1. BRANDING & MISSION HEADERS */}
// //       <div className="p-8 bg-[#080808] border-b border-white/5 relative overflow-hidden">
// //         <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5E00]" />
// //         <div className="flex flex-col relative z-10">
// //           <span className="text-white font-black italic tracking-tighter text-2xl leading-none">
// //             ANTARIKSH
// //           </span>
// //           <div className="flex items-center gap-2 mt-2">
// //             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
// //             <span className="text-[#FF5E00] font-black text-[9px] uppercase tracking-[0.4em]">
// //               ASTRAEA_MAIN_OPS
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 2. NAVIGATION MODULES */}
// //       <nav className="flex-1 mt-6 px-4 space-y-1">
// //         <p className="text-[9px] font-black text-white/20 tracking-[0.5em] uppercase mb-6 pl-4">
// //           Core_Modules
// //         </p>
        
// //         {menuItems.map((item) => {
// //           const isActive = location.pathname === item.path;
// //           return (
// //             <Link
// //               key={item.path}
// //               to={item.path}
// //               className={`relative flex items-center gap-5 px-4 py-4 transition-all duration-200 border-l-2 ${
// //                 isActive 
// //                   ? "bg-white/[0.03] border-[#FF5E00] text-white" 
// //                   : "bg-transparent border-transparent text-white/30 hover:text-white hover:bg-white/[0.02]"
// //               }`}
// //             >
// //               <div className={`${isActive ? "text-[#FF5E00]" : "text-white/20"}`}>
// //                 {item.icon}
// //               </div>
// //               <span className={`text-[11px] tracking-[0.15em] font-black uppercase italic ${isActive ? "opacity-100" : "opacity-60"}`}>
// //                 {item.name}
// //               </span>
              
// //               {isActive && (
// //                 <div className="absolute right-4 w-1 h-1 bg-[#FF5E00] rounded-full shadow-[0_0_10px_#FF5E00]" />
// //               )}
// //             </Link>
// //           );
// //         })}
// //       </nav>

// //       {/* 3. TARGET LOCK: TELEMETRY FEED */}
// //       <div className="px-6 py-8 border-t border-white/5 bg-[#070707]">
// //         <div className="flex items-center justify-between mb-4">
// //           <div className="flex items-center gap-2">
// //             <Target size={12} className="text-[#FF5E00]" />
// //             <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Active_Target</span>
// //           </div>
// //           {selectedPlanet && <span className="text-[8px] bg-[#FF5E00] text-black px-1.5 font-black italic">LOCKED</span>}
// //         </div>

// //         {selectedPlanet ? (
// //           <div className="space-y-4">
// //             <div className="flex flex-col">
// //               <span className="text-sm font-black text-white italic tracking-widest">
// //                 {selectedPlanet.name.toUpperCase()}
// //               </span>
// //               <span className="text-[10px] text-[#00FF41] font-bold mt-1 tracking-tighter uppercase font-mono">
// //                 Velocity: 29.78 km/s
// //               </span>
// //             </div>
            
// //             <div className="h-[2px] w-full bg-white/5 overflow-hidden">
// //                <div className="h-full bg-[#FF5E00] w-2/3 animate-pulse" />
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="py-2 flex items-center gap-3">
// //             <Cpu size={14} className="text-white/10 animate-spin-slow" />
// //             <span className="text-[9px] text-white/20 uppercase tracking-widest">Scanning_Uplink...</span>
// //           </div>
// //         )}
// //       </div>

// //       {/* 4. UTILITY ACTIONS */}
// //       <div className="p-3 grid grid-cols-2 gap-2 bg-[#050505] border-t border-white/5">
// //         <button className="flex items-center justify-center py-4 bg-white/[0.03] border border-white/10 text-white/30 hover:text-white hover:bg-white/5 transition-colors group">
// //           <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
// //         </button>
// //         <button className="flex items-center justify-center py-4 bg-rose-500/[0.02] border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors group">
// //           <LogOut size={14} />
// //         </button>
// //       </div>

// //     </aside>
// //   );
// // }



// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useCosmos } from "../contexts/CosmosContext";
// import { 
//   Globe, 
//   Database, 
//   ShieldAlert, 
//   Activity, 
//   Settings, 
//   LogOut, 
//   Target, 
//   Zap, 
//   Box, 
//   Cpu,
//   User,
//   MessageSquare // Recommended icon for Community
// } from "lucide-react";

// export default function Sidebar() {
//   const location = useLocation();
//   const { selectedPlanet } = useCosmos();

//   // HIGH-END TACTICAL NAMING CONVENTION
//   const menuItems = [
//     { name: "ORBITAL_CANVAS", path: "/cosmos", icon: <Globe size={18} /> },
//     { name: "DATA_REGISTRY", path: "/registry", icon: <Database size={18} /> },
//     { name: "IMPACT_ANALYZER", path: "/telemetry", icon: <Activity size={18} /> },
//     { name: "THREAT_MONITOR", path: "/threats", icon: <ShieldAlert size={18} /> },
//     { name: "RESEARCH_FACILITY", path: "/research-lab", icon: <Box size={18} /> },
//     { name: "CORE_PROFILE", path: "/profile", icon: <User size={18} /> },
//     { name: "COMMUNITY_PAGE", path: "/community", icon: <MessageSquare size={18} /> }, // Added at the end
//   ];

//   return (
//     <aside className="fixed left-0 top-0 h-screen w-72 bg-[#050505] border-r border-white/10 flex flex-col z-[200] font-mono select-none">
      
//       {/* 1. BRANDING & MISSION HEADERS */}
//       <div className="p-8 bg-[#080808] border-b border-white/5 relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5E00]" />
//         <div className="flex flex-col relative z-10">
//           <span className="text-white font-black italic tracking-tighter text-2xl leading-none">
//             ANTARIKSH
//           </span>
//           <div className="flex items-center gap-2 mt-2">
//             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
//             <span className="text-[#FF5E00] font-black text-[9px] uppercase tracking-[0.4em]">
//               ASTRAEA_MAIN_OPS
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* 2. NAVIGATION MODULES */}
//       {/* Added overflow-y-auto and custom scrollbar classes to handle the growing list */}
//       <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
//         <p className="text-[9px] font-black text-white/20 tracking-[0.5em] uppercase mb-6 pl-4">
//           Core_Modules
//         </p>
        
//         {menuItems.map((item) => {
//           const isActive = location.pathname === item.path;
//           return (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`relative flex items-center gap-5 px-4 py-4 transition-all duration-200 border-l-2 ${
//                 isActive 
//                   ? "bg-white/[0.03] border-[#FF5E00] text-white" 
//                   : "bg-transparent border-transparent text-white/30 hover:text-white hover:bg-white/[0.02]"
//               }`}
//             >
//               <div className={`${isActive ? "text-[#FF5E00]" : "text-white/20"}`}>
//                 {item.icon}
//               </div>
//               <span className={`text-[11px] tracking-[0.15em] font-black uppercase italic ${isActive ? "opacity-100" : "opacity-60"}`}>
//                 {item.name}
//               </span>
              
//               {isActive && (
//                 <div className="absolute right-4 w-1 h-1 bg-[#FF5E00] rounded-full shadow-[0_0_10px_#FF5E00]" />
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* 3. TARGET LOCK: TELEMETRY FEED */}
//       <div className="px-6 py-8 border-t border-white/5 bg-[#070707]">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <Target size={12} className="text-[#FF5E00]" />
//             <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Active_Target</span>
//           </div>
//           {selectedPlanet && <span className="text-[8px] bg-[#FF5E00] text-black px-1.5 font-black italic">LOCKED</span>}
//         </div>

//         {selectedPlanet ? (
//           <div className="space-y-4">
//             <div className="flex flex-col">
//               <span className="text-sm font-black text-white italic tracking-widest">
//                 {selectedPlanet.name.toUpperCase()}
//               </span>
//               <span className="text-[10px] text-[#00FF41] font-bold mt-1 tracking-tighter uppercase font-mono">
//                 Velocity: 29.78 km/s
//               </span>
//             </div>
            
//             <div className="h-[2px] w-full bg-white/5 overflow-hidden">
//                <div className="h-full bg-[#FF5E00] w-2/3 animate-pulse" />
//             </div>
//           </div>
//         ) : (
//           <div className="py-2 flex items-center gap-3">
//             <Cpu size={14} className="text-white/10 animate-spin-slow" />
//             <span className="text-[9px] text-white/20 uppercase tracking-widest">Scanning_Uplink...</span>
//           </div>
//         )}
//       </div>

//       {/* 4. UTILITY ACTIONS */}
//       <div className="p-3 grid grid-cols-2 gap-2 bg-[#050505] border-t border-white/5">
//         <button className="flex items-center justify-center py-4 bg-white/[0.03] border border-white/10 text-white/30 hover:text-white hover:bg-white/5 transition-colors group">
//           <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
//         </button>
//         <button className="flex items-center justify-center py-4 bg-rose-500/[0.02] border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors group">
//           <LogOut size={14} />
//         </button>
//       </div>

//     </aside>
//   );
// }






import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCosmos } from "../contexts/CosmosContext";
import { 
  Globe, 
  Database, 
  ShieldAlert, 
  Activity, 
  Settings, 
  LogOut, 
  Target, 
  Box, 
  Cpu,
  User,
  MessageSquare 
} from "lucide-react";
import { apiGet } from "../utils/api.js";
import { useNotifications } from "../contexts/NotificationContext.jsx";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPlanet } = useCosmos();
  const { addNotification } = useNotifications();

  // HIGH-END TACTICAL MENU CONFIGURATION
  const menuItems = [
    { name: "ORBITAL_CANVAS", path: "/cosmos", icon: <Globe size={18} /> },
    { name: "DATA_REGISTRY", path: "/registry", icon: <Database size={18} /> },
    { name: "IMPACT_ANALYZER", path: "/telemetry", icon: <Activity size={18} /> },
    { name: "THREAT_MONITOR", path: "/threats", icon: <ShieldAlert size={18} /> },
    { name: "RESEARCH_FACILITY", path: "/research", icon: <Box size={18} /> },
    { name: "COMMUNITY_PAGE", path: "/community", icon: <MessageSquare size={18} /> },
    { name: "CORE_PROFILE", path: "/profile", icon: <User size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      await apiGet("/api/auth/logout");
      addNotification({
        title: "Session Closed",
        message: "Your secure uplink session has been terminated.",
        type: "INFO",
      });
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#050505] border-r border-white/10 flex flex-col z-[200] font-mono select-none">
      
      {/* 1. BRANDING & MISSION HEADERS */}
      <div className="p-8 bg-[#080808] border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5E00]" />
        <div className="flex flex-col relative z-10">
          <span className="text-white font-black italic tracking-tighter text-2xl leading-none uppercase">
            Antariksh
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[#FF5E00] font-black text-[9px] uppercase tracking-[0.4em]">
              ASTRAEA_MAIN_OPS
            </span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION MODULES */}
      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        <p className="text-[9px] font-black text-white/20 tracking-[0.5em] uppercase mb-6 pl-4">
          Core_Modules
        </p>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-5 px-4 py-4 transition-all duration-200 border-l-2 ${
                isActive 
                  ? "bg-white/[0.03] border-[#FF5E00] text-white" 
                  : "bg-transparent border-transparent text-white/30 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <div className={`${isActive ? "text-[#FF5E00]" : "text-white/20"}`}>
                {item.icon}
              </div>
              <span className={`text-[11px] tracking-[0.15em] font-black uppercase italic ${isActive ? "opacity-100" : "opacity-60"}`}>
                {item.name}
              </span>
              
              {isActive && (
                <div className="absolute right-4 w-1 h-1 bg-[#FF5E00] rounded-full shadow-[0_0_10px_#FF5E00]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. TARGET LOCK: TELEMETRY FEED */}
      <div className="px-6 py-8 border-t border-white/5 bg-[#070707]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={12} className="text-[#FF5E00]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Active_Target</span>
          </div>
          {selectedPlanet && <span className="text-[8px] bg-[#FF5E00] text-black px-1.5 font-black italic">LOCKED</span>}
        </div>

        {selectedPlanet ? (
          <div className="space-y-4">
            <div className="flex flex-col text-white">
              <span className="text-sm font-black italic tracking-widest uppercase">
                {selectedPlanet.name}
              </span>
              <span className="text-[10px] text-[#00FF41] font-bold mt-1 tracking-tighter uppercase font-mono">
                Velocity: 29.78 km/s
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 flex items-center gap-3">
            <Cpu size={14} className="text-white/10 animate-spin-slow" />
            <span className="text-[9px] text-white/20 uppercase tracking-widest">Scanning_Uplink...</span>
          </div>
        )}
      </div>

      {/* 4. UTILITY ACTIONS */}
      <div className="p-3 grid grid-cols-2 gap-2 bg-[#050505] border-t border-white/5">
        <Link
          to="/settings"
          className={`flex items-center justify-center py-4 border transition-colors ${
            location.pathname === "/settings"
              ? "bg-[#FF5E00] border-[#FF5E00] text-black"
              : "bg-white/[0.03] border border-white/10 text-white/30 hover:text-white"
          }`}
        >
          <Settings size={14} />
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center py-4 bg-rose-500/[0.02] border border-rose-500/10 text-rose-500/40 hover:text-rose-500 transition-colors"
        >
          <LogOut size={14} />
        </button>
      </div>

    </aside>
  );
}

