import React, { useEffect, useState } from "react";
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
  RefreshCcw,
  ScanEye,
  Activity,
  Cpu,
  ShieldAlert,
  Dna,
  Boxes,
  Target,
  Fingerprint,
} from "lucide-react";

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [sysTime, setSysTime] = useState("");
  const [captcha, setCaptcha] = useState({ token: "", image: "" });
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    captchaAnswer: "",
  });
  const [status, setStatus] = useState("STANDBY");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSysTime(
        new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC",
      );
    }, 1000);
    loadVisualCaptcha();
    return () => clearInterval(timer);
  }, []);

  const loadVisualCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const { data } = await apiPost("/api/auth/captcha/visual", {
        scope: "signup",
      });
      setCaptcha(data);
      setForm((prev) => ({ ...prev, captchaAnswer: "" }));
    } catch (err) {
      console.error("SEC_LINK_ERROR: CAPTCHA_FAILURE");
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (form.username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!captcha.token || !form.captchaAnswer.trim()) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    setStatus("SYNCING");

    try {
      const response = await apiPost("/api/auth/register", {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        captchaToken: captcha.token,
        captchaAnswer: form.captchaAnswer.trim(),
      });

      setStatus("SUCCESS");
      // Store email for OTP verification
      sessionStorage.setItem("pending_verification_email", form.email.trim().toLowerCase());
      setTimeout(() => navigate("/auth/verify-otp", { state: { email: form.email.trim().toLowerCase() } }), 1500);
    } catch (error) {
      setStatus("FAILED");
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020305] text-slate-300 flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-orange-500/30 overflow-hidden relative">
      {/* HIGH-TECH BACKGROUND LAYER */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ea580c10,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]" />

        {/* Moving Scanline FX */}
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-full h-[2px] bg-orange-500/10 blur-sm z-0"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 bg-[#08090B]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_-20px_rgba(234,88,12,0.3)] overflow-hidden rounded-sm"
      >
        {/* --- LEFT SIDE: TACTICAL HUD --- */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 xl:p-12 bg-gradient-to-b from-orange-600/[0.03] to-transparent border-r border-white/5 relative">
          {/* Decorative Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-600/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-600/30" />

          <div className="space-y-12 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-black border border-orange-600/50 flex items-center justify-center rotate-45 group transition-transform duration-500">
                  <Target size={20} className="text-orange-600 -rotate-45" />
                </div>
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-[0.2em] text-white uppercase italic">
                  Antariksh
                </h2>
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-1 w-3 bg-orange-600/20" />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600/10 border border-orange-600/20 rounded-full text-orange-500 text-[10px] font-black tracking-widest uppercase">
                <Activity size={12} className="animate-pulse" /> Uplink: Active
              </div>
              <h1 className="text-6xl font-black text-white leading-[0.85] uppercase tracking-tighter italic">
                Enroll <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                  New_Entity.
                </span>
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[300px] font-medium border-l-2 border-orange-600/50 pl-4 italic">
                Securely establish your credentials within the orbital network.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
              <HUDStat label="Registry" value="SECURE_WAVE" />
              <HUDStat label="Node" value="BHUBANESWAR_X1" />
              <HUDStat
                label="System"
                value={status}
                highlight={status === "SYNCING"}
              />
              <HUDStat label="Security" value="LEVEL_04" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-6">
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Terminal size={14} className="text-orange-600" />
              <span className="font-mono">{sysTime}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse shadow-[0_0_8px_#ea580c]" />
          </div>
        </div>

        {/* --- RIGHT SIDE: INTERFACE --- */}
        <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#08090B] relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

          <div className="max-w-md w-full mx-auto space-y-10 relative z-10">
            <header className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Boxes size={16} className="text-orange-600" />
                <span className="text-[10px] font-black text-orange-600/60 uppercase tracking-[0.5em]">
                  Protocol_Initiated
                </span>
              </div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                Access_Grant <span className="text-orange-600">01</span>
              </h1>
            </header>

            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-[10px] font-bold uppercase tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}
              {status === "SUCCESS" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-500 text-[10px] font-bold uppercase tracking-widest text-center"
                >
                  Registration successful! Redirecting to verification...
                </motion.div>
              )}
              <div className="space-y-5">
                <CustomInput
                  label="Operator Alias"
                  icon={Fingerprint}
                  placeholder="X-OPERATOR"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
                <CustomInput
                  label="Relay Email"
                  icon={Mail}
                  placeholder="void@antariksh.io"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <CustomInput
                  label="Security Cipher"
                  icon={Lock}
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              {/* NEURAL CHECK MODULE - FIXED IMAGE DISPLAY */}
              <div className="bg-[#0A0C10] border border-white/5 p-5 relative group overflow-hidden rounded-xs">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <ScanEye size={12} /> Neural_Check
                    </label>
                    <span className="text-[8px] text-slate-600 uppercase font-bold tracking-widest mt-0.5">
                      Verification Required
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={loadVisualCaptcha}
                    disabled={captchaLoading}
                    className="p-1 hover:bg-orange-600/10 rounded transition-colors group/refresh"
                  >
                    <RefreshCcw
                      size={14}
                      className={`text-slate-500 group-hover/refresh:text-orange-500 transition-all ${captchaLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="relative flex-1 h-14 bg-[#111] rounded-sm border border-white/10 flex items-center justify-center overflow-hidden">
                    {captcha.image ? (
                      <motion.img
                        key={captcha.image}
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        src={captcha.image}
                        alt="captcha"
                        className="h-full w-full object-contain filter contrast-150 brightness-110 mix-blend-lighten px-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-20">
                        <Loader2
                          size={16}
                          className="animate-spin text-orange-600"
                        />
                        <span className="text-[8px] font-mono tracking-tighter uppercase">
                          Decrypting
                        </span>
                      </div>
                    )}

                    {/* Scanning Line Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px]" />
                      <motion.div
                        animate={{ y: [0, 56, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-full h-[1px] bg-orange-500/40 shadow-[0_0_10px_orange]"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="KEY"
                    maxLength={6}
                    className="w-24 h-14 bg-black border border-white/10 text-center font-mono text-lg font-black text-orange-500 focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-800"
                    value={form.captchaAnswer}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        captchaAnswer: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || captchaLoading}
                className="w-full relative group overflow-hidden py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-orange-600 hover:text-white disabled:opacity-50"
              >
                <div className="absolute inset-0 w-1/4 h-full bg-orange-600/10 -skew-x-[45deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Register_Uplink <ChevronRight size={16} />
                    </>
                  )}
                </span>
              </button>
            </form>

            <footer className="pt-8 border-t border-white/5 flex justify-between items-center">
              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold flex items-center gap-2">
                <ShieldAlert size={12} /> Encrypted Session
              </p>
              <Link
                to="/auth/login"
                className="flex items-center gap-2 text-orange-500 hover:text-white transition-colors group"
              >
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Operator Login
                </span>
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* --- TACTICAL COMPONENTS --- */

const HUDStat = ({ label, value, highlight }) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">
      {label}
    </p>
    <p
      className={`text-xs font-mono font-bold ${highlight ? "text-orange-500 animate-pulse" : "text-slate-300"}`}
    >
      {value}
    </p>
  </div>
);

const CustomInput = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2 group">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-orange-500 transition-colors">
        {label}
      </label>
      <div className="h-[1px] w-8 bg-white/5 group-focus-within:bg-orange-600/40 transition-all" />
    </div>
    <div className="relative">
      {/* Visual Accent Line */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-600/20 group-focus-within:bg-orange-600 transition-colors" />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-600 transition-colors pointer-events-none">
        <Icon size={18} />
      </div>
      <input
        className="w-full bg-white/[0.03] border border-white/5 py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-800 outline-none group-focus-within:bg-white/[0.05] group-focus-within:border-white/10 transition-all rounded-xs"
        {...props}
        required
      />
    </div>
  </div>
);

export default SignupPage;
