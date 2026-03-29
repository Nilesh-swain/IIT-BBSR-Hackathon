// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ChevronDown,
//   Cpu,
//   FileText,
//   Filter,
//   Heart,
//   MessageSquare,
//   Send,
//   User,
// } from "lucide-react";
// import { apiFetch, apiGet, apiPostForm } from "../../utils/api.js";

// const FEED_CATEGORIES = ["ALL_FEEDS", "THREAT_REPORTS", "INTEL_UPLINK", "CORE_ANOMALIES"];
// const POST_CATEGORIES = ["THREAT_REPORTS", "INTEL_UPLINK", "CORE_ANOMALIES"];

// const getDisplayName = (user) =>
//   user?.name?.trim() || user?.username?.trim() || "ANON_OPERATOR";

// const CommunityRegistry = ({ asteroidId }) => {
//   const resolvedAsteroidId = asteroidId || "global";
//   const [posts, setPosts] = useState([]);
//   const [newPost, setNewPost] = useState("");
//   const [attachment, setAttachment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isTransmitting, setIsTransmitting] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [activeFilter, setActiveFilter] = useState("ALL_FEEDS");
//   const [selectedCategory, setSelectedCategory] = useState("CORE_ANOMALIES");
//   const [commentDrafts, setCommentDrafts] = useState({});
//   const [openComments, setOpenComments] = useState({});

//   useEffect(() => {
//     const init = async () => {
//       await loadSession();
//       await fetchPosts();
//     };

//     init();
//   }, [resolvedAsteroidId]);

//   const loadSession = async () => {
//     try {
//       const response = await apiGet("/auth/me");
//       const user = response?.data;
//       setIsAuthenticated(Boolean(user));
//       setCurrentUserId(user?._id || null);
//     } catch (error) {
//       setIsAuthenticated(false);
//       setCurrentUserId(null);
//     }
//   };

//   const fetchPosts = async () => {
//     try {
//       setLoading(true);
//       const data = await apiGet(`/community/${resolvedAsteroidId}/posts`);
//       if (data.success) {
//         setPosts(data.posts);
//       }
//     } catch (error) {
//       console.error("Uplink Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUplink = async () => {
//     if ((!newPost.trim() && !attachment) || !isAuthenticated) return;
//     setIsTransmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append("content", newPost);
//       formData.append("category", selectedCategory);

//       if (attachment) {
//         formData.append("attachment", attachment);
//       }

//       const response = await apiPostForm(
//         `/community/${resolvedAsteroidId}/posts`,
//         formData,
//       );

//       if (response.success) {
//         setPosts((currentPosts) => [response.post, ...currentPosts]);
//         setNewPost("");
//         setAttachment(null);
//         setSelectedCategory("CORE_ANOMALIES");
//       }
//     } catch (error) {
//       console.error("Transmission failed:", error);
//       alert(error.message || "Transmission failed. Check secure connection.");
//     } finally {
//       setIsTransmitting(false);
//     }
//   };

//   const handleLike = async (postId) => {
//     try {
//       const response = await apiFetch(`/community/posts/${postId}/like`, {
//         method: "PUT",
//       });

//       if (response.success) {
//         setPosts((currentPosts) =>
//           currentPosts.map((post) => (post._id === postId ? response.post : post)),
//         );
//       }
//     } catch (error) {
//       console.error("Like toggle failed:", error);
//     }
//   };

//   const handleCommentSubmit = async (postId) => {
//     const content = commentDrafts[postId]?.trim();
//     if (!content) return;

//     try {
//       const response = await apiFetch(`/community/posts/${postId}/comment`, {
//         method: "POST",
//         body: JSON.stringify({ content }),
//       });

//       if (response.success) {
//         setPosts((currentPosts) =>
//           currentPosts.map((post) => (post._id === postId ? response.post : post)),
//         );
//         setCommentDrafts((currentDrafts) => ({ ...currentDrafts, [postId]: "" }));
//         setOpenComments((currentOpen) => ({ ...currentOpen, [postId]: true }));
//       }
//     } catch (error) {
//       console.error("Comment failed:", error);
//     }
//   };

//   const toggleComments = (postId) => {
//     setOpenComments((currentOpen) => ({
//       ...currentOpen,
//       [postId]: !currentOpen[postId],
//     }));
//   };

//   const filteredPosts =
//     activeFilter === "ALL_FEEDS"
//       ? posts
//       : posts.filter((post) => post.category === activeFilter);

//   const getCategoryCount = (category) =>
//     category === "ALL_FEEDS"
//       ? posts.length
//       : posts.filter((post) => post.category === category).length;

//   const isPostLikedByCurrentUser = (post) =>
//     Boolean(currentUserId && post.likes?.some((likeId) => likeId === currentUserId || likeId?._id === currentUserId));

//   return (
//     <div className="mx-auto min-h-full max-w-[1400px] p-6 text-white selection:bg-[#FF5E00] selection:text-black">
//       <header className="mb-8 flex flex-col items-start justify-between gap-6 overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,94,0,0.16),transparent_32%),linear-gradient(135deg,rgba(15,15,18,0.98),rgba(8,8,10,0.96))] p-6 backdrop-blur-md md:flex-row md:items-center">
//         <div className="space-y-2">
//           <div className="flex items-center gap-2 text-[#FF5E00]">
//             <Cpu size={14} />
//             <span className="text-[10px] font-black uppercase tracking-[0.4em]">
//               Registry_v5.2
//             </span>
//           </div>
//           <h1 className="text-3xl font-black uppercase tracking-tight italic">
//             Community <span className="font-light text-white/35 not-italic">Uplink</span>
//           </h1>
//           <p className="max-w-xl text-sm text-white/45">
//             Threat reports, mission intel, and anomaly logs for asteroid node{" "}
//             <span className="font-bold text-white/80">{resolvedAsteroidId.toUpperCase()}</span>.
//           </p>
//         </div>

//         <div className="grid grid-cols-2 gap-4 md:min-w-[280px]">
//           <Stat item="Target_ID" value={resolvedAsteroidId.toUpperCase()} color="#FF5E00" />
//           <Stat
//             item="Auth_Status"
//             value={isAuthenticated ? "SECURE" : "GUEST"}
//             color={isAuthenticated ? "#00FF41" : "#FF0040"}
//           />
//           <Stat item="Feed_Count" value={String(posts.length).padStart(2, "0")} color="#FFFFFF" />
//           <Stat item="Live_Filter" value={activeFilter.replaceAll("_", " ")} color="#7DD3FC" />
//         </div>
//       </header>

//       <div className="grid grid-cols-12 gap-8">
//         <aside className="col-span-12 space-y-4 lg:col-span-3">
//           <div className="border border-white/10 bg-[#0C0C0E] p-4">
//             <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
//               <Filter size={12} /> Feed Filters
//             </p>
//             <nav className="space-y-2">
//               {FEED_CATEGORIES.map((category) => (
//                 <button
//                   key={category}
//                   onClick={() => setActiveFilter(category)}
//                   className={`w-full rounded-sm border px-3 py-3 text-left text-[11px] font-bold uppercase transition-all ${
//                     activeFilter === category
//                       ? "border-[#FF5E00] bg-[#FF5E00] text-black"
//                       : "border-white/8 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between gap-3">
//                     <span>{category.replaceAll("_", " ")}</span>
//                     <span className="text-[9px] opacity-60">[{getCategoryCount(category)}]</span>
//                   </div>
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </aside>

//         <main className="col-span-12 space-y-6 lg:col-span-9">
//           {isAuthenticated ? (
//             <div className="overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
//               <div className="border-b border-white/8 px-5 py-3">
//                 <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                   <div>
//                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
//                       New Transmission
//                     </p>
//                     <p className="mt-1 text-xs text-white/45">
//                       Choose a channel before uplinking your message.
//                     </p>
//                   </div>

//                   <label className="relative inline-flex min-w-[230px] items-center border border-white/10 bg-black/30">
//                     <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
//                       Channel
//                     </span>
//                     <select
//                       value={selectedCategory}
//                       onChange={(e) => setSelectedCategory(e.target.value)}
//                       className="w-full appearance-none bg-transparent px-3 py-3 pr-10 text-[11px] font-black uppercase text-white outline-none"
//                     >
//                       {POST_CATEGORIES.map((category) => (
//                         <option key={category} value={category} className="bg-[#101012]">
//                           {category.replaceAll("_", " ")}
//                         </option>
//                       ))}
//                     </select>
//                     <ChevronDown size={14} className="pointer-events-none absolute right-3 text-white/40" />
//                   </label>
//                 </div>
//               </div>

//               <div className="p-5">
//                 <textarea
//                   value={newPost}
//                   onChange={(e) => setNewPost(e.target.value)}
//                   placeholder="Log a threat report, uplink intel, or record a core anomaly..."
//                   className="h-28 w-full resize-none border border-white/8 bg-black/20 px-4 py-4 text-sm text-white placeholder:text-white/18 outline-none transition-colors focus:border-[#FF5E00]/50"
//                 />

//                 <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                   <div className="flex flex-wrap items-center gap-3">
//                     <label className="inline-flex cursor-pointer items-center gap-2 border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/65 hover:border-[#FF5E00]/40 hover:text-white">
//                       <input
//                         type="file"
//                         accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf"
//                         className="hidden"
//                         onChange={(e) => setAttachment(e.target.files?.[0] || null)}
//                       />
//                       <FileText size={12} />
//                       {attachment ? attachment.name : "Attach Media"}
//                     </label>

//                     {attachment && (
//                       <button
//                         type="button"
//                         onClick={() => setAttachment(null)}
//                         className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 hover:text-white"
//                       >
//                         Remove File
//                       </button>
//                     )}
//                   </div>

//                   <button
//                     onClick={handleUplink}
//                     disabled={isTransmitting || (!newPost.trim() && !attachment)}
//                     className="inline-flex items-center justify-center gap-2 bg-[#FF5E00] px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     {isTransmitting ? "TRANSMITTING..." : "UPLINK DATA"}
//                     <Send size={12} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="border border-dashed border-white/10 p-5 text-center opacity-45">
//               <p className="text-[10px] uppercase tracking-widest">
//                 Login Required for Community Uplink
//               </p>
//             </div>
//           )}

//           <section className="space-y-4">
//             {loading ? (
//               <div className="animate-pulse text-[10px] text-white/20">SYNCING_WITH_ARCHIVE...</div>
//             ) : (
//               <AnimatePresence mode="popLayout">
//                 {filteredPosts.map((post) => {
//                   const commentsOpen = Boolean(openComments[post._id]);
//                   const isLiked = isPostLikedByCurrentUser(post);

//                   return (
//                     <motion.article
//                       key={post._id}
//                       layout
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="overflow-hidden border border-white/8 bg-[linear-gradient(180deg,rgba(13,13,15,0.98),rgba(9,9,11,0.98))] shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-all hover:border-[#FF5E00]/35"
//                     >
//                       <div className="border-b border-white/6 px-5 py-4">
//                         <div className="flex items-start justify-between gap-4">
//                           <div className="flex items-center gap-3">
//                             {post.user?.avatarUrl ? (
//                               <img
//                                 src={post.user.avatarUrl}
//                                 alt={getDisplayName(post.user)}
//                                 className="h-11 w-11 rounded-full border border-white/10 bg-white/5 object-cover"
//                               />
//                             ) : (
//                               <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
//                                 <User size={16} className="text-[#FF5E00]" />
//                               </div>
//                             )}

//                             <div>
//                               <h4 className="text-[12px] font-black uppercase tracking-[0.18em] text-white">
//                                 {getDisplayName(post.user)}
//                               </h4>
//                               <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/28">
//                                 {post.category?.replaceAll("_", " ") || "CORE ANOMALIES"}
//                               </p>
//                             </div>
//                           </div>

//                           <p className="text-right font-mono text-[9px] uppercase text-white/22">
//                             {new Date(post.createdAt).toLocaleString()}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="space-y-4 px-5 py-5">
//                         {post.content && (
//                           <p className="border-l border-[#FF5E00]/25 pl-4 text-[14px] leading-7 text-white/76">
//                             {post.content}
//                           </p>
//                         )}

//                         {post.attachment?.url && <AttachmentPreview attachment={post.attachment} />}

//                         <div className="flex flex-wrap items-center gap-3 border-t border-white/6 pt-4 text-[10px] uppercase tracking-[0.18em]">
//                           <button
//                             type="button"
//                             onClick={() => handleLike(post._id)}
//                             className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black transition-all ${
//                               isLiked
//                                 ? "border-red-500/40 bg-red-500/12 text-red-400"
//                                 : "border-white/10 bg-white/[0.03] text-white/50 hover:border-[#FF5E00]/35 hover:text-[#FF5E00]"
//                             }`}
//                           >
//                             <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
//                             {post.likes?.length || 0} Likes
//                           </button>

//                           <button
//                             type="button"
//                             onClick={() => toggleComments(post._id)}
//                             className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black transition-all ${
//                               commentsOpen
//                                 ? "border-[#FF5E00]/40 bg-[#FF5E00]/12 text-[#FFB27A]"
//                                 : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
//                             }`}
//                           >
//                             <MessageSquare size={12} />
//                             {post.comments?.length || 0} Comments
//                           </button>
//                         </div>

//                         <AnimatePresence initial={false}>
//                           {commentsOpen && (
//                             <motion.div
//                               initial={{ opacity: 0, height: 0 }}
//                               animate={{ opacity: 1, height: "auto" }}
//                               exit={{ opacity: 0, height: 0 }}
//                               className="overflow-hidden border-t border-white/6 pt-4"
//                             >
//                               <div className="space-y-3">
//                                 {(post.comments || []).length === 0 && (
//                                   <p className="text-[12px] text-white/35">
//                                     No comments yet. Start the discussion.
//                                   </p>
//                                 )}

//                                 {(post.comments || []).map((comment) => (
//                                   <div
//                                     key={comment._id || `${post._id}-${comment.createdAt}`}
//                                     className="flex gap-3 rounded-sm border border-white/6 bg-white/[0.02] p-3"
//                                   >
//                                     {comment.user?.avatarUrl ? (
//                                       <img
//                                         src={comment.user.avatarUrl}
//                                         alt={getDisplayName(comment.user)}
//                                         className="h-8 w-8 rounded-full border border-white/10 bg-white/5 object-cover"
//                                       />
//                                     ) : (
//                                       <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
//                                         <User size={12} className="text-[#FF5E00]" />
//                                       </div>
//                                     )}

//                                     <div className="flex-1">
//                                       <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/78">
//                                         {getDisplayName(comment.user)}
//                                       </p>
//                                       <p className="mt-1 text-[13px] leading-6 text-white/62">
//                                         {comment.content}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 ))}

//                                 <div className="flex gap-3 pt-1">
//                                   <input
//                                     type="text"
//                                     value={commentDrafts[post._id] || ""}
//                                     onChange={(e) =>
//                                       setCommentDrafts((currentDrafts) => ({
//                                         ...currentDrafts,
//                                         [post._id]: e.target.value,
//                                       }))
//                                     }
//                                     placeholder="Add a comment..."
//                                     className="flex-1 border border-white/10 bg-black/20 px-3 py-3 text-[12px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#FF5E00]/40"
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => handleCommentSubmit(post._id)}
//                                     className="bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#FF5E00] hover:text-black"
//                                   >
//                                     Send
//                                   </button>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )}
//                         </AnimatePresence>
//                       </div>
//                     </motion.article>
//                   );
//                 })}
//               </AnimatePresence>
//             )}
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// };

// const AttachmentPreview = ({ attachment }) => {
//   const isImage = attachment.resourceType === "image";
//   const isVideo = attachment.resourceType === "video";
//   const isPdf =
//     attachment.mimeType === "application/pdf" ||
//     attachment.originalName?.toLowerCase().endsWith(".pdf");

//   return (
//     <div className="overflow-hidden border border-white/10 bg-black/30">
//       {isImage && (
//         <img
//           src={attachment.url}
//           alt={attachment.originalName || "Community attachment"}
//           className="max-h-[420px] w-full object-cover"
//         />
//       )}

//       {isVideo && (
//         <video controls className="max-h-[420px] w-full bg-black">
//           <source src={attachment.url} type={attachment.mimeType || "video/mp4"} />
//         </video>
//       )}

//       {isPdf && (
//         <div className="p-4">
//           <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
//             <FileText size={14} />
//             PDF Attachment
//           </div>
//           <iframe
//             src={attachment.url}
//             title={attachment.originalName || "PDF preview"}
//             className="h-[420px] w-full border border-white/10 bg-white"
//           />
//         </div>
//       )}

//       {!isImage && !isVideo && !isPdf && (
//         <a
//           href={attachment.url}
//           target="_blank"
//           rel="noreferrer"
//           className="flex items-center gap-2 p-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF5E00]"
//         >
//           <FileText size={14} />
//           Open Attachment
//         </a>
//       )}
//     </div>
//   );
// };

// const Stat = ({ item, value, color }) => (
//   <div className="border border-white/8 bg-black/20 p-3 text-right">
//     <span className="block text-[8px] font-black uppercase tracking-widest text-white/22">
//       {item}
//     </span>
//     <span className="text-[12px] font-bold uppercase italic" style={{ color }}>
//       {value}
//     </span>
//   </div>
// );

// export default CommunityRegistry;







import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  FileText,
  Filter,
  Heart,
  MessageSquare,
  Send,
  User,
  Activity,
  ShieldAlert,
  Zap
} from "lucide-react";
import { apiFetch, apiGet, apiPostForm } from "../../utils/api.js";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

const FEED_CATEGORIES = ["ALL_FEEDS", "THREAT_REPORTS", "INTEL_UPLINK", "CORE_ANOMALIES"];
const POST_CATEGORIES = ["THREAT_REPORTS", "INTEL_UPLINK", "CORE_ANOMALIES"];

const getDisplayName = (user) =>
  user?.name?.trim() || user?.username?.trim() || "ANON_OPERATOR";

const CommunityRegistry = ({ asteroidId }) => {
  const resolvedAsteroidId = asteroidId || "global";
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL_FEEDS");
  const [selectedCategory, setSelectedCategory] = useState("CORE_ANOMALIES");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const { addNotification } = useNotifications();

  useEffect(() => {
    const init = async () => {
      await loadSession();
      await fetchPosts();
    };
    init();
  }, [resolvedAsteroidId]);

  const loadSession = async () => {
    try {
      const response = await apiGet("/auth/me");
      const user = response?.data;
      setIsAuthenticated(Boolean(user));
      setCurrentUserId(user?._id || null);
    } catch {
      setIsAuthenticated(false);
      setCurrentUserId(null);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/community/${resolvedAsteroidId}/posts`);
      if (data.success) setPosts(data.posts);
    } catch (error) {
      console.error("Uplink Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUplink = async () => {
    if ((!newPost.trim() && !attachment) || !isAuthenticated) return;
    setIsTransmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", newPost);
      formData.append("category", selectedCategory);
      if (attachment) formData.append("attachment", attachment);

      const response = await apiPostForm(`/community/${resolvedAsteroidId}/posts`, formData);
      if (response.success) {
        setPosts((currentPosts) => [response.post, ...currentPosts]);
        setNewPost("");
        setAttachment(null);
        setSelectedCategory("CORE_ANOMALIES");
        addNotification({
          title: "Community Broadcast",
          message: `Your ${response.post.category?.replaceAll("_", " ") || "community"} transmission is now live.`,
          type: "SUCCESS",
        });
      }
    } catch (error) {
      alert(error.message || "TRANSMISSION_FAILED");
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await apiFetch(`/community/posts/${postId}/like`, { method: "PUT" });
      if (response.success) {
        setPosts((prev) => prev.map((p) => (p._id === postId ? response.post : p)));
        addNotification({
          title: "Community Signal Updated",
          message: "Post engagement metrics were updated successfully.",
          type: "INFO",
        });
      }
    } catch (error) {
      console.error("Protocol Error:", error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentDrafts[postId]?.trim();
    if (!content) return;
    try {
      const response = await apiFetch(`/community/posts/${postId}/comment`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      if (response.success) {
        setPosts((prev) => prev.map((p) => (p._id === postId ? response.post : p)));
        setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        setOpenComments((prev) => ({ ...prev, [postId]: true }));
        addNotification({
          title: "Comment Delivered",
          message: "Your response has been appended to the active thread.",
          type: "SUCCESS",
        });
      }
    } catch (err) { console.error(err); }
  };

  const filteredPosts = activeFilter === "ALL_FEEDS" 
    ? posts 
    : posts.filter((p) => p.category === activeFilter);

  return (
    /* MAIN WRAPPER: Fixed height of screen, flex-column, hidden overflow */
    <div className="flex flex-col h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans selection:bg-[#FF5E00]/30 selection:text-white overflow-hidden">
      
      {/* --- Dashboard Header (FIXED) --- */}
      <header className="flex-shrink-0 border-b border-white/10 bg-[#0A0A0A] p-6 flex flex-col md:flex-row md:items-center md:justify-between z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF5E00]">
            <Activity size={12} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.5em]">Sector_Community_v5.2</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
            Registry <span className="font-light text-white/20 not-italic">Uplink</span>
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
            Node: <span className="text-[#FF5E00] font-bold">[{resolvedAsteroidId.toUpperCase()}]</span> 
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 md:mt-0">
          <Stat item="Target" value={resolvedAsteroidId.slice(0,8).toUpperCase()} color="#FF5E00" />
          <Stat item="Security" value={isAuthenticated ? "SECURE" : "GUEST"} color={isAuthenticated ? "#10b981" : "#ef4444"} />
          <Stat item="Packets" value={String(posts.length).padStart(3, "0")} color="#ffffff" />
          <Stat item="Filter" value={activeFilter.split("_")[0]} color="#3b82f6" />
        </div>
      </header>

      {/* --- CONTENT AREA: Sidebar + Scrollable Feed --- */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* --- Sidebar Filters (FIXED) --- */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-[#080808] p-6 overflow-y-auto">
          <p className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <Filter size={12} className="text-[#FF5E00]" /> Comms Channels
          </p>
          <nav className="space-y-2">
            {FEED_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`group w-full border p-3 text-left transition-all duration-300 ${
                  activeFilter === cat
                    ? "border-[#FF5E00] bg-[#FF5E00] text-black"
                    : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest">{cat.replaceAll("_", " ")}</span>
                  <span className={`text-[9px] font-mono ${activeFilter === cat ? "text-black/50" : "text-white/10"}`}>
                    {String(posts.filter(p => cat === "ALL_FEEDS" || p.category === cat).length).padStart(2, '0')}
                  </span>
                </div>
              </button>
            ))}
          </nav>
          
          <div className="mt-auto pt-6 border-t border-white/5 text-[9px] uppercase tracking-[0.2em] font-bold text-white/20 italic leading-relaxed">
            Notice: All data transmissions are monitored by planetary defense AI.
          </div>
        </aside>

        {/* --- MAIN FEED (THE ONLY SCROLLABLE PART) --- */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar bg-black/20">
          
          {/* Post Input Section */}
          <div className="max-w-[900px] w-full mx-auto">
            {isAuthenticated ? (
              <div className="bg-[#0A0A0A] border border-white/5 relative mb-12">
                <div className="p-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <div className="h-6 w-1 bg-[#FF5E00]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Initiate_Transmission</span>
                  </div>
                  <div className="relative antariksh-select-wrapper">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="antariksh-select"
                    >
                      {POST_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0A0A0A] text-white">
                          {cat.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30" />
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Record anomaly log or intel update..."
                    className="antariksh-textarea"
                  />
                  <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <label className="group flex items-center gap-3 cursor-pointer border border-white/5 bg-white/[0.02] px-4 py-2 hover:border-[#FF5E00]/30 transition-all">
                      <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                      <FileText size={14} className="text-[#FF5E00]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">
                        {attachment ? attachment.name.slice(0, 15) + "..." : "Attach_Media"}
                      </span>
                    </label>
                    <button onClick={handleUplink} disabled={isTransmitting || (!newPost.trim() && !attachment)} className="antariksh-btn-primary">
                      {isTransmitting ? "ENCRYPTING..." : "UPLINK_DATA"} <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/10 p-12 text-center bg-white/[0.01] mb-12">
                <ShieldAlert size={32} className="mx-auto text-white/10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Authentication_Required // Access_Denied</p>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center gap-4 text-[#FF5E00] opacity-50 justify-center py-20">
                  <Zap size={14} className="animate-spin" />
                  <span className="text-[10px] font-black tracking-[0.5em] uppercase">Syncing_Archive...</span>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={post} 
                      currentUserId={currentUserId}
                      onLike={() => handleLike(post._id)}
                      onCommentToggle={() => setOpenComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                      isOpen={openComments[post._id]}
                      draft={commentDrafts[post._id] || ""}
                      onDraftChange={(val) => setCommentDrafts(prev => ({ ...prev, [post._id]: val }))}
                      onCommentSubmit={() => handleCommentSubmit(post._id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF5E00; }

        .antariksh-select {
          appearance: none;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 10px 40px 10px 16px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: white;
          outline: none;
        }
        .antariksh-textarea {
          width: 100%;
          height: 100px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 16px;
          color: white;
          font-size: 13px;
          outline: none;
          resize: none;
        }
        .antariksh-btn-primary {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FF5E00;
          color: black;
          padding: 10px 30px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .antariksh-btn-primary:hover:not(:disabled) { background: white; }
        .antariksh-btn-primary:disabled { opacity: 0.2; }
      `}</style>
    </div>
  );
};

const PostCard = ({ post, onLike, onCommentToggle, isOpen, draft, onDraftChange, onCommentSubmit, currentUserId }) => {
  const isLiked = post.likes?.some(id => (id._id || id) === currentUserId);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border border-white/5 hover:border-[#FF5E00]/20 transition-all duration-500 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
              {post.user?.avatarUrl ? <img src={post.user.avatarUrl} alt="" className="object-cover" /> : <User size={14} className="text-white/20" />}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{getDisplayName(post.user)}</h4>
              <p className="text-[8px] font-bold text-[#FF5E00] uppercase tracking-[0.2em] mt-0.5 italic">{post.category?.replace("_", " ")}</p>
            </div>
          </div>
          <span className="text-[8px] font-mono text-white/20 uppercase">
            {new Date(post.createdAt).toLocaleDateString()} // {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>

        <p className="text-[13px] leading-relaxed text-white/70 italic border-l border-white/10 pl-4 mb-6">
          {post.content}
        </p>

        {post.attachment?.url && <AttachmentPreview attachment={post.attachment} />}

        <div className="flex items-center gap-4 border-t border-white/5 pt-4">
          <button onClick={onLike} className={`flex items-center gap-2 text-[9px] font-black tracking-widest uppercase transition-all ${isLiked ? 'text-[#FF5E00]' : 'text-white/30 hover:text-white'}`}>
            <Heart size={12} fill={isLiked ? "currentColor" : "none"} /> {post.likes?.length || 0}
          </button>
          <button onClick={onCommentToggle} className={`flex items-center gap-2 text-[9px] font-black tracking-widest uppercase transition-all ${isOpen ? 'text-[#FF5E00]' : 'text-white/30 hover:text-white'}`}>
            <MessageSquare size={12} /> {post.comments?.length || 0}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-6 space-y-3">
                {post.comments?.map((c, i) => (
                  <div key={i} className="bg-white/[0.01] p-3 border-l border-[#FF5E00]/20 flex gap-3">
                    <div className="h-5 w-5 border border-white/10 flex items-center justify-center flex-shrink-0"><User size={10} className="text-white/20"/></div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-white/40 mb-1">{getDisplayName(c.user)}</p>
                        <p className="text-[11px] text-white/60 italic leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <input 
                    value={draft} onChange={(e) => onDraftChange(e.target.value)} 
                    placeholder="Input comment telemetry..." 
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-white outline-none focus:border-[#FF5E00]/50" 
                  />
                  <button onClick={onCommentSubmit} className="bg-white/10 px-4 hover:bg-[#FF5E00] hover:text-black transition-all text-[9px] font-black uppercase tracking-tighter">Send</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

const AttachmentPreview = ({ attachment }) => {
  const isImage = attachment.resourceType === "image";
  const isVideo = attachment.resourceType === "video";
  const isPdf = attachment.mimeType === "application/pdf" || attachment.originalName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="mb-6 bg-black/40 border border-white/5 overflow-hidden">
      {isImage && <img src={attachment.url} alt="" className="max-h-[350px] w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />}
      {isVideo && <video controls className="w-full h-auto"><source src={attachment.url}/></video>}
      {isPdf && <iframe src={attachment.url} className="w-full h-[300px] border-none" title="pdf"/>}
      {!isImage && !isVideo && !isPdf && (
        <a href={attachment.url} className="p-4 flex items-center gap-3 text-[#FF5E00] text-[9px] font-bold uppercase tracking-widest">
            <FileText size={14}/> Download_Entry
        </a>
      )}
    </div>
  );
};

const Stat = ({ item, value, color }) => (
  <div className="border border-white/5 bg-black/40 p-2 text-right">
    <span className="block text-[7px] font-black uppercase tracking-[0.2em] text-white/20 mb-0.5">{item}</span>
    <span className="text-[9px] font-bold uppercase italic tracking-tighter" style={{ color }}>{value}</span>
  </div>
);

export default CommunityRegistry;
