import React, { useState, useRef, useEffect } from "react";
import { apiPost } from "../../utils/api.js";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  RefreshCcw,
  ChevronRight,
  Terminal,
  Loader2,
  Radar,
  Activity,
  Fingerprint,
} from "lucide-react";

const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [status, setStatus] = useState("idle"); // idle | processing | error | success
  const [sysTime, setSysTime] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from navigation state (passed from Signup) or use fallback
  const email = location.state?.email || "OPERATOR_EXTERNAL@ASTRAEA.SOL";

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) inputRefs.current[0].focus();

    // Tactical Clock
    const timer = setInterval(() => {
      setSysTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC",
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const initiateVerification = async (e) => {
    if (e) e.preventDefault();
    setStatus("processing");

    try {
      const entry = otp.join("");
      if (entry.length !== 6) return;

      console.log("🌌 [AUTH_DEBUG]: Initializing Identity Verification for:", email);
      await apiPost("/api/auth/verify-otp", { email, otp: entry });

      setStatus("success");
      // Backend sets JWT cookie, navigate to dashboard
      setTimeout(() => navigate("/cosmos"), 1500);
    } catch (error) {
      console.error("🛑 [AUTH_DEBUG]: Verification Failed:", error.message);
      setStatus("error");
      setOtp(new Array(6).fill(""));
      setTimeout(() => {
        setStatus("idle");
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 3000);
    }
  };

  const handleResend = async () => {
    try {
      console.log("🌌 [AUTH_DEBUG]: Dispatching New Access Payload Request for:", email);
      await apiPost("/api/auth/resend-otp", { email });
      alert("Astraea Payload Re-dispatched to: " + email);
    } catch (error) {
      console.error("🛑 [AUTH_DEBUG]: Resend Failed:", error.message);
      alert("Relay Failure: " + error.message);
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
                Identity <br />{" "}
                <span className="text-orange-600">Verification.</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
                Enter the 6-digit synchronization key sent to your registered
                communication channel.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <TelemetryItem
                label="Channel"
                value={email.split("@")[0] + "@***.SOL"}
              />
              <TelemetryItem
                label="Encryption"
                value="AES-GCM"
                color="text-emerald-500"
              />
              <TelemetryItem
                label="Uplink"
                value={status.toUpperCase()}
                color={
                  status === "error"
                    ? "text-red-500 animate-pulse"
                    : status === "success"
                      ? "text-emerald-500"
                      : "text-orange-500"
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Terminal size={12} className="text-orange-600" />
            <span>{sysTime}</span>
          </div>
        </div>

        {/* Right: OTP Form Section */}
        <div className="lg:col-span-7 p-8 lg:p-20 flex flex-col justify-center bg-[#08090B] relative">
          <div className="max-w-sm w-full mx-auto space-y-10">
            <header>
              <div className="flex items-center gap-2 mb-4">
                <Fingerprint size={14} className="text-orange-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Multi-Factor Authentication
                </span>
              </div>
              <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Enter_Sync_Key
              </h1>
            </header>

            <form onSubmit={initiateVerification} className="space-y-8">
              {/* PIN CLUSTER */}
              <div className="flex justify-between gap-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={status === "processing" || status === "success"}
                    className={`w-10 h-14 md:w-12 md:h-16 bg-[#0C0E12] border-2 rounded-sm text-center text-xl font-black outline-none transition-all duration-300 ${
                      status === "error"
                        ? "border-red-500 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        : status === "success"
                          ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
                          : data
                            ? "border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.1)]"
                            : "border-white/5 text-white focus:border-orange-500/40 focus:bg-[#11141a]"
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={
                    status === "processing" ||
                    status === "success" ||
                    otp.join("").length < 6
                  }
                  className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-orange-600 hover:text-white flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {status === "processing" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : status === "success" ? (
                    "Uplink Confirmed"
                  ) : (
                    <>
                      Establish Sync <ChevronRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full py-2 flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 hover:text-orange-500 transition-colors uppercase tracking-widest"
                >
                  <RefreshCcw size={12} /> Resend Access Payload
                </button>
              </div>
            </form>

            <div className="pt-8 border-t border-white/5">
              <AnimatePresence mode="wait">
                {status === "error" ? (
                  <motion.div
                    key="error-msg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 text-red-500"
                  >
                    <ShieldAlert size={14} />
                    <p className="text-[8px] font-bold tracking-widest uppercase italic">
                      Sync Failed: Invalid Protocol Key
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="status-msg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 opacity-40"
                  >
                    <Activity size={14} />
                    <p className="text-[8px] font-bold tracking-widest uppercase">
                      Secured by Astraea Mainframe
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper Component
const TelemetryItem = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
    <span className="text-slate-600">{label}</span>
    <span className={color}>{value}</span>
  </div>
);

export default OtpVerification;

