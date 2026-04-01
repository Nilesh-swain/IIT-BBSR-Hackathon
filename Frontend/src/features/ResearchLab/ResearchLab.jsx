// import React, { useEffect, useMemo, useState } from "react";
// import { jsPDF } from "jspdf";
// import {
//   Activity,
//   Beaker,
//   Cpu,
//   Download,
//   ExternalLink,
//   FilePlus2,
//   Filter,
//   Mail,
//   MapPin,
//   Search,
//   ShieldAlert,
//   Upload,
// } from "lucide-react";
// import { apiGet, apiPostForm } from "../../utils/api.js";

// const ResearchLab = () => {
//   const [asteroids, setAsteroids] = useState([]);
//   const [papers, setPapers] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [publishing, setPublishing] = useState(false);
//   const [search, setSearch] = useState("");
//   const [asteroidFilter, setAsteroidFilter] = useState("ALL");
//   const [form, setForm] = useState({
//     title: "",
//     abstract: "",
//     asteroidId: "",
//     keywords: "",
//     institution: "",
//   });
//   const [paperFile, setPaperFile] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         const [asteroidRes, paperRes, profileRes] = await Promise.all([
//           apiGet("/api/asteroids?limit=100"),
//           apiGet("/api/research?limit=50"),
//           apiGet("/api/auth/profile"),
//         ]);

//         setAsteroids(asteroidRes?.asteroids || []);
//         setPapers(paperRes?.papers || []);
//         setProfile(profileRes?.data || null);
//       } catch (error) {
//         console.error("Research facility load failed:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, []);

//   const hazardousCount = useMemo(
//     () => asteroids.filter((asteroid) => asteroid.is_potentially_hazardous_asteroid).length,
//     [asteroids],
//   );

//   const filteredPapers = useMemo(() => {
//     return papers.filter((paper) => {
//       const matchesAsteroid =
//         asteroidFilter === "ALL" || paper.asteroid?.id === asteroidFilter;
//       const haystack = [
//         paper.title,
//         paper.abstract,
//         paper.asteroid?.name,
//         paper.authorName,
//         ...(paper.keywords || []),
//       ]
//         .join(" ")
//         .toLowerCase();
//       const matchesSearch = haystack.includes(search.toLowerCase());
//       return matchesAsteroid && matchesSearch;
//     });
//   }, [papers, asteroidFilter, search]);

//   const handlePublish = async () => {
//     if (!paperFile) {
//       alert("Upload a PDF paper before publishing.");
//       return;
//     }

//     if (!form.title.trim() || !form.abstract.trim() || !form.asteroidId) {
//       alert("Title, abstract, and asteroid are required.");
//       return;
//     }

//     setPublishing(true);

//     try {
//       const formData = new FormData();
//       formData.append("paper", paperFile);
//       formData.append("title", form.title.trim());
//       formData.append("abstract", form.abstract.trim());
//       formData.append("asteroidId", form.asteroidId);
//       formData.append("keywords", form.keywords);
//       formData.append("institution", form.institution.trim());

//       const response = await apiPostForm("/research/publish", formData);

//       if (response?.success) {
//         setPapers((currentPapers) => [response.paper, ...currentPapers]);
//         setForm({
//           title: "",
//           abstract: "",
//           asteroidId: "",
//           keywords: "",
//           institution: "",
//         });
//         setPaperFile(null);
//       }
//     } catch (error) {
//       console.error("Publish failed:", error);
//       alert(error.message || "Research publication failed.");
//     } finally {
//       setPublishing(false);
//     }
//   };

//   const downloadTemplate = () => {
//     const doc = new jsPDF();
//     const authorName = profile?.name || profile?.username || "Research Author";
//     const contactEmail = profile?.email || "author@example.com";
//     const contactAddress = profile?.address || "Research contact address";

//     doc.setFillColor(248, 248, 248);
//     doc.rect(0, 0, 210, 297, "F");

//     doc.setTextColor(20, 20, 20);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(20);
//     doc.text("Asteroid Research Paper Template", 20, 24);

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(11);
//     doc.text("Prepared for asteroid-linked publication. No website branding included.", 20, 32);

//     doc.setDrawColor(210, 210, 210);
//     doc.line(20, 38, 190, 38);

//     const sections = [
//       ["Paper Title", "[Enter research paper title]"],
//       ["Author", authorName],
//       ["Contact Email", contactEmail],
//       ["Contact Address", contactAddress],
//       ["Institution", "[Institution / Lab name]"],
//       ["Asteroid Focus", "[Asteroid name / NEO reference id]"],
//       ["Abstract", "[Summarize objective, method, findings, and risk context]"],
//       ["Methodology", "[Data sources, simulations, instruments, or calculations]"],
//       ["Findings", "[Key results, impact probability, material composition, etc.]"],
//       ["Conclusion", "[Final recommendation, mitigation note, or future work]"],
//     ];

//     let y = 50;
//     sections.forEach(([heading, value]) => {
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(11);
//       doc.text(heading, 20, y);
//       y += 6;
//       doc.setFont("helvetica", "normal");
//       const wrapped = doc.splitTextToSize(value, 170);
//       doc.text(wrapped, 20, y);
//       y += wrapped.length * 6 + 6;
//     });

//     doc.save("research-paper-template.pdf");
//   };

//   if (loading) return <LoadingScreen />;

//   return (
//     <div className="min-h-screen bg-[#050608] px-6 py-8 text-white selection:bg-[#FF5E00]/30 lg:px-10">
//       <div className="mx-auto max-w-[1500px] space-y-8">
//         <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
//           <div className="overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,94,0,0.18),transparent_28%),linear-gradient(135deg,#0B0C0F,#12151A)] p-8">
//             <div className="flex items-center gap-3 text-[#FF5E00]">
//               <Beaker size={18} />
//               <span className="text-[10px] font-black uppercase tracking-[0.4em]">
//                 Research_Facility
//               </span>
//             </div>
//             <h1 className="mt-4 text-4xl font-black uppercase italic tracking-tight">
//               Publish Real Asteroid Research
//             </h1>
//             <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
//               Link every paper to a real asteroid from the registry, show the author’s contact
//               details, archive it in the profile, and notify the research network automatically.
//             </p>

//             <div className="mt-8 grid gap-4 md:grid-cols-3">
//               <MetricCard label="Tracked Asteroids" value={asteroids.length} accent="text-cyan-300" />
//               <MetricCard label="Hazardous Objects" value={hazardousCount} accent="text-orange-300" />
//               <MetricCard label="Published Papers" value={papers.length} accent="text-emerald-300" />
//             </div>
//           </div>

//           <div className="border border-white/10 bg-[#0B0D11] p-8">
//             <div className="flex items-center justify-between gap-4">
//               <div>
//                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
//                   Publication Template
//                 </p>
//                 <p className="mt-2 text-sm text-white/60">
//                   Download a clean PDF template without logo clutter and use it for your upload.
//                 </p>
//               </div>
//               <button
//                 onClick={downloadTemplate}
//                 className="inline-flex items-center gap-2 bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-[#FF5E00] hover:text-black"
//               >
//                 <Download size={14} />
//                 Download Template
//               </button>
//             </div>

//             <div className="mt-6 rounded-sm border border-white/8 bg-black/20 p-4 text-xs text-white/55">
//               <div className="flex items-center gap-2 text-white/80">
//                 <Mail size={14} className="text-[#FF5E00]" />
//                 {profile?.email || "No profile email"}
//               </div>
//               <div className="mt-3 flex items-center gap-2 text-white/80">
//                 <MapPin size={14} className="text-[#FF5E00]" />
//                 {profile?.address || "No profile address"}
//               </div>
//               <p className="mt-4 text-white/45">
//                 These contact details are published on each research card so other users can reach the author.
//               </p>
//             </div>
//           </div>
//         </section>

//         <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
//           <div className="border border-white/10 bg-[#0B0D11] p-8">
//             <div className="flex items-center gap-3">
//               <FilePlus2 size={18} className="text-[#FF5E00]" />
//               <div>
//                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
//                   Publish Paper
//                 </p>
//                 <p className="mt-1 text-sm text-white/55">
//                   Publish a PDF and attach it to one asteroid in the registry.
//                 </p>
//               </div>
//             </div>

//             <div className="mt-6 space-y-4">
//               <Field label="Paper Title">
//                 <input
//                   value={form.title}
//                   onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
//                   className="research-input"
//                   placeholder="Orbital Fracture Dynamics of 2024 AB"
//                 />
//               </Field>

//               <Field label="Asteroid">
//                 <select
//                   value={form.asteroidId}
//                   onChange={(e) => setForm((current) => ({ ...current, asteroidId: e.target.value }))}
//                   className="research-input"
//                 >
//                   <option value="">Select asteroid</option>
//                   {asteroids.slice(0, 100).map((asteroid) => (
//                     <option key={asteroid._id || asteroid.neo_reference_id} value={asteroid.neo_reference_id}>
//                       {asteroid.name} ({asteroid.neo_reference_id})
//                     </option>
//                   ))}
//                 </select>
//               </Field>

//               <Field label="Institution">
//                 <input
//                   value={form.institution}
//                   onChange={(e) =>
//                     setForm((current) => ({ ...current, institution: e.target.value }))
//                   }
//                   className="research-input"
//                   placeholder="Astrodynamics Lab"
//                 />
//               </Field>

//               <Field label="Keywords">
//                 <input
//                   value={form.keywords}
//                   onChange={(e) => setForm((current) => ({ ...current, keywords: e.target.value }))}
//                   className="research-input"
//                   placeholder="impact risk, spin rate, composition"
//                 />
//               </Field>

//               <Field label="Abstract">
//                 <textarea
//                   value={form.abstract}
//                   onChange={(e) =>
//                     setForm((current) => ({ ...current, abstract: e.target.value }))
//                   }
//                   className="research-input min-h-[180px] resize-none"
//                   placeholder="Summarize the objective, method, evidence, and main conclusion."
//                 />
//               </Field>

//               <div className="rounded-sm border border-dashed border-white/12 bg-black/20 p-4">
//                 <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
//                   <Upload size={14} className="text-[#FF5E00]" />
//                   Upload PDF
//                   <input
//                     type="file"
//                     accept="application/pdf"
//                     className="hidden"
//                     onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
//                   />
//                 </label>
//                 <p className="mt-3 text-xs text-white/45">
//                   {paperFile ? paperFile.name : "Only PDF research papers are accepted."}
//                 </p>
//               </div>

//               <button
//                 onClick={handlePublish}
//                 disabled={publishing}
//                 className="inline-flex w-full items-center justify-center gap-2 bg-[#FF5E00] px-5 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {publishing ? "Publishing..." : "Publish Research"}
//                 <Upload size={14} />
//               </button>
//             </div>
//           </div>

//           <div className="border border-white/10 bg-[#0B0D11] p-8">
//             <div className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-center md:justify-between">
//               <div>
//                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
//                   Published Archive
//                 </p>
//                 <p className="mt-2 text-sm text-white/55">
//                   Real published papers linked to asteroid records and researcher contact details.
//                 </p>
//               </div>

//               <div className="flex flex-col gap-3 md:flex-row">
//                 <label className="relative">
//                   <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
//                   <input
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search papers"
//                     className="research-input pl-10"
//                   />
//                 </label>

//                 <select
//                   value={asteroidFilter}
//                   onChange={(e) => setAsteroidFilter(e.target.value)}
//                   className="research-input min-w-[220px]"
//                 >
//                   <option value="ALL">All asteroids</option>
//                   {asteroids.slice(0, 100).map((asteroid) => (
//                     <option key={asteroid.neo_reference_id} value={asteroid.neo_reference_id}>
//                       {asteroid.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="mt-6 space-y-4">
//               {filteredPapers.length === 0 ? (
//                 <div className="rounded-sm border border-white/8 bg-black/20 p-8 text-sm text-white/40">
//                   No published papers match the current search.
//                 </div>
//               ) : (
//                 filteredPapers.map((paper) => (
//                   <article
//                     key={paper._id}
//                     className="rounded-sm border border-white/8 bg-black/20 p-5 transition-all hover:border-[#FF5E00]/35"
//                   >
//                     <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
//                       <div>
//                         <div className="flex flex-wrap items-center gap-2">
//                           <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#FFB27A]">
//                             <ShieldAlert size={12} />
//                             {paper.asteroid?.name}
//                           </span>
//                           {paper.asteroid?.isHazardous && (
//                             <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
//                               Hazardous
//                             </span>
//                           )}
//                         </div>

//                         <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-white">
//                           {paper.title}
//                         </h3>
//                         <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
//                           {paper.abstract}
//                         </p>
//                       </div>

//                       <a
//                         href={paper.pdfUrl}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white hover:border-[#FF5E00]/35 hover:text-[#FF5E00]"
//                       >
//                         View PDF
//                         <ExternalLink size={14} />
//                       </a>
//                     </div>

//                     <div className="mt-5 grid gap-3 border-t border-white/8 pt-4 text-xs text-white/62 md:grid-cols-2 xl:grid-cols-4">
//                       <InfoItem label="Author" value={paper.authorName} />
//                       <InfoItem label="Email" value={paper.contactEmail} />
//                       <InfoItem label="Address" value={paper.contactAddress || "Not provided"} />
//                       <InfoItem label="Institution" value={paper.institution || "Independent"} />
//                     </div>

//                     {(paper.keywords || []).length > 0 && (
//                       <div className="mt-4 flex flex-wrap gap-2">
//                         {paper.keywords.map((keyword) => (
//                           <span
//                             key={`${paper._id}-${keyword}`}
//                             className="rounded-full bg-[#FF5E00]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#FFB27A]"
//                           >
//                             {keyword}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </article>
//                 ))
//               )}
//             </div>
//           </div>
//         </section>

//         <style>{`
//           .research-input {
//             width: 100%;
//             border: 1px solid rgba(255,255,255,0.08);
//             background: rgba(0,0,0,0.2);
//             color: white;
//             padding: 0.95rem 1rem;
//             outline: none;
//             font-size: 0.9rem;
//             transition: border-color 0.2s ease, background 0.2s ease;
//           }
//           .research-input:focus {
//             border-color: rgba(255,94,0,0.45);
//             background: rgba(255,255,255,0.03);
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// };

// const MetricCard = ({ label, value, accent }) => (
//   <div className="border border-white/10 bg-black/20 p-4">
//     <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/28">{label}</p>
//     <p className={`mt-3 text-3xl font-black italic ${accent}`}>{value}</p>
//   </div>
// );

// const Field = ({ label, children }) => (
//   <div>
//     <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
//       {label}
//     </label>
//     {children}
//   </div>
// );

// const InfoItem = ({ label, value }) => (
//   <div className="rounded-sm border border-white/8 bg-white/[0.02] p-3">
//     <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/28">{label}</p>
//     <p className="mt-2 text-sm text-white/75">{value}</p>
//   </div>
// );

// const LoadingScreen = () => (
//   <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#050608] font-mono">
//     <Cpu className="animate-spin text-[#FF5E00]" size={34} />
//     <p className="text-[10px] uppercase tracking-[0.8em] text-white/30">
//       Initializing Research Facility
//     </p>
//   </div>
// );

// export default ResearchLab;


import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { 
  Beaker, Cpu, Download, ExternalLink, 
  Search, Upload, Compass, Activity, Database
} from "lucide-react";
import { apiGet, apiPostForm } from "../../utils/api.js";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

const ResearchLab = () => {
  // --- State Management ---
  const [asteroids, setAsteroids] = useState([]);
  const [papers, setPapers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState("");
  const [paperFile, setPaperFile] = useState(null);
  const [nasaStats, setNasaStats] = useState({ total: 0, hazardous: 0 });
  const { addNotification } = useNotifications();
  
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    asteroidId: "",
    keywords: "",
    institution: "",
  });

  // --- Initial Data Fetch ---
  useEffect(() => {
    const initializeFacility = async () => {
      try {
        setLoading(true);
        const [asteroidRes, paperRes, profileRes] = await Promise.all([
          apiGet("/api/asteroids?limit=100"),
          apiGet("/api/research?limit=50"),
          apiGet("/api/auth/profile"),
        ]);
        
        setAsteroids(asteroidRes?.asteroids || []);
        setPapers(paperRes?.papers || []);
        setProfile(profileRes?.data || null);

        // Fetch Real-time Daily Data from NASA API for accurate top metrics
        const today = new Date().toISOString().split("T")[0];
        const NASA_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";
        const NASA_URL = import.meta.env.VITE_NASA_BASE_URL || "https://api.nasa.gov/neo/rest/v1";
        
        try {
          const res = await fetch(`${NASA_URL}/feed?start_date=${today}&end_date=${today}&api_key=${NASA_KEY}`);
          const data = await res.json();
          const dailyObjects = Object.values(data.near_earth_objects || {}).flat();
          
          setNasaStats({
            total: dailyObjects.length,
            hazardous: dailyObjects.filter(obj => obj.is_potentially_hazardous_asteroid).length
          });
        } catch (nasaErr) {
          console.warn("NASA API daily stats failed, using database approximations.", nasaErr.message);
          setNasaStats({
            total: asteroidRes?.total || 100,
            hazardous: asteroidRes?.asteroids?.filter(a => a.is_potentially_hazardous_asteroid).length || 0
          });
        }
      } catch (error) {
        console.error("Uplink failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeFacility();
  }, []);

  // --- Logic & Filtering ---
  const metrics = useMemo(() => ({
    total: nasaStats.total ?? asteroids.length,
    hazardous: nasaStats.hazardous ?? asteroids.filter(a => a.is_potentially_hazardous_asteroid).length,
    archived: papers.length
  }), [asteroids, papers, nasaStats]);

  const filteredPapers = useMemo(() => {
    const term = search.toLowerCase();
    return papers.filter((paper) => 
      [paper.title, paper.abstract, paper.asteroid?.name, paper.authorName]
        .some(field => field?.toLowerCase().includes(term))
    );
  }, [papers, search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePublish = async () => {
    if (!profile?._id && !profile?.id) {
      addNotification({
        title: "Authentication Required",
        message: "Your researcher profile is not loaded yet. Please sign in again and retry.",
        type: "ERROR",
      });
      return;
    }

    if (!paperFile || !form.title.trim() || !form.abstract.trim() || !form.asteroidId) {
      addNotification({
        title: "Missing Fields",
        message: "Title, abstract, asteroid selection, and a PDF file are required.",
        type: "ERROR",
      });
      return;
    }

    setPublishing(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      formData.append("paper", paperFile);
      const response = await apiPostForm("/api/research/publish", formData);
      if (response?.success) {
        setPapers(prev => [response.paper, ...prev]);
        setForm({ title: "", abstract: "", asteroidId: "", keywords: "", institution: "" });
        setPaperFile(null);
        addNotification({
          title: "Research Published",
          message: `${response.paper.title} was published and notifications were queued for other users.`,
          type: "SUCCESS",
        });
      }
    } catch (err) {
      addNotification({
        title: "Publish Failed",
        message: err.message || "Research publication failed.",
        type: "ERROR",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-[#FF5E00]/30">
      
      {/* Top Uplink Header */}
      <nav className="fixed top-0 inset-x-0 h-20 border-b border-white/[0.05] bg-black/80 backdrop-blur-xl z-50 flex items-center justify-between px-12">
        <div className="flex items-center gap-6">
          <Activity size={20} className="text-[#FF5E00] animate-pulse" />
          <div>
            <h2 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 mb-1">Laboratory_Uplink</h2>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase italic text-white">Research_Facility_v3.0</h2>
          </div>
        </div>
        <StatusIndicator status="Sync_Active" color="text-emerald-500" />
      </nav>

      <main className="pt-32 px-12 pb-20 max-w-[1600px] mx-auto space-y-12">
        
        {/* Statistics & Protocol Banner */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="bg-[#0A0A0A] border border-white/5 p-10 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5E00] shadow-[0_0_15px_rgba(255,94,0,0.5)]" />
            <SectionHeader icon={<Compass size={16}/>} label="Telemetry_Documentation" />
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-[0.85] mb-10">
              Publish Peer <br/> Reviewed Research
            </h1>
            <div className="grid grid-cols-3 gap-6">
              <MetricCard label="Total_Neo" value={metrics.total} />
              <MetricCard label="Hazard_Potential" value={metrics.hazardous} />
              <MetricCard label="Archived_Logs" value={metrics.archived} />
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/5 p-10 flex flex-col justify-between items-center text-center">
             <div className="space-y-4">
               <Database size={40} className="text-[#FF5E00]/20 mx-auto" />
               <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-black">Archive_Protocol</p>
               <p className="text-[11px] text-white/20 italic uppercase leading-relaxed">Ensure all data packets are signed by the lead researcher before transmission.</p>
             </div>
             <button className="antariksh-btn-outline w-full py-4 text-[10px] font-black tracking-[0.3em] uppercase border border-white/10 hover:border-[#FF5E00]/50 transition-all">
               System_Audit
             </button>
          </div>
        </section>

        {/* Interaction Zone */}
        <section className="grid gap-16 lg:grid-cols-[420px_1fr]">
          
          {/* Submission Form */}
          <div className="space-y-8 bg-[#0A0A0A]/50 p-8 border border-white/[0.03]">
            <h2 className="text-xs font-black tracking-[0.5em] uppercase italic text-[#FF5E00]">Initiate_Entry</h2>
            
            <div className="space-y-5">
              <Field label="Document_Title">
                <input name="title" value={form.title} onChange={handleInputChange} className="antariksh-input" placeholder="ORBITAL_DECAY_01..." />
              </Field>

              <Field label="Target_Asteroid_ID">
                <select 
                  name="asteroidId" 
                  value={form.asteroidId} 
                  onChange={handleInputChange} 
                  className="antariksh-input cursor-pointer"
                >
                  <option value="" className="bg-[#0a0a0a]">SELECT_TELEMETRY_TARGET</option>
                  {asteroids.map(a => (
                    <option key={a.neo_reference_id} value={a.neo_reference_id} className="bg-[#111] text-white">
                      {a.name} ({a.neo_reference_id})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Executive_Summary">
                <textarea name="abstract" value={form.abstract} onChange={handleInputChange} className="antariksh-input h-40 resize-none py-4" placeholder="DATA_SUMMARY..." />
              </Field>

              <div className="group relative border border-dashed border-white/10 p-8 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer">
                <label className="flex flex-col items-center gap-4 cursor-pointer">
                  <Upload size={24} className="text-[#FF5E00] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/30">
                    {paperFile ? paperFile.name : "Upload_Telemetry_PDF"}
                  </span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPaperFile(e.target.files?.[0])} />
                </label>
              </div>

              <button 
                onClick={handlePublish} 
                disabled={publishing} 
                className="antariksh-btn-primary w-full h-16 group relative overflow-hidden"
              >
                <span className="relative z-10">{publishing ? "TRANSMITTING..." : "Finalize_Transmission"}</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Research Feed */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-xs font-black tracking-[0.5em] uppercase italic">Central_Archive</h2>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                 <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH_DATABASE..." className="antariksh-search-input" />
              </div>
            </div>

            <div className="grid gap-6">
              {filteredPapers.map((paper) => (
                <article key={paper._id} className="bg-[#0A0A0A] border border-white/5 p-8 hover:border-[#FF5E00]/30 transition-all group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                         <span className="text-[9px] text-[#FF5E00] font-black tracking-widest uppercase italic">Object_Ref: {paper.asteroid?.name}</span>
                         {paper.asteroid?.isHazardous && <span className="text-[7px] bg-red-500/10 text-red-500 px-2 py-0.5 border border-red-500/20 uppercase font-black">Hazard</span>}
                      </div>
                      <h3 className="text-xl font-bold tracking-tight uppercase italic text-white group-hover:text-[#FF5E00] transition-colors">{paper.title}</h3>
                    </div>
                    <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="p-3 bg-white/5 text-white/40 hover:bg-[#FF5E00] hover:text-black transition-all">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed line-clamp-2 uppercase italic mb-6">{paper.abstract}</p>
                  <div className="flex gap-8 border-t border-white/[0.03] pt-6">
                    <InfoField label="Lead_Researcher" value={paper.authorName} />
                    <InfoField label="Affiliation" value={paper.institution || "Independent"} />
                    <InfoField label="Timestamp" value={new Date().toLocaleDateString()} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .antariksh-input {
          width: 100%; 
          background: rgba(255,255,255,0.02); 
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0.85rem 1rem; 
          color: white; 
          font-size: 11px; 
          text-transform: uppercase;
          letter-spacing: 0.15em; 
          outline: none; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color-scheme: dark; 
        }
        
        .antariksh-input:focus { 
          border-color: #FF5E00; 
          background: rgba(255,94,0,0.03);
          box-shadow: 0 0 20px rgba(255,94,0,0.05);
        }

        .antariksh-input option {
          background-color: #0A0A0A; 
          color: #e0e0e0;
          padding: 15px;
          font-family: sans-serif;
        }

        .antariksh-search-input {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          width: 18rem; h: 2.75rem; padding-left: 3rem; 
          text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em; outline: none;
        }
        .antariksh-search-input:focus { border-color: #FF5E00; }

        .antariksh-btn-primary {
          background: #FF5E00; color: black; font-size: 11px; font-weight: 900; 
          text-transform: uppercase; letter-spacing: 0.4em; transition: all 0.3s;
        }
        .antariksh-btn-primary:hover { color: black; }
        .antariksh-btn-primary:disabled { opacity: 0.3; filter: grayscale(1); }
      `}</style>
    </div>
  );
};

// --- Atomic Components ---
const SectionHeader = ({ icon, label }) => (
  <div className="flex items-center gap-3 text-[#FF5E00] mb-6">
    {icon} <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">{label}</span>
  </div>
);

const StatusIndicator = ({ status, color }) => (
  <div className="flex items-center gap-3">
    <div className="text-right">
      <p className="text-[8px] tracking-[0.3em] uppercase opacity-30 font-black">Uplink_Status</p>
      <p className={`text-[10px] tracking-widest font-mono uppercase ${color}`}>{status}</p>
    </div>
  </div>
);

const MetricCard = ({ label, value }) => (
  <div className="bg-white/[0.02] border border-white/5 p-6 hover:bg-white/[0.04] transition-colors">
    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">{label}</p>
    <p className="text-3xl font-black italic text-white leading-none">{value}</p>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic block">{label}</label>
    {children}
  </div>
);

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">{label}</p>
    <p className="text-[10px] font-bold text-white/60 uppercase">{value}</p>
  </div>
);

const LoadingScreen = () => (
  <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
    <div className="relative">
      <Cpu className="animate-spin text-[#FF5E00]" size={40} />
      <div className="absolute inset-0 animate-ping border-2 border-[#FF5E00] rounded-full scale-150 opacity-20" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 italic">Authorizing_Researcher</p>
  </div>
);

export default ResearchLab;

