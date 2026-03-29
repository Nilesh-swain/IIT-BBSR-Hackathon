// import React, { useState, useEffect, Suspense, lazy } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// // Core Layouts & Utils
// import MainLayout from "../layouts/MainLayout.jsx";
// import { apiGet } from "../utils/api.js";

// // Lazy Pages - Mission Modules
// const LandingPage = lazy(() => import("../features/LangingPage/LandingPage.jsx"));
// const SignupPage = lazy(() => import("../features/auth/SignupPage.jsx"));
// const LoginPage = lazy(() => import("../features/auth/LoginPage.jsx"));
// const OtpVerification = lazy(() => import("../features/auth/OtpVerification.jsx"));
// const ThreeDView = lazy(() => import("../features/3D/ThreeDView.jsx"));
// const ImpactSimulator = lazy(() => import("../features/ImpactSimulator/ImpactSimulator.jsx"));
// const RiskMonitor = lazy(() => import("../features/RiskMonitor/RiskMonitor.jsx"));
// const Profile = lazy(() => import("../features/Profile/Profile.jsx"));
// const CommunityRegistry = lazy(() => import("../features/Community/CommunityRegistry.jsx"));

// // --- 1. TACTICAL SYSTEM LOADER ---
// function SystemLoader() {
//   return (
//     <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center font-sans overflow-hidden">
//       <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
//       <div className="relative mb-10">
//         <motion.div 
//           animate={{ rotate: 360 }}
//           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//           className="w-24 h-24 border border-white/5 rounded-full p-1"
//         >
//           <div className="w-full h-full border-t-2 border-[#FF5E00] rounded-full shadow-[0_0_15px_#FF5E00]" />
//         </motion.div>
//       </div>
//       <div className="flex flex-col items-center gap-3 z-10">
//         <span className="text-[10px] font-black text-white uppercase tracking-[0.8em] italic animate-pulse">Establishing_Uplink</span>
//         <div className="w-40 h-[1px] bg-white/10 relative overflow-hidden">
//           <motion.div 
//             animate={{ x: ["-100%", "100%"] }}
//             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//             className="absolute h-full w-20 bg-gradient-to-r from-transparent via-[#FF5E00] to-transparent" 
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- 2. AUTHENTICATION SHIELD ---
// function ProtectedRoute({ children }) {
//   const [status, setStatus] = useState("loading");

//   useEffect(() => {
//     let isMounted = true;
//     const verifySession = async () => {
//       try {
//         await apiGet("/auth/me");
//         if (isMounted) setStatus("success");
//       } catch (err) {
//         if (isMounted) setStatus("fail");
//       }
//     };
//     verifySession();
//     return () => { isMounted = false; };
//   }, []);

//   if (status === "loading") return <SystemLoader />;
//   if (status === "fail") return <Navigate to="/auth/login" replace />;
  
//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
//       {children}
//     </motion.div>
//   );
// }

// // --- 3. MISSION ROUTE REGISTRY ---
// const MISSION_ROUTES = [
//   { path: "/cosmos", component: <ThreeDView /> },
//   { path: "/community", component: <CommunityRegistry /> },
//   { path: "/threats", component: <RiskMonitor /> },
//   { path: "/telemetry", component: <ImpactSimulator /> },
//   { path: "/profile", component: <Profile /> },
// ];

// // --- 4. MAIN NAVIGATOR ---
// export default function AppNavigator() {
//   return (
//     <Router>
//       <Suspense fallback={<SystemLoader />}>
//         <AnimatePresence mode="wait">
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/auth/signup" element={<SignupPage />} />
//             <Route path="/auth/login" element={<LoginPage />} />
//             <Route path="/auth/verify" element={<Suspense fallback={<SystemLoader />}><OtpVerificationHandler /></Suspense>} />

//             {MISSION_ROUTES.map((route) => (
//               <Route
//                 key={route.path}
//                 path={route.path}
//                 element={
//                   <ProtectedRoute>
//                     <MainLayout>
//                       <Suspense fallback={<SystemLoader />}>
//                         {route.component}
//                       </Suspense>
//                     </MainLayout>
//                   </ProtectedRoute>
//                 }
//               />
//             ))}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </AnimatePresence>
//       </Suspense>
//     </Router>
//   );
// }

// function OtpVerificationHandler() {
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   return (
//     <OtpVerification
//       email={state?.email || "OPERATOR@ASTRAEA.SOL"}
//       onVerified={() => setTimeout(() => navigate("/cosmos", { replace: true }), 1000)}
//     />
//   );
// }



import React, { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Core Layouts & Utils
import MainLayout from "../layouts/MainLayout.jsx";
import { apiGet } from "../utils/api.js";

// Lazy Pages - Mission Modules
const LandingPage = lazy(() => import("../features/LangingPage/LandingPage.jsx"));
const SignupPage = lazy(() => import("../features/auth/SignupPage.jsx"));
const LoginPage = lazy(() => import("../features/auth/LoginPage.jsx"));
const OtpVerification = lazy(() => import("../features/auth/OtpVerification.jsx"));
const ThreeDView = lazy(() => import("../features/3D/ThreeDView.jsx"));
const ImpactSimulator = lazy(() => import("../features/ImpactSimulator/ImpactSimulator.jsx"));
const RiskMonitor = lazy(() => import("../features/RiskMonitor/RiskMonitor.jsx"));
const Profile = lazy(() => import("../features/Profile/Profile.jsx"));
const SettingsPage = lazy(() => import("../features/Settings/SettingsPage.jsx"));

// Feature Imports
const CommunityRegistry = lazy(() => import("../features/Community/CommunityRegistry.jsx"));
const DataHub = lazy(() => import("../features/DataHub/DataHub.jsx"));
const Research = lazy(() => import("../features/ResearchLab/ResearchLab.jsx"))

// --- 1. SYSTEM LOADER ---
function SystemLoader() {
  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center font-mono overflow-hidden">
      <div className="relative mb-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border border-white/5 rounded-full p-1"
        >
          <div className="w-full h-full border-t-2 border-[#FF5E00] rounded-full shadow-[0_0_15px_#FF5E00]" />
        </motion.div>
      </div>
      <span className="text-[10px] font-black text-white uppercase tracking-[0.8em] animate-pulse">Establishing_Uplink</span>
    </div>
  );
}

// --- 2. AUTH SHIELD ---
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        await apiGet("/auth/me");
        if (isMounted) setStatus("success");
      } catch (err) {
        if (isMounted) setStatus("fail");
      }
    };
    verifySession();
    return () => { isMounted = false; };
  }, []);

  if (status === "loading") return <SystemLoader />;
  if (status === "fail") return <Navigate to="/auth/login" replace />;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  );
}

// --- 3. MISSION ROUTE REGISTRY ---
// These paths MUST match the Sidebar paths exactly
const MISSION_ROUTES = [
  { path: "/cosmos", component: <ThreeDView /> },
  { path: "/registry", component: <DataHub /> },           // Data Registry Path
  { path: "/community", component: <CommunityRegistry /> }, // Community Page Path
  { path: "/threats", component: <RiskMonitor /> },
  { path: "/telemetry", component: <ImpactSimulator /> },
  { path: "/profile", component: <Profile /> },
  { path: "/settings", component: <SettingsPage /> },
  { path: "/research", component: <Research /> },
];

// --- 4. MAIN NAVIGATOR ---
export default function AppNavigator() {
  return (
    <Router>
      <Suspense fallback={<SystemLoader />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/verify" element={<OtpVerificationHandler />} />

            {MISSION_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Suspense fallback={<SystemLoader />}>
                        {route.component}
                      </Suspense>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Router>
  );
}

function OtpVerificationHandler() {
  const navigate = useNavigate();
  const { state } = useLocation();
  return (
    <OtpVerification
      email={state?.email || "OPERATOR@ASTRAEA.SOL"}
      onVerified={() => setTimeout(() => navigate("/cosmos", { replace: true }), 1000)}
    />
  );
}
