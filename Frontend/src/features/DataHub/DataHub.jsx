import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Activity,
  AlertCircle,
  Zap,
  Box,
  Compass,
  Bookmark,
  BookmarkCheck,
  LayoutGrid,
  Archive,
  ShieldCheck,
  Database,
  Trash2,
  Download,
  HardDrive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost } from "../../utils/api.js";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY;
const NASA_BASE_URL = import.meta.env.VITE_NASA_BASE_URL;

const DataHub = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [savedAsteroids, setSavedAsteroids] = useState([]);
  const [viewMode, setViewMode] = useState("live");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const { addNotification } = useNotifications();

  // Check authentication and load this user's private vault
  useEffect(() => {
    const bootstrapVault = async () => {
      try {
        const res = await apiGet("/auth/me");
        const loggedIn = Boolean(res?.data?._id);
        setIsAuthenticated(loggedIn);

        if (loggedIn) {
          await fetchWatchlist();
        } else {
          setSavedAsteroids([]);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setSavedAsteroids([]);
      }
    };

    bootstrapVault();
  }, []);

  // Fetch NASA data
  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const res = await fetch(
          `${NASA_BASE_URL}/feed?api_key=${NASA_API_KEY || "DEMO_KEY"}`,
        );
        const data = await res.json();
        setAsteroids(Object.values(data.near_earth_objects).flat());
      } catch (err) {
        console.error("Uplink Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistry();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setWatchlistLoading(true);
      const data = await apiGet("/watchlist");
      if (data.success) {
        setSavedAsteroids(data.watchlist);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
      // If unauthorized, user might not be logged in
      if (error.message.includes("401") || error.message.includes("AUTH")) {
        setIsAuthenticated(false);
      }
    } finally {
      setWatchlistLoading(false);
    }
  };

  const toggleSave = async (e, ast) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("Please login to save asteroids to your personal vault.");
      return;
    }

    try {
      setWatchlistLoading(true);
      const payload = {
        asteroidId: ast.id,
        name: ast.name,
        asteroidData: ast,
      };

      const response = await apiPost("/watchlist/toggle", payload);

      if (response.success) {
        // Refresh watchlist to get updated data
        await fetchWatchlist();

        addNotification({
          title: response.action === "added" ? "Vault Updated" : "Vault Revised",
          message:
            response.notification ||
            `${ast.name} ${response.action === "added" ? "saved to" : "removed from"} your private asteroid vault.`,
          type: response.action === "added" ? "SUCCESS" : "INFO",
        });

        // Show notification
        alert(
          response.notification ||
            `Asteroid ${response.action === "added" ? "saved" : "removed"} successfully!`,
        );
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
      alert("Failed to save asteroid. Please try again.");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const isSaved = (ast) => {
    return savedAsteroids.some(
      (saved) => String(saved.id || saved.asteroidId) === String(ast.id || ast.asteroidId),
    );
  };

  const handleDownload = (ast) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(ast, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ANTARIKSH_ID_${ast.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredData = useMemo(() => {
    const source = viewMode === "live" ? asteroids : savedAsteroids;
    return source.filter((ast) =>
      ast.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [asteroids, savedAsteroids, query, viewMode]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-[#FF5E00]/30 selection:text-white flex">
      {/* 1. SIDE NAVIGATION (NEW) */}
      <aside className="w-20 border-r border-white/5 bg-black flex flex-col items-center py-8 gap-8 fixed h-full z-[60]">
        <div className="text-[#FF5E00] mb-4">
          <Activity size={24} />
        </div>
        <nav className="flex flex-col gap-6">
          <NavIcon
            active={viewMode === "live"}
            onClick={() => setViewMode("live")}
            icon={<Compass size={20} />}
            label="Live Feed"
          />
          <NavIcon
            active={viewMode === "saved"}
            onClick={() => setViewMode("saved")}
            icon={<Database size={20} />}
            label="Vault"
            count={savedAsteroids.length}
          />
        </nav>
      </aside>

      <div className="flex-1 ml-20">
        {/* 2. NAVIGATION HEADER */}
        <nav className="fixed top-0 right-0 left-20 h-20 border-b border-white/[0.05] bg-black/60 backdrop-blur-md z-50 flex items-center justify-between px-12">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 leading-none mb-1">
                {viewMode === "live" ? "Orbital_Scanner" : "Secure_Archive"}
              </h2>
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase italic">
                {viewMode === "live" ? "Antariksh Live" : "Data_Vault"}
              </h2>
            </div>

            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FF5E00] transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="SCAN_REGISTRY..."
                className="bg-white/[0.03] border border-white/10 w-64 h-9 pl-10 pr-4 text-[9px] uppercase tracking-widest focus:outline-none focus:border-[#FF5E00]/40 transition-all rounded-sm"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <div className="text-right">
              <p className="text-[8px] tracking-[0.3em] uppercase opacity-30 font-bold">
                System_Time
              </p>
              <p className="text-[10px] tracking-widest font-mono uppercase">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </nav>

        <main className="pt-32 px-12 pb-20 max-w-[1600px] mx-auto">
          {/* 3. CONTEXTUAL HEADER */}
          <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
                {viewMode === "live"
                  ? "Celestial Tracking"
                  : "Archived Telemetry"}
              </h1>
              <p className="text-xs text-white/40 font-mono tracking-widest">
                Showing {filteredData.length} records found in{" "}
                {viewMode === "live" ? "NASA_NEOWS_FEED" : "PERSONAL_WATCHLIST"}
              </p>
            </div>
          </div>

          {/* 4. DATA GRID */}
          {loading && viewMode === "live" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-white/[0.02] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredData.map((ast) => (
                  <RegistryCard
                    key={ast.id}
                    ast={ast}
                    isSaved={isSaved(ast)}
                    onToggleSave={toggleSave}
                    onClick={() => setSelected(ast)}
                    watchlistLoading={watchlistLoading}
                    accentColor={
                      viewMode === "saved"
                        ? "border-blue-500/30"
                        : "border-[#FF5E00]/30"
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="text-center py-40 border border-dashed border-white/5 rounded-lg opacity-20">
              <HardDrive size={48} className="mx-auto mb-4" />
              <p className="text-[10px] uppercase tracking-[0.5em]">
                {viewMode === "live"
                  ? "No_Signal_Detected"
                  : "Watchlist_Empty_Add_Some_Asteroids"}
              </p>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            ast={selected}
            isSaved={isSaved(selected)}
            onToggleSave={toggleSave}
            onDownload={handleDownload}
            onClose={() => setSelected(null)}
            watchlistLoading={watchlistLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- ENHANCED ATOMS --- */

const NavIcon = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`relative group p-4 rounded-xl transition-all ${active ? "bg-[#FF5E00] text-black shadow-[0_0_20px_rgba(255,94,0,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
  >
    {icon}
    {count > 0 && !active && (
      <span className="absolute -top-1 -right-1 bg-white text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    )}
    <span className="absolute left-20 scale-0 group-hover:scale-100 transition-all origin-left bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm whitespace-nowrap z-[100]">
      {label}
    </span>
  </button>
);

const RegistryCard = ({
  ast,
  onClick,
  onToggleSave,
  isSaved,
  watchlistLoading,
  accentColor,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    whileHover={{ y: -4, borderColor: "rgba(255, 255, 255, 0.2)" }}
    onClick={onClick}
    className={`bg-[#0A0A0A] border border-white/[0.05] p-6 cursor-pointer hover:bg-white/[0.01] transition-all relative group overflow-hidden rounded-sm`}
  >
    <div className="absolute top-0 right-0 p-4 flex gap-2">
      <button
        onClick={(e) => onToggleSave(e, ast)}
        disabled={watchlistLoading}
        className={`transition-colors p-1.5 rounded-sm border ${isSaved ? "bg-[#FF5E00] border-[#FF5E00] text-black" : "border-white/5 text-white/10 hover:text-white hover:border-white/20"} ${watchlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {watchlistLoading ? (
          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin"></div>
        ) : isSaved ? (
          <BookmarkCheck size={14} />
        ) : (
          <Bookmark size={14} />
        )}
      </button>
    </div>

    <span className="text-[9px] text-[#FF5E00] font-bold tracking-widest mb-1 block uppercase italic">
      OBJECT_LNK_{ast.id}
    </span>
    <h4 className="text-lg font-bold mb-6 tracking-tight uppercase italic">
      {ast.name.replace(/[()]/g, "")}
    </h4>

    <div className="space-y-3">
      <DataLine
        label="Velocity"
        value={`${Math.round(ast.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString()} km/h`}
      />
      <DataLine
        label="Hazard"
        value={ast.is_potentially_hazardous_asteroid ? "CRITICAL" : "NOMINAL"}
        highlight={ast.is_potentially_hazardous_asteroid}
      />
    </div>
  </motion.div>
);

const DataLine = ({ label, value, highlight }) => (
  <div className="flex justify-between border-b border-white/[0.03] pb-2">
    <span className="text-[9px] uppercase text-white/30 tracking-wider font-bold">
      {label}
    </span>
    <span
      className={`text-[10px] font-black ${highlight ? "text-[#FF5E00]" : "text-white"}`}
    >
      {value}
    </span>
  </div>
);

const DetailModal = ({
  ast,
  onClose,
  onDownload,
  isSaved,
  onToggleSave,
  watchlistLoading,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-end"
    onClick={onClose}
  >
    <motion.div
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      exit={{ x: 100 }}
      className="w-full max-w-xl h-full bg-[#080808] border-l border-white/10 p-16 overflow-y-auto relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={onClose}
          className="text-white/20 hover:text-white transition-colors border border-white/10 p-2 rounded-full"
        >
          <X size={20} />
        </button>
        <button
          onClick={(e) => onToggleSave(e, ast)}
          disabled={watchlistLoading}
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border px-6 py-3 transition-all ${isSaved ? "border-[#FF5E00] bg-[#FF5E00] text-black" : "border-white/10 text-white/40 hover:text-white hover:border-white/30"} ${watchlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {watchlistLoading ? (
            <>LOADING...</>
          ) : isSaved ? (
            <>
              <BookmarkCheck size={14} /> REMOVE FROM WATCHLIST
            </>
          ) : (
            <>
              <Bookmark size={14} /> SAVE TO WATCHLIST
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Compass size={16} className="text-[#FF5E00]" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-bold italic">
          Telemetry Breakdown
        </span>
      </div>
      <h2 className="text-5xl font-black mb-12 tracking-tighter uppercase italic leading-[0.9]">
        {ast.name.replace(/[()]/g, "")}
      </h2>

      <div className="grid grid-cols-2 gap-10 mb-16">
        <DetailItem
          label="Absolute Magnitude"
          value={ast.absolute_magnitude_h}
        />
        <DetailItem
          label="Est. Diameter (Max)"
          value={`${ast.estimated_diameter.meters.estimated_diameter_max.toFixed(2)}m`}
        />
        <DetailItem
          label="Miss Distance"
          value={`${Math.round(ast.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km`}
        />
        <DetailItem
          label="Orbiting Body"
          value={ast.close_approach_data[0].orbiting_body.toUpperCase()}
        />
      </div>

      <div
        className={`bg-white/[0.02] border p-8 rounded-sm mb-12 ${ast.is_potentially_hazardous_asteroid ? "border-red-500/30 border-l-4" : "border-emerald-500/30 border-l-4"}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck
            size={14}
            className={
              ast.is_potentially_hazardous_asteroid
                ? "text-red-500"
                : "text-emerald-500"
            }
          />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Security Protocol
          </span>
        </div>
        <p className="text-xs leading-relaxed text-white/50 tracking-wide uppercase font-medium italic">
          {ast.is_potentially_hazardous_asteroid
            ? "WARNING: Object classified as potentially hazardous. Trajectory requires constant automated tracking."
            : "Classification: Secure Object. No immediate threat detected within current projection window."}
        </p>
      </div>

      <button
        onClick={() => onDownload(ast)}
        className="w-full h-14 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#FF5E00] hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Download size={14} /> Export_Data_Package (.JSON)
      </button>
    </motion.div>
  </motion.div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <span className="text-[9px] uppercase text-white/30 tracking-widest block mb-2 font-bold">
      {label}
    </span>
    <span className="text-xl font-black text-white tracking-tight italic">
      {value}
    </span>
  </div>
);

export default DataHub;
