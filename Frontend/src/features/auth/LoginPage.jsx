import React, { useState, useEffect } from "react";
import { apiPost } from "../../utils/api.js";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  User,
  Lock,
  ChevronRight,
  Activity,
  Radar,
  Terminal,
  UserPlus,
  Loader2,
} from "lucide-react";

const LoginPage = () => {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [status, setStatus] = useState("STANDBY");
  const [sysTime, setSysTime] = useState("");
  const navigate = useNavigate();

  // Tactical Clock Synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setSysTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC",
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!creds.username || !creds.password) return;

    setStatus("HANDSHAKE");

    try {
      const loginData = {
        email: creds.username,
        password: creds.password,
      };
      
      console.log("🌠 [AUTH_DEBUG]: Attempting System Handshake for:", loginData.email);
      await apiPost("/auth/login", loginData);

      setStatus("AUTHORIZED");

      // Backend sets JWT cookie, navigate to 3D dashboard
      setTimeout(() => navigate("/cosmos"), 1200);
    } catch (error) {
      console.error("Login Error:", error.message);
      setStatus("FAILED");
      setTimeout(() => setStatus("STANDBY"), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020305] text-slate-300 flex items-center justify-center p-6 font-sans antialiased selection:bg-orange-500/30">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#2d3748_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 bg-[#08090B] border border-white/5 shadow-2xl overflow-hidden rounded-sm"
      >
        {/* Left: Tactical Info Section */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-[#0A0C10] border-r border-white/5">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-600/10 border border-orange-600/30 flex items-center justify-center">
                <Radar size={20} className="text-orange-600" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white uppercase italic">
                Antariksh
              </h2>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter italic">
                Gateway <br />{" "}
                <span className="text-orange-600">Authentication.</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
                Restricted access portal for real-time trajectory monitoring and
                risk analysis engines.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <TelemetryItem label="Node" value="BHARAT-WEST-01" />
              <TelemetryItem
                label="Safety"
                value="Nominal"
                color="text-emerald-500"
              />
              <TelemetryItem
                label="Uplink"
                value={status}
                color={
                  status === "AUTHORIZED"
                    ? "text-emerald-500"
                    : status === "HANDSHAKE"
                      ? "text-orange-500 animate-pulse"
                      : "text-slate-400"
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Terminal size={12} className="text-orange-600" />
            <span>{sysTime}</span>
          </div>
        </div>

        {/* Right: Login Form Section */}
        <div className="lg:col-span-7 p-8 lg:p-20 flex flex-col justify-center bg-[#08090B] relative">
          <div className="max-w-sm w-full mx-auto space-y-10">
            <header>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={14} className="text-orange-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Clearance Level 3 Required
                </span>
              </div>
              <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Initialize_Uplink
              </h1>
            </header>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <InputWrapper label="Service Identifier" icon={User}>
                  <input
                    name="username"
                    type="text"
                    placeholder="OPERATOR_ID"
                    className="auth-input"
                    autoComplete="off"
                    onChange={(e) =>
                      setCreds({ ...creds, username: e.target.value })
                    }
                  />
                </InputWrapper>

                <InputWrapper label="Encryption Passkey" icon={Lock}>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    className="auth-input"
                    onChange={(e) =>
                      setCreds({ ...creds, password: e.target.value })
                    }
                  />
                </InputWrapper>
              </div>

              <button
                type="submit"
                disabled={status === "HANDSHAKE" || status === "AUTHORIZED"}
                className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-orange-600 hover:text-white flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {status === "HANDSHAKE" ? (
                  <Loader2 size={16} className="animate-spin text-orange-600" />
                ) : status === "AUTHORIZED" ? (
                  "Access Granted"
                ) : (
                  <>
                    Connect Terminal <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-8 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3 opacity-40">
                <Activity size={14} />
                <p className="text-[8px] font-bold tracking-widest uppercase">
                  Astraea Systems
                </p>
              </div>

              <Link
                to="/auth/signup"
                className="flex items-center gap-2 text-orange-500 hover:text-white transition-colors group"
              >
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Enroll Operator
                </span>
                <UserPlus
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .auth-input {
          width: 100%;
          background: #0c0e12;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.25rem 1rem 1.25rem 3.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .auth-input:focus {
          border-color: rgba(234, 88, 12, 0.4);
          background: #11141a;
        }
      `}</style>
    </div>
  );
};

const TelemetryItem = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
    <span className="text-slate-600">{label}</span>
    <span className={color}>{value}</span>
  </div>
);

const InputWrapper = ({ label, icon: Icon, children }) => (
  <div className="space-y-2 group">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-orange-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-600 transition-colors">
        <Icon size={16} />
      </div>
      {children}
    </div>
  </div>
);

export default LoginPage;
