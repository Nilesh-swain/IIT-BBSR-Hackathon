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
  ShieldCheck,
  Activity,
  RefreshCcw,
  Cpu,
  Globe
} from "lucide-react";

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [regComplete, setRegComplete] = useState(false);
  const [sysTime, setSysTime] = useState("");
  const [regError, setRegError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    captchaAnswer: "",
  });
  const [captcha, setCaptcha] = useState({ token: "", question: "" });
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSysTime(new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { loadCaptcha(); }, []);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const response = await apiPost("/api/auth/captcha", { scope: "signup" });
      setCaptcha(response.data);
      setForm((current) => ({ ...current, captchaAnswer: "" }));
    } catch (error) {
      setRegError("Captcha link failed.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setRegError("");
    try {
      const response = await apiPost("/api/auth/register", {
        ...form,
        captchaToken: captcha.token,
      });
      setRegComplete(true);
      
      // Store email for refresh persistence
      sessionStorage.setItem("pending_verification_email", response?.email || form.email);
      
      setTimeout(() => {
        navigate("/auth/verify", {
          state: { email: response?.email || form.email, mode: "registration" },
          replace: true,
        });
      }, 1500);
    } catch (error) {
      setRegError(error.message);
      loadCaptcha(); // Auto refresh captcha on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030407] text-slate-300 flex items-center justify-center p-4 font-sans selection:bg-orange-500/40 overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a202c_0%,transparent_100%)] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 bg-[#08090B]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden"
      >
        {/* Left Side: Telemetry Panel */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-between p-8 bg-gradient-to-b from-[#0A0C10] to-transparent border-r border-white/5 relative">
            {/* Animated Scan Line */}
            <motion.div 
                animate={{ y: [0, 400, 0] }} 
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent z-0" 
            />

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded">
                <Radar size={18} className="text-orange-500" />
              </div>
              <h2 className="text-lg font-black tracking-widest text-white uppercase italic">Antariksh</h2>
            </div>

            <div className="space-y-2">
              <h3 className="text-4xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">
                Operator <br /> <span className="text-orange-600">Enrollment</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Auth_Protocol: v2.4.0 <br /> Clearance_Level: Beta
              </p>
            </div>

            <div className="space-y-4 pt-6">
              <TelemetryItem icon={Globe} label="Region" value="Global_Edge" />
              <TelemetryItem icon={Cpu} label="System" value="Neural_Link" />
              <TelemetryItem icon={Activity} label="Status" value={loading ? "Processing..." : "Standby"} color={loading ? "text-orange-500" : "text-emerald-500"} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 tracking-tighter bg-white/5 p-2 rounded border border-white/5">
            <Terminal size={12} className="text-orange-600" />
            <span>{sysTime}</span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-8 p-8 lg:p-12 flex flex-col justify-center bg-[#08090B]/50 relative">
          <AnimatePresence mode="wait">
            {!regComplete ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md w-full mx-auto space-y-6"
              >
                <header className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] w-8 bg-orange-600" />
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Identity Verification</span>
                  </div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Request_Clearance</h1>
                </header>

                <form onSubmit={handleSignup} className="space-y-4">
                  {regError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-rose-500/10 border-l-2 border-rose-500 text-rose-300 text-[11px] font-bold uppercase tracking-wider">
                      Error: {regError}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <InputBox label="Operator Alias" icon={UserPlus} type="text" placeholder="X-742" value={form.username} onChange={(v) => setForm({...form, username: v})} />
                    <InputBox label="Relay Email" icon={Mail} type="email" placeholder="void@antariksh.io" value={form.email} onChange={(v) => setForm({...form, email: v})} />
                    <InputBox label="Security Secret" icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={(v) => setForm({...form, password: v})} />
                  </div>

                  {/* Captcha Section */}
                  <div className="group relative bg-white/[0.03] border border-white/5 p-4 rounded-sm transition-all hover:bg-white/[0.05]">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Bot_Check</label>
                      <button type="button" onClick={loadCaptcha} className="text-slate-500 hover:text-white transition-colors">
                        <RefreshCcw size={14} className={captchaLoading ? "animate-spin" : ""} />
                      </button>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 text-sm font-mono text-white py-2 px-3 bg-black/40 border border-white/5 rounded italic">
                            {captcha.question || "Verifying..."}
                        </div>
                        <input
                            type="text"
                            required
                            className="w-24 bg-orange-600/10 border border-orange-600/30 text-center text-orange-500 text-sm font-bold outline-none focus:border-orange-500"
                            placeholder="ANS"
                            value={form.captchaAnswer}
                            onChange={(e) => setForm({...form, captchaAnswer: e.target.value})}
                        />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || captchaLoading}
                    className="w-full py-4 bg-orange-600 text-white font-black text-xs uppercase tracking-[0.4em] transition-all hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_20px_-10px_rgba(234,88,12,0.3)]"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Initialize Uplink <ChevronRight size={18} /></>}
                  </button>
                </form>

                <div className="pt-4 flex justify-between items-center border-t border-white/5">
                   <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Existing Node?</p>
                   <Link to="/auth/login" className="text-[9px] font-black text-orange-500 hover:text-white uppercase tracking-[0.2em] transition-all">
                    Return to Login →
                   </Link>
                </div>
              </motion.div>
            ) : (
              <SuccessState />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style>{`
        .custom-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1rem 1rem 1rem 3rem;
          font-size: 0.8rem;
          color: white;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 4px;
        }
        .custom-input:focus {
          background: rgba(255,255,255,0.06);
          border-color: rgba(234, 88, 12, 0.5);
          box-shadow: 0 0 20px -10px rgba(234, 88, 12, 0.3);
        }
      `}</style>
    </div>
  );
};

const InputBox = ({ label, icon: Icon, ...props }) => (
  <div className="relative group">
    <label className="absolute -top-2 left-3 bg-[#08090B] px-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-orange-500 z-20 transition-colors">
      {label}
    </label>
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors z-20">
      <Icon size={16} />
    </div>
    <input 
        {...props} 
        onChange={(e) => props.onChange(e.target.value)}
        className="custom-input font-bold tracking-wide" 
    />
  </div>
);

const TelemetryItem = ({ icon: Icon, label, value, color = "text-white" }) => (
  <div className="flex items-center gap-3">
    <Icon size={14} className="text-slate-600" />
    <div className="flex flex-1 justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-white/[0.03] pb-1">
      <span className="text-slate-600">{label}</span>
      <span className={color}>{value}</span>
    </div>
  </div>
);

const SuccessState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center text-center space-y-6"
  >
    <div className="relative">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl" 
        />
        <div className="relative p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <ShieldCheck size={54} className="text-emerald-500" />
        </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Uplink_Established</h3>
      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em]">Check relay email for OTP code</p>
    </div>
  </motion.div>
);

export default SignupPage;