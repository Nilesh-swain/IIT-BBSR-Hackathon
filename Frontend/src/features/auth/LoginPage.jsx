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
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";

const LoginPage = () => {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [captcha, setCaptcha] = useState({ token: "", question: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [status, setStatus] = useState("STANDBY");
  const [errorMessage, setErrorMessage] = useState("");
  const [sysTime, setSysTime] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSysTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC",
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const response = await apiPost("/api/auth/captcha", { scope: "login" });
      setCaptcha(response.data);
      setCaptchaAnswer("");
    } catch (error) {
      setErrorMessage(error.message || "Unable to load captcha.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!creds.username || !creds.password || !captchaAnswer) return;

    setStatus("HANDSHAKE");
    setErrorMessage("");

    try {
      await apiPost("/api/auth/login", {
        email: creds.username,
        password: creds.password,
        captchaToken: captcha.token,
        captchaAnswer,
      });

      setStatus("AUTHORIZED");
      setTimeout(() => navigate("/cosmos"), 900);
    } catch (error) {
      if (error.message.toLowerCase().includes("pending verification")) {
        setStatus("PENDING_VERIFY");
        return;
      }

      setStatus("FAILED");
      setErrorMessage(error.message || "Invalid credentials.");
      loadCaptcha();
      setTimeout(() => setStatus("STANDBY"), 3000);
    }
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
                Gateway <br />
                <span className="text-orange-600">Authentication.</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[280px]">
                Login now uses one security check: password plus captcha verification.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <TelemetryItem label="Node" value="BHARAT-WEST-01" />
              <TelemetryItem label="Safety" value="Nominal" color="text-emerald-500" />
              <TelemetryItem
                label="Uplink"
                value={status}
                color={
                  status === "AUTHORIZED"
                    ? "text-emerald-500"
                    : status === "HANDSHAKE"
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

        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-16 xl:p-20 flex flex-col justify-center bg-[#08090B] relative">
          <div className="max-w-md w-full mx-auto space-y-8 sm:space-y-10">
            <header>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={14} className="text-orange-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Clearance Level 3 Required
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
                Initialize_Uplink
              </h1>
            </header>

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              {status === "FAILED" && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
                  {errorMessage || "Invalid credentials. Check protocol clearances."}
                </div>
              )}

              {status === "PENDING_VERIFY" && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded flex flex-col items-center gap-2">
                  <p className="text-orange-500 text-[9px] font-bold uppercase tracking-widest text-center">
                    Account pending verification.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/auth/verify", {
                        state: { email: creds.username, mode: "registration" },
                      })
                    }
                    className="text-white text-[10px] font-black uppercase tracking-[0.2em] hover:text-orange-500 underline decoration-orange-500"
                  >
                    Verify Now
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <InputWrapper label="Service Identifier" icon={User}>
                  <input
                    name="username"
                    type="email"
                    placeholder="operator@email.com"
                    className="auth-input"
                    autoComplete="email"
                    value={creds.username}
                    onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                  />
                </InputWrapper>

                <InputWrapper label="Encryption Passkey" icon={Lock}>
                  <input
                    name="password"
                    type="password"
                    placeholder="Secure password"
                    className="auth-input"
                    autoComplete="current-password"
                    value={creds.password}
                    onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                  />
                </InputWrapper>

                <div className="border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-orange-500">
                        <ShieldCheck size={14} />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em]">
                          Captcha Verification
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-white/90 break-words">
                        {captcha.question || "Loading captcha..."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadCaptcha}
                      disabled={captchaLoading}
                      className="text-slate-400 hover:text-orange-500 transition-colors"
                    >
                      <RefreshCcw size={16} className={captchaLoading ? "animate-spin" : ""} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Enter captcha answer"
                    className="w-full bg-[#0c0e12] border border-white/10 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-orange-500/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "HANDSHAKE" || status === "AUTHORIZED" || captchaLoading}
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

              <button
                type="button"
                onClick={() =>
                  navigate("/auth/forgot-password", {
                    state: { email: creds.username },
                  })
                }
                className="w-full border border-white/10 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 transition-colors hover:border-orange-500/40 hover:text-orange-500 flex items-center justify-center gap-3"
              >
                <KeyRound size={14} />
                Forgot Password
              </button>
            </form>

            <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-600 transition-colors">
        <Icon size={16} />
      </div>
      {children}
    </div>
  </div>
);

export default LoginPage;
