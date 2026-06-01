import React, { useEffect, useState } from "react";
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
  KeyRound,
  Fingerprint,
} from "lucide-react";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(""); // Email or Username
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [status, setStatus] = useState("STANDBY");
  const [errorMessage, setErrorMessage] = useState("");
  const [sysTime, setSysTime] = useState("");
  const [captcha, setCaptcha] = useState({ token: "", question: "" });
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSysTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC",
      );
    }, 1000);
    loadCaptcha();
    return () => clearInterval(timer);
  }, []);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const response = await apiPost("/api/auth/captcha", { scope: "login" });
      setCaptcha(response.data);
    } catch (error) {
      console.error("Failed to load captcha:", error);
      setErrorMessage("Failed to load security check. Please refresh the page.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Client-side validation
    if (!identifier.trim()) {
      setErrorMessage("Please enter your username or email.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }
    if (!captchaAnswer.trim()) {
      setErrorMessage("Please complete the security check.");
      return;
    }

    setStatus("AUTHORIZING");

    try {
      const response = await apiPost("/api/auth/login", {
        identifier: identifier.trim(),
        password,
        captchaToken: captcha.token,
        captchaAnswer: captchaAnswer.trim(),
      });

      setStatus("AUTHORIZED");

      setTimeout(() => navigate("/cosmos", { replace: true }), 800);
    } catch (error) {
      setStatus("FAILED");
      setErrorMessage(error.message || "Access Denied: Invalid Credentials.");
      // Reload captcha on failed attempt
      loadCaptcha();
      setTimeout(() => setStatus("STANDBY"), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020305] text-slate-300 flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-orange-500/30">
      {/* Background Grid FX */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#2d3748_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 bg-[#08090B] border border-white/5 shadow-2xl overflow-hidden rounded-sm"
      >
        {/* --- LEFT PANEL: HUD & TELEMETRY --- */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 xl:p-12 bg-[#0A0C10] border-r border-white/5 relative">
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
                Gateway <br />
                <span className="text-orange-600">Authorization.</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[280px]">
                Enter your operator credentials to establish a secure uplink
                connection to the orbital network.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <TelemetryItem label="Protocol" value="SECURE_HASH_V2" />
              <TelemetryItem
                label="Security"
                value="ENCRYPTED"
                color="text-emerald-500"
              />
              <TelemetryItem
                label="Status"
                value={status}
                color={
                  status === "AUTHORIZED"
                    ? "text-emerald-500"
                    : status === "AUTHORIZING"
                      ? "text-orange-500 animate-pulse"
                      : status === "FAILED"
                        ? "text-red-500"
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

        {/* --- RIGHT PANEL: LOGIN INTERFACE --- */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-16 xl:p-20 flex flex-col justify-center bg-[#08090B] relative">
          <div className="max-w-md w-full mx-auto space-y-8 sm:space-y-10">
            <header>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={14} className="text-orange-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Authentication Required
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
                Initialize_Login
              </h1>
            </header>

            <form onSubmit={handleLogin} className="space-y-6">
              {status === "FAILED" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-[10px] font-bold uppercase tracking-widest text-center"
                >
                  {errorMessage}
                </motion.div>
              )}

              <div className="space-y-5">
                <InputWrapper label="Operator Identity" icon={User}>
                  <input
                    type="text"
                    placeholder="Username or Email"
                    className="auth-input"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={status === "AUTHORIZING"}
                    required
                  />
                </InputWrapper>

                <InputWrapper label="Access Cipher" icon={Lock}>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={status === "AUTHORIZING"}
                    required
                  />
                </InputWrapper>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Security Check: {captchaLoading ? "Loading..." : captcha.question}
                  </label>
                  <input
                    type="text"
                    placeholder="Answer"
                    className="auth-input"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    disabled={status === "AUTHORIZING" || captchaLoading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  status === "AUTHORIZING" ||
                  !identifier.trim() ||
                  !password ||
                  !captchaAnswer.trim() ||
                  captchaLoading
                }
                className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-orange-600 hover:text-white flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {status === "AUTHORIZING" ? (
                  <Loader2 size={16} className="animate-spin text-orange-600" />
                ) : (
                  <>
                    Grant Access <ChevronRight size={16} />
                  </>
                )}
              </button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/auth/forgot-password")}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-2"
                >
                  <KeyRound size={12} /> Recovery Protocol
                </button>
              </div>
            </form>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
              <div className="flex items-center gap-3 opacity-40">
                <Fingerprint size={14} className="text-orange-500" />
                <p className="text-[8px] font-bold tracking-widest uppercase">
                  Biometric Bypass Offline
                </p>
              </div>

              <Link
                to="/auth/signup"
                className="flex items-center gap-2 text-orange-500 hover:text-white transition-colors group"
              >
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Create Account
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

      {/* Scoped CSS for the tactical inputs */}
      <style>{`
        .auth-input {
          width: 100%;
          background: #0c0e12;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.1rem 1rem 1.1rem 3.25rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .auth-input:focus {
          border-color: rgba(234, 88, 12, 0.4);
          background: #11141a;
          box-shadow: 0 0 20px rgba(234, 88, 12, 0.05);
        }
        .auth-input:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */

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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-600 transition-colors pointer-events-none">
        <Icon size={16} />
      </div>
      {children}
    </div>
  </div>
);

export default LoginPage;
