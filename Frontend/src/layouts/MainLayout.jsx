import React from "react";
import { CosmosProvider } from "../contexts/CosmosContext";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";

export default function MainLayout({ children }) {
  return (
    <CosmosProvider>
      <div className="flex h-screen w-full bg-[#050505] text-white font-mono overflow-hidden">
        
        {/* 1. GLOBAL SYSTEM OVERLAYS */}
        {/* Subtle Static/Noise texture for that military monitor feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-[999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Tactical Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* 2. SIDEBAR (Fixed 72w / 288px) */}
        <Sidebar />

        {/* 3. MAIN COMMAND AREA */}
        {/* ml-72 matches the sidebar width exactly */}
        <div className="flex flex-col flex-1 ml-72 relative h-full">
          
          <Topbar />

          {/* 4. CONTENT VIEWPORT */}
          {/* pt-20 matches the topbar height exactly */}
          <main className="flex-1 w-full h-full relative pt-20 overflow-y-auto overflow-x-hidden custom-scrollbar">
            
            {/* Ambient Corner Accents */}
            <div className="absolute top-24 left-4 w-2 h-2 border-t border-l border-[#FF5E00] opacity-50" />
            <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-[#FF5E00] opacity-50" />

            {/* Rendered Page Content */}
            <div className="relative z-10 min-h-full">
              {children}
            </div>

          </main>
        </div>

        {/* CSS for Professional Scrollbars */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #FF5E00;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: white;
          }
        `}</style>
      </div>
    </CosmosProvider>
  );
}