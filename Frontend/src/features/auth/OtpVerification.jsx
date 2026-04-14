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

const OtpVerification = (props) => {
  const location = useLocation();
  const state = location.state || {};
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputRefs = useRef([]);
  const [sysTime, setSysTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("pending_verification_email");
    const currentEmail = props.email || state.email || storedEmail;

    if (currentEmail && currentEmail !== "operator@example.com") {
      setEmail(currentEmail);
      sessionStorage.setItem("pending_verification_email", currentEmail);
    } else if (!currentEmail) {
      navigate("/auth/signup", { replace: true });
    } else {
        setEmail(currentEmail);
    }
  }, [props.email, state.email, navigate]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();

    const sysTimer = setInterval(() => {
      setSysTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC",
      );
    }, 1000);

    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(sysTimer);
      clearInterval(countdownTimer);
    };
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value.substring(value.length - 1);
    setOtp(nextOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const initiateVerification = async (e) => {
    e.preventDefault();
    const entry = otp.join("");
    if (entry.length !== 6) return;

    setStatus("processing");
    setMessage("");

    try {
      await apiPost("/api/auth/verify-otp", { email, otp: entry });
      setStatus("success");
      sessionStorage.removeItem("pending_verification_email");
      setTimeout(() => navigate("/cosmos", { replace: true }), 1000);
    } catch (error) {
      setMessage(error.message || "Verification failed.");
      setStatus("error");
      setOtp(new Array(6).fill(""));
      setTimeout(() => {
        setStatus("idle");
        inputRefs.current[0]?.focus();
      }, 2500);
    }
  };

  const handleResend = async () => {
    try {
      setMessage("");
      await apiPost("/api/auth/resend-otp", { email });
      setTimeLeft(600);
      setMessage("A fresh OTP has been sent to your email.");
    } catch (error) {
      setMessage(error.message || "Unable to resend OTP.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#020305] text-slate-300 flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-orange-500/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#2d3748_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 bg-[#08090B] border border-white/5 shadow-2xl overflow-hidden rounded-sm"
      >
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 xl:p-12 bg-[#0A0C10] border-r border-white/5">
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
                Email <br />
                <span className="text-orange-600">Verification.</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[280px]">
                Final signup step. Enter the 6-digit OTP sent to your registered email.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <TelemetryItem label="Channel" value={email} />
              <TelemetryItem label="Mode" value="REGISTRATION OTP" color="text-emerald-500" />
              <TelemetryItem 
                label="Expires" 
                value={formatTime(timeLeft)} 
                color={timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-white"} 
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

        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-16 xl:p-20 flex flex-col justify-center bg-[#08090B] relative">
          <div className="max-w-md w-full mx-auto space-y-8 sm:space-y-10">
            <header>
              <div className="flex items-center gap-2 mb-4">
                <Fingerprint size={14} className="text-orange-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Signup Step 2 Of 2
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
                Enter_OTP_Code
              </h1>
            </header>

            <form onSubmit={initiateVerification} className="space-y-8">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                    className={`w-full h-14 sm:h-16 bg-[#0C0E12] border-2 rounded-sm text-center text-xl font-black outline-none transition-all duration-300 ${
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
                    "Verification Complete"
                  ) : (
                    <>
                      Verify Account <ChevronRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full py-2 flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 hover:text-orange-500 transition-colors uppercase tracking-widest"
                >
                  <RefreshCcw size={12} /> Resend OTP
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
                    <p className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase italic">
                      {message || "Verification failed"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="status-msg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-2 opacity-70"
                  >
                    <div className="flex items-center gap-3 opacity-60">
                      <Activity size={14} />
                      <p className="text-[8px] font-bold tracking-widest uppercase">
                        Secured by Astraea Mainframe
                      </p>
                    </div>
                    {message ? (
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-orange-500">
                        {message}
                      </p>
                    ) : null}
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

const TelemetryItem = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
    <span className="text-slate-600">{label}</span>
    <span className={`${color} truncate text-right`}>{value}</span>
  </div>
);

export default OtpVerification;
