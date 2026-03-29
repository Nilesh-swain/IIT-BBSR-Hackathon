import React from "react";
import { AlertTriangle, RefreshCcw, Terminal } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to your internal telemetry
    console.error("CRITICAL_SYSTEM_FAILURE:", error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload(); // Refreshing the context is safer for WebGL crashes
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-[#050000] flex flex-col items-center justify-center text-white p-8 font-mono relative overflow-hidden">
          
          {/* Background Grid/Scanlines Effect */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

          {/* Alert Icon with Pulse */}
          <div className="relative mb-6">
            <AlertTriangle size={80} className="text-red-600 animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse" />
          </div>

          <div className="text-center z-10">
            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-red-500 mb-2">
              System <span className="text-white/20">Degraded</span>
            </h2>
            
            <div className="flex items-center justify-center gap-2 mb-8 text-[10px] tracking-[0.3em] text-red-400/60 uppercase">
              <Terminal size={12} />
              <span>Error_Code: WebGL_Context_Lost_0x0042</span>
            </div>

            <p className="text-xs mb-10 opacity-60 max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
              The neural uplink to the 3D celestial engine has been severed. 
              Atmospheric rendering and asteroid telemetry are currently offline.
            </p>

            <button
              onClick={this.handleRetry}
              className="group relative px-10 py-4 bg-transparent border border-red-500/50 hover:bg-red-500 hover:text-black transition-all duration-300 overflow-hidden"
            >
              {/* Button Glitch Effect */}
              <div className="absolute inset-0 bg-red-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              
              <div className="relative flex items-center gap-3 font-black italic text-sm tracking-widest uppercase">
                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                Re-Initialize Core
              </div>
            </button>
          </div>

          {/* Corner Telemetry Decoration */}
          <div className="absolute bottom-10 left-10 text-[8px] text-white/10 flex flex-col gap-1 uppercase tracking-tighter">
            <span>Lat: 20.2961° N</span>
            <span>Long: 85.8245° E</span>
            <span>Status: Emergency_Protocol_Active</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;