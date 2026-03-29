import React, { useState, useEffect } from "react";
import { apiPost } from "../../utils/api.js";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Lock,
  ChevronRight,
  Radar,
  Terminal,
  Loader2,
  ShieldCheck,
  Activity,
} from "lucide-react";

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [regComplete, setRegComplete] = useState(false);
  const [sysTime, setSysTime] = useState("");
  const [regError, setRegError] = useState("");
  const navigate = useNavigate();

  // Tactical Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setSysTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC",
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      username: e.target[0].value,
      email: e.target[1].value,
      password: e.target[2].value,
    };

    try {
      await apiPost("/auth/register", formData);
      setLoading(false);
      setRegError("");
      setRegComplete(true);

      // Navigate to OTP with email state
      setTimeout(() => {
        navigate("/auth/verify", {
          state: { email: formData.email },
          replace: true,
        });
      }, 1500);
    } catch (error) {
      console.error("Registration Error:", error.message);
      setLoading(false);
      setRegError(error.message);
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
                Operator <br />{" "}
                <span className="text-orange-600">Enrollment.</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
                Initialize your researcher node to access the Astraea orbital
                trajectory database.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <TelemetryItem label="Node_Type" value="External_Researcher" />
              <TelemetryItem
                label="Protocol"
                value="P-384_ECC"
                color="text-emerald-500"
              />
              <TelemetryItem
                label="Security"
                value={loading ? "Generating..." : "Standby"}
                color={
                  loading ? "text-orange-500 animate-pulse" : "text-slate-400"
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Terminal size={12} className="text-orange-600" />
            <span>{sysTime}</span>
          </div>
        </div>

        {/* Right: Form Section */}
        <div className="lg:col-span-7 p-8 lg:p-20 flex flex-col justify-center bg-[#08090B] relative">
          <AnimatePresence mode="wait">
            {!regComplete ? (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="max-w-sm w-full mx-auto space-y-10"
              >
                <header>
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={14} className="text-orange-500" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                      Institutional Access Only
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    Request_Clearance
                  </h1>
                </header>

                <form onSubmit={handleSignup} className="space-y-6">
                  {regError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs font-bold">
                      {regError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <InputWrapper label="Operator Alias" icon={UserPlus}>
                      <input
                        type="text"
                        placeholder="RESEARCH_ID_01"
                        className="auth-input"
                        required
                      />
                    </InputWrapper>

                    <InputWrapper label="Relay Email" icon={Mail}>
                      <input
                        type="email"
                        placeholder="OPERATOR@AGENCY.GOV"
                        className="auth-input"
                        required
                      />
                    </InputWrapper>

                    <InputWrapper label="Security Secret" icon={Lock}>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="auth-input"
                        required
                      />
                    </InputWrapper>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-orange-600 hover:text-white flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Generate Credentials <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3 opacity-40">
                    <Activity size={14} />
                    <p className="text-[8px] font-bold tracking-widest uppercase">
                      Node Initialization
                    </p>
                  </div>

                  <Link
                    to="/auth/login"
                    className="flex items-center gap-2 text-orange-500 hover:text-white transition-colors group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Connect Terminal
                    </span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <ShieldCheck size={48} className="text-emerald-500" />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Node_Established
                  </h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">
                    ✓ Credentials Verified
                  </p>
                  <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded">
                    <p className="text-[9px] text-slate-400 uppercase leading-relaxed">
                      Handshake successful. Redirecting to Multi-Factor Sync...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

// Helper Components
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

export default SignupPage;
