import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  Save,
  Database,
  Shield,
  Camera,
  Loader2,
  Compass,
  Layers,
  Terminal,
  User,
  FilePlus,
  FileText,
  Download,
} from "lucide-react";
import { apiGet, apiPut, apiPostForm } from "../../utils/api";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

// Professional, Abstract Logo Component
const SystemLogo = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background Shape */}
    <rect x="2" y="2" width="20" height="20" rx="4" fill="black" />
    
    {/* Abstract, interconnected structural elements representing data/nodes */}
    <path
      d="M12 6V18M6 12H18M16.5 7.5L7.5 16.5M7.5 7.5L16.5 16.5"
      stroke="#FF5E00"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Central core node */}
    <circle cx="12" cy="12" r="2" fill="#FF5E00" />
  </svg>
);

// High-Tech Architect Identity Node (Professional Default Avatar)
const DefaultAvatar = ({ name = "A" }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-[#0A0C10] to-[#121418] overflow-hidden group/avatar">
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="avatar-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#avatar-grid)" />
        </svg>
      </div>
      
      {/* Interlocking Identity Graphics */}
      <div className="absolute inset-0 border-[1px] border-white/5 rounded-full scale-[0.8] animate-[spin_20s_linear_infinite]" />
      <div className="absolute inset-0 border-[1px] border-[#FF5E00]/10 rounded-full scale-[0.6] animate-[spin_12s_linear_infinite_reverse]" />
      
      {/* Initials with High-Tech Glow */}
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover/avatar:scale-110 transition-transform duration-500">
          {initials}
        </span>
        <div className="h-[2px] w-8 bg-[#FF5E00] mt-2 shadow-[0_0_10px_#FF5E00]" />
        <span className="text-[8px] font-mono text-[#FF5E00]/60 uppercase tracking-[0.5em] mt-3">
          Identity_Node
        </span>
      </div>

      {/* Aesthetic corner accents */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#FF5E00]/20" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#FF5E00]/20" />
    </div>
  );
};

const Profile = () => {
  // --- STATE ---
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPaper, setIsUploadingPaper] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const { addNotification } = useNotifications();

  // --- REFS ---
  const fileInputRef = useRef(null);
  const paperInputRef = useRef(null);

  // --- INITIAL FETCH ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await apiGet("/api/auth/profile");
        if (res?.success) {
          setProfile({
            ...res.data,
            papers: res.data.papers || [], // Ensure papers is always an array
          });
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        // Aesthetic delay to show the system initialization
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchProfileData();
  }, []);

  // --- HANDLERS ---
  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadStatus("Only image files are accepted.");
      return;
    }

    setUploadStatus("");
    setIsUploadingAvatar(true);
    const tempUrl = URL.createObjectURL(file);
    setPreviewImage(tempUrl);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await apiPostForm("/api/auth/upload-avatar", formData);

      if (res?.success) {
        setProfile((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
        setUploadStatus("Avatar synchronized successfully.");
        addNotification({
          title: "Profile Updated",
          message: "Avatar synchronization completed successfully.",
          type: "SUCCESS",
        });
      } else {
        setUploadStatus("Avatar upload did not complete. Please retry.");
      }
    } catch (err) {
      console.error("Avatar Sync Failed:", err);
      setUploadStatus(err.message || "Could not sync avatar. Try again.");
      setPreviewImage(profile?.avatarUrl || null);
    } finally {
      setIsUploadingAvatar(false);
      // release temporary object URL to avoid memory leaks
      setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
    }
  };

  const handlePaperUpload = async (file) => {
    if (!file) return;
    setIsUploadingPaper(true);

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed in the research archive.");
      setIsUploadingPaper(false);
      if (paperInputRef.current) paperInputRef.current.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("paper", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

      const res = await apiPostForm("/api/auth/upload-paper", formData);

      if (res?.success) {
        // UPDATE STATE IMMEDIATELY
        // res.data should contain the new paper object: { id, title, url, year }
        setProfile((prev) => ({
          ...prev,
          papers: [res.data, ...prev.papers],
        }));
        addNotification({
          title: "Research Archive Updated",
          message: `${res.data.title || "PDF record"} was stored in your profile archive.`,
          type: "SUCCESS",
        });
      }
    } catch (err) {
      console.error("Paper Integration Failed:", err);
      alert("Terminal Error: Could not archive document.");
    } finally {
      setIsUploadingPaper(false);
      if (paperInputRef.current) paperInputRef.current.value = ""; // Reset input
    }
  };

  const handleProfileSync = async () => {
    try {
      const res = await apiPut("/api/auth/profile", profile);
      if (res?.success) {
        setIsEditing(false);
        addNotification({
          title: "Profile Synced",
          message: "Core identity records were updated successfully.",
          type: "SUCCESS",
        });
      }
    } catch (err) {
      console.error("Update Failed:", err);
    }
  };

  const handlePaperDownload = async (paper) => {
    try {
      const response = await fetch(paper.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${paper.title || "research-paper"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("PDF download failed:", error);
      window.open(paper.url, "_blank", "noopener,noreferrer");
    }
  };

  // --- UI GUARDS ---
  if (isLoading) return <LoadingScreen />;
  if (!profile) return <ErrorState />;

  return (
    <div className="min-h-screen bg-[#030406] text-slate-300 font-sans selection:bg-[#FF5E00]/30 selection:text-white">
      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed left-0 top-0 h-full w-20 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col items-center py-8 gap-10 z-50">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,94,0,0.15)]">
          <SystemLogo size={32} />
        </div>
        <nav className="flex flex-col gap-8">
          <NavIcon icon={<Compass />} active />
          <NavIcon icon={<Layers />} />
          <NavIcon icon={<Database />} />
          <NavIcon icon={<Terminal />} />
        </nav>
      </aside>

      <div className="pl-20">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-40 bg-[#030406]/80 backdrop-blur-md border-b border-white/10 px-12 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-[10px] text-[#FF5E00] uppercase tracking-[0.4em] font-bold">
              System_Authorized
            </h2>
            <h1 className="text-2xl text-white font-black italic tracking-tighter uppercase">
              {profile.role || "Architect"} Node
            </h1>
          </div>

          <button
            onClick={isEditing ? handleProfileSync : () => setIsEditing(true)}
            className={`px-8 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all ${
              isEditing
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-[#FF5E00] text-black shadow-lg shadow-[#FF5E00]/20 hover:scale-105"
            }`}
          >
            {isEditing ? "Sync Changes" : "Modify Record"}
          </button>
        </header>

        <main className="max-w-7xl mx-auto p-12 grid grid-cols-12 gap-10">
          {/* LEFT COLUMN: IDENTITY */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div
              className={`relative group rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 ${isEditing ? "border-[#FF5E00]" : "border-white/10"}`}
            >
              {previewImage || profile.avatarUrl ? (
                <img
                  src={previewImage || profile.avatarUrl}
                  className="w-full aspect-[4/5] object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="avatar"
                />
              ) : (
                <div className="w-full aspect-[4/5]">
                  <DefaultAvatar name={profile.username || "Architect"} />
                </div>
              )}
              {isEditing && (
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Camera size={32} className="text-[#FF5E00] animate-pulse" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
            </div>
            {uploadStatus && (
              <div
                className={`mt-3 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg ${
                  uploadStatus.toLowerCase().includes("success")
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {uploadStatus}
              </div>
            )}

            <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
              <label className="text-[9px] font-bold text-[#FF5E00] uppercase tracking-[0.2em]">
                Subject_Identity
              </label>
              {isEditing ? (
                <input
                  className="w-full bg-white/5 border-b-2 border-[#FF5E00] text-white text-2xl font-bold mt-2 outline-none py-1"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                />
              ) : (
                <h2 className="text-3xl text-white font-black uppercase italic tracking-tighter mt-1">
                  {profile.username}
                </h2>
              )}
              <div className="mt-6 space-y-4 text-xs font-mono">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Mail size={14} className="text-[#FF5E00]" /> {profile.email}
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <MapPin size={14} className="text-[#FF5E00]" />{" "}
                  {profile.address || "Odisha, India"}
                </div>
              </div>
            </div>

            {/* SYSTEM METRICS (NEW) */}
            <div className="grid grid-cols-2 gap-4">
              <MetricItem 
                label="Hazard_Potential" 
                value="3" 
                description="Threat_Index"
                color="text-[#FF5E00]"
              />
              <MetricItem 
                label="Archived_Logs" 
                value={profile.papers.length} 
                description="PDF_Registry"
                color="text-emerald-500"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: DATA */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* BIO SECTION */}
            <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/10 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Terminal size={80} />
              </div>
              <h3 className="text-[10px] font-bold text-[#FF5E00] uppercase tracking-[0.2em] mb-4">
                Core_Biography
              </h3>
              {isEditing ? (
                <textarea
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-mono focus:border-[#FF5E00] outline-none h-32"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              ) : (
                <p className="text-lg leading-relaxed text-zinc-300 italic">
                  "
                  {profile.bio ||
                    "No biography string detected in memory bank."}
                  "
                </p>
              )}
            </div>

            {/* RESEARCH ARCHIVE */}
            <div className="bg-[#0A0C10]/60 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-white">
                  <Database size={16} className="text-[#FF5E00]" />{" "}
                  Research_Archive
                </h3>

                <button
                  onClick={() => paperInputRef.current.click()}
                  disabled={isUploadingPaper}
                  className="flex items-center gap-2 bg-white/5 hover:bg-[#FF5E00] hover:text-black transition-all px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-white/10 disabled:opacity-50"
                >
                  {isUploadingPaper ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FilePlus size={14} />
                  )}
                  {isUploadingPaper ? "Uploading..." : "Add Record"}
                </button>
                <input
                  type="file"
                  ref={paperInputRef}
                  hidden
                  accept="application/pdf"
                  onChange={(e) => handlePaperUpload(e.target.files[0])}
                />
              </div>

              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                <AnimatePresence initial={false}>
                  {profile.papers.length > 0 ? (
                    profile.papers.map((item, i) => (
                      <motion.div
                        key={item._id || item.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 flex justify-between items-center group hover:bg-white/[0.03] transition-all"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-[#FF5E00] group-hover:bg-[#FF5E00]/10 group-hover:rotate-12 transition-all duration-300">
                            <FileText size={24} />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm uppercase group-hover:text-[#FF5E00] transition-colors tracking-tight">
                              {item.title}
                            </p>
                            <div className="flex gap-4 mt-1 flex-wrap">
                              <span className="text-[10px] font-mono text-zinc-600">
                                HASH: 0x
                                {item.id?.slice(-4) || (i + 1024).toString(16)}
                              </span>
                              <span className="text-[10px] font-mono text-[#FF5E00] uppercase font-bold">
                                {item.year || "2026"}
                              </span>
                              {item.asteroidName && (
                                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                                  {item.asteroidName}
                                </span>
                              )}
                            </div>
                            {item.abstract && (
                              <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-500">
                                {item.abstract}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePaperDownload(item)}
                            className="p-3 bg-white/5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-20 text-center">
                      <div className="inline-block p-4 rounded-full bg-white/5 mb-4 text-zinc-700">
                        <Database size={32} />
                      </div>
                      <p className="text-zinc-600 italic text-sm">
                        No records found in central database.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const NavIcon = ({ icon, active }) => (
  <div
    className={`p-4 rounded-2xl transition-all cursor-pointer group ${
      active
        ? "bg-white text-black shadow-xl shadow-white/10"
        : "text-zinc-600 hover:text-white hover:bg-white/5"
    }`}
  >
    {React.cloneElement(icon, {
      size: 20,
      className: active ? "" : "group-hover:scale-110 transition-transform",
    })}
  </div>
);

const LoadingScreen = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#030406] space-y-6">
    <div className="relative">
      <Loader2
        className="animate-spin text-[#FF5E00]"
        size={60}
        strokeWidth={1}
      />
      <div className="absolute inset-0 m-auto text-white/20 flex items-center justify-center">
         <SystemLogo size={20} />
      </div>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-mono text-[#FF5E00] tracking-[0.5em] animate-pulse">
        Initializing_Sync
      </span>
      <div className="w-32 h-[1px] bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-[#FF5E00]"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="h-screen flex items-center justify-center bg-[#030406] text-center p-6">
    <div className="max-w-md p-10 border border-red-500/20 bg-red-500/5 rounded-[2.5rem] backdrop-blur-xl">
      <Shield className="text-red-500 mx-auto mb-6" size={50} />
      <h2 className="text-white font-black uppercase italic tracking-tighter text-xl mb-2">
        Protocol_Failure
      </h2>
      <p className="text-red-400/60 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
        The central registry is currently unreachable. Authentication handshake
        timed out.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all rounded-lg"
      >
        Retry_Link
      </button>
    </div>
  </div>
);

const MetricItem = ({ label, value, description, color = "text-white" }) => (
  <div className="bg-white/[0.03] p-6 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2">
      {label}
    </span>
    <span className={`text-3xl font-black italic tracking-tighter ${color}`}>
      {value}
    </span>
    {description && (
      <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest block mt-2">
        {description}
      </span>
    )}
  </div>
);

export default Profile;
