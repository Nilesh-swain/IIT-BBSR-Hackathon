import React, { useState, useEffect, useCallback } from "react";
import { 
  Radar, ShieldAlert, ChevronDown, ChevronUp, 
  Activity, Clock, Maximize2, ExternalLink, Search 
} from "lucide-react";
import { apiGet } from "../../utils/api.js";

const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const BASE_URL = import.meta.env.VITE_NASA_BASE_URL || "https://api.nasa.gov/neo/rest/v1";

const RiskMonitor = () => {
  const [hazardous, setHazardous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCriticalData = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const targetUrl = `${BASE_URL}/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY || "DEMO_KEY"}`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("NASA API Request Failed");
      
      const data = await response.json();
      const allObjects = Object.values(data.near_earth_objects).flat();
      
      const filtered = allObjects
        .filter(obj => obj.is_potentially_hazardous_asteroid)
        .sort((a, b) => {
          const distA = parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || 0);
          const distB = parseFloat(b.close_approach_data?.[0]?.miss_distance?.kilometers || 0);
          return distA - distB;
        });

      setHazardous(filtered);
    } catch (err) {
      console.warn("NASA Uplink Failure. Switching to Local Database:", err.message);
      try {
        const cachedData = await apiGet("/api/asteroids/hazardous");
        if (cachedData?.success && cachedData.hazardous) {
          setHazardous(cachedData.hazardous);
        }
      } catch (backendErr) {
        console.error("Critical: Registry Offline.", backendErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCriticalData(); }, [fetchCriticalData]);

  const filteredList = hazardous.filter(ast => 
    ast.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen bg-[#020202] flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-4">
        <Radar className="text-orange-600 animate-pulse w-10 h-10" />
        <span className="text-xs text-zinc-500 tracking-[0.6em] uppercase">Authenticating_Uplink</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 font-sans selection:bg-orange-500/30">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        
        {/* Professional Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-zinc-900 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping" />
              <span className="text-[12px] font-bold text-orange-600 tracking-[0.4em] uppercase">Operational Intelligence</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
              Orbital <span className="text-zinc-500 italic font-light">Risk</span> Monitor
            </h1>
          </div>

          <div className="flex items-center gap-10">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search Sector..."
                className="bg-zinc-900/50 border border-zinc-800 py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-600 transition-all w-64 text-white"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-right border-l border-zinc-800 pl-8">
              <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Total Threats</p>
              <p className="text-4xl font-black text-white leading-none">{hazardous.length}</p>
            </div>
          </div>
        </header>

        {/* Content Feed */}
        <div className="grid grid-cols-1 gap-4">
          {filteredList.length > 0 ? (
            filteredList.map((ast) => (
              <HazardCard 
                key={ast.id} 
                ast={ast} 
                isExpanded={expandedId === ast.id}
                onToggle={() => setExpandedId(expandedId === ast.id ? null : ast.id)}
              />
            ))
          ) : (
            <div className="py-32 text-center bg-zinc-900/10 border border-zinc-900 rounded-lg">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-[0.3em]">No Active Intercepts Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HazardCard = ({ ast, isExpanded, onToggle }) => {
  const data = ast.close_approach_data[0];
  const velocity = Math.round(data.relative_velocity.kilometers_per_hour).toLocaleString();
  const missDist = (parseFloat(data.miss_distance.kilometers) / 1000000).toFixed(2);

  return (
    <div className={`transition-all duration-500 border rounded-sm overflow-hidden ${isExpanded ? 'border-orange-600 bg-zinc-900/40 shadow-2xl' : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-600'}`}>
      <div 
        className="p-8 flex flex-col lg:flex-row items-center justify-between gap-10 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-orange-600 bg-orange-600/10 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">PHA_OBJECT</span>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">ID: {ast.neo_reference_id}</span>
          </div>
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight group-hover:text-orange-500 transition-colors">
            {ast.name.replace(/[()]/g, "")}
          </h3>
        </div>

        <div className="flex items-center gap-16">
          <DisplayMetric label="Velocity" value={`${velocity} km/h`} />
          <DisplayMetric label="Miss Distance" value={`${missDist}M km`} />
          <div className="hidden lg:block">
            {isExpanded ? <ChevronUp className="text-orange-600" size={24} /> : <ChevronDown className="text-zinc-700" size={24} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 border-t border-zinc-800 bg-black/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-in fade-in zoom-in-95 duration-300">
          <DetailSection title="Astrometry Details">
            <InfoLine label="Max Est. Diameter" value={`${ast.estimated_diameter.meters.estimated_diameter_max.toFixed(1)} m`} />
            <InfoLine label="Abs. Magnitude" value={ast.absolute_magnitude_h} />
            <InfoLine label="Sentry Status" value={ast.is_sentry_object ? "Active" : "None"} />
          </DetailSection>

          <DetailSection title="Close Approach Path">
            <InfoLine label="Approach Epoch" value={data.close_approach_date_full} />
            <InfoLine label="Orbiting Body" value={data.orbiting_body} />
            <InfoLine label="Lunar Distance" value={`${parseFloat(data.miss_distance.lunar).toFixed(1)} LD`} />
          </DetailSection>

          <div className="flex flex-col justify-end gap-3">
            <a 
              href={ast.nasa_jpl_url} 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-4 px-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] text-center hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Full Data Access <ExternalLink size={14} />
            </a>
            <button className="w-full py-4 px-6 border border-zinc-800 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:border-white hover:text-white transition-all">
              Initialize Tracking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* Components for Cleaner Structure */
const DisplayMetric = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-bold text-zinc-200 font-mono tracking-tighter">{value}</p>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div className="space-y-5">
    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] flex items-center gap-2">
      <div className="w-1 h-3 bg-orange-600" /> {title}
    </h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoLine = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
    <span className="text-[12px] text-zinc-500 font-medium">{label}</span>
    <span className="text-[12px] font-mono font-bold text-zinc-100">{value}</span>
  </div>
);

export default RiskMonitor;
