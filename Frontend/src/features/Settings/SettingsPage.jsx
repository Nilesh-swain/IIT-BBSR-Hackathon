import React, { useEffect, useState } from "react";
import {
  Bell,
  LogOut,
  Mail,
  Shield,
  SlidersHorizontal,
  User,
  Power,
  Activity,
  Cpu,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../utils/api.js";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

const STORAGE_KEY = "antariksh_local_settings_v1";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    desktopNotifications: true,
    emailUpdates: true,
    webNotifications: true,
    smsUpdates: false,
    soundEffects: false,
  });

  const persistSettings = (next) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const playConfirmTone = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 520;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      /* no-op: audio not critical */
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings((current) => ({ ...current, ...JSON.parse(stored) }));
        }

        const res = await apiGet("/auth/profile");
        if (res?.success) {
          setProfile(res.data);
        }
      } catch (error) {
        console.error("Settings load failed:", error);
      }
    };
    load();
  }, []);

  const handleDesktopToggle = async () => {
    const nextValue = !settings.desktopNotifications;
    if (nextValue && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        addNotification({
          title: "DESKTOP_UPLINK_BLOCKED",
          message: "Permission denied. Enable browser notifications to arm visual alerts.",
          type: "WARN",
        });
        persistSettings({ ...settings, desktopNotifications: false });
        return;
      }
      addNotification({
        title: "DESKTOP_UPLINK_READY",
        message: "Visual mission-critical alerts armed.",
        type: "INFO",
      });
    }
    persistSettings({ ...settings, desktopNotifications: nextValue });
  };

  const handleEmailToggle = () => {
    if (!profile?.email) {
      addNotification({
        title: "NO_EMAIL_ON_FILE",
        message: "Add an email in Profile before enabling Neural Mail.",
        type: "WARN",
      });
      persistSettings({ ...settings, emailUpdates: false });
      return;
    }

    const nextValue = !settings.emailUpdates;
    persistSettings({ ...settings, emailUpdates: nextValue });
    addNotification({
      title: nextValue ? "NEURAL_MAIL_ARMED" : "NEURAL_MAIL_STANDBY",
      message: nextValue ? "Encrypted archive pushes enabled." : "Mail uplink paused.",
      type: "INFO",
    });
  };

  const handleSoundToggle = () => {
    const nextValue = !settings.soundEffects;
    persistSettings({ ...settings, soundEffects: nextValue });
    if (nextValue) playConfirmTone();
  };

  const handleWebToggle = () => {
    const nextValue = !settings.webNotifications;
    persistSettings({ ...settings, webNotifications: nextValue });
    addNotification({
      title: nextValue ? "IN_APP_ALERTS_ON" : "IN_APP_ALERTS_OFF",
      message: nextValue ? "On-site notifications armed." : "On-site notifications muted.",
      type: "INFO",
    });
  };

  const handleSmsToggle = () => {
    const nextValue = !settings.smsUpdates;
    persistSettings({ ...settings, smsUpdates: nextValue });
    addNotification({
      title: nextValue ? "SMS_CHANNEL_ARMED" : "SMS_CHANNEL_MUTED",
      message: nextValue ? "SMS alerts will be sent when available." : "SMS alerts disabled.",
      type: "INFO",
    });
  };

  const handleLogout = async () => {
    try {
      await apiGet("/auth/logout");
      addNotification({
        title: "SESSION_TERMINATED",
        message: "Neural link severed. Secure session ended.",
        type: "INFO",
      });
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] bg-[linear-gradient(rgba(255,94,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,94,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] px-8 py-10 text-white selection:bg-[#FF5E00] selection:text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* --- HEADER BLOCK --- */}
        <header className="relative border-l-4 border-[#FF5E00] bg-[#0A0A0A] p-10 shadow-2xl">
          <div className="absolute top-4 right-6 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1 w-4 bg-[#FF5E00]/20" />
            ))}
          </div>
          
          <div className="flex items-center gap-3 text-[#FF5E00]">
            <Cpu size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em]">
              Antariksh_Core_Sys // Terminal_01
            </span>
          </div>
          
          <h1 className="mt-4 text-6xl font-black uppercase italic tracking-tighter">
            Control <span className="text-[#FF5E00] drop-shadow-[0_0_15px_#FF5E00]">Panel</span>
          </h1>
          <p className="mt-4 font-mono text-xs text-white/40 uppercase tracking-widest">
            Hardware Status: <span className="text-green-500">Nominal</span> // Uplink: Established
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* --- NOTIFICATIONS SECTION --- */}
          <section className="relative border border-white/10 bg-[#080808]/90 p-8">
            <div className="absolute -top-[1px] -left-[1px] h-4 w-4 border-t-2 border-l-2 border-[#FF5E00]" />
            
            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#FF5E00]" />
                <h2 className="text-[14px] font-black uppercase tracking-[0.3em]">Neural_Comms</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF5E00]" />
                <span className="font-mono text-[10px] text-white/30">SYNC_ON</span>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleRow
                title="Desktop Uplink"
                description="Visual mission-critical alerts in terminal."
                enabled={settings.desktopNotifications}
                onToggle={handleDesktopToggle}
              />
              <ToggleRow
                title="On-site Alerts"
                description="Bell notifications inside the console."
                enabled={settings.webNotifications}
                onToggle={handleWebToggle}
              />
              <ToggleRow
                title="Neural Mail"
                description={profile?.email ? "Push encrypted data to primary archives." : "Add an email in Profile to enable mail uplink."}
                enabled={settings.emailUpdates}
                onToggle={handleEmailToggle}
                disabled={!profile?.email}
              />
              <ToggleRow
                title="SMS Relay"
                description="Fallback text alerts for critical events."
                enabled={settings.smsUpdates}
                onToggle={handleSmsToggle}
              />
              <ToggleRow
                title="Audio Feedback"
                description="Sonic confirmation for terminal commands."
                enabled={settings.soundEffects}
                onToggle={handleSoundToggle}
              />
            </div>
          </section>

          {/* --- PROFILE / SECURITY SECTION --- */}
          <section className="relative flex flex-col border border-white/10 bg-[#080808]/90 p-8">
             <div className="absolute -top-[1px] -right-[1px] h-4 w-4 border-t-2 border-r-2 border-[#FF5E00]" />

            <div className="mb-8 flex items-center gap-3 border-b border-white/5 pb-6">
              <Lock size={18} className="text-[#FF5E00]" />
              <h2 className="text-[14px] font-black uppercase tracking-[0.3em]">Operator_ID</h2>
            </div>

            <div className="space-y-4 flex-grow">
              <InfoRow icon={<User size={14} />} label="Operator" value={profile?.username || "---"} />
              <InfoRow icon={<Mail size={14} />} label="Uplink_Email" value={profile?.email || "---"} />
              <InfoRow icon={<Shield size={14} />} label="Clearance" value={profile?.role || "LEVEL_0"} />
            </div>

            {/* UPGRADED LOGOUT BUTTON */}
            <div className="mt-12 pt-6 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="group relative w-full overflow-hidden border border-rose-500/40 bg-rose-500/5 py-5 transition-all hover:bg-rose-600 active:scale-[0.98]"
              >
                <div className="relative z-10 flex items-center justify-center gap-4 text-[12px] font-black uppercase tracking-[0.4em] text-rose-500 transition-colors group-hover:text-black">
                  <Power size={16} />
                  Terminate Session
                </div>
                {/* Visual "Scanner" effect on hover */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-full group-hover:animate-[scan_1.5s_infinite]" />
              </button>
              <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
                // System_Log: ID_${Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </section>

        </div>
      </div>
      
      {/* Tailwind custom scan animation used in the button */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

const ToggleRow = ({ title, description, enabled, onToggle, disabled = false }) => (
  <div className="group flex items-center justify-between border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-[#FF5E00]/40">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className={`h-1.5 w-1.5 ${enabled ? 'bg-[#FF5E00]' : 'bg-white/10'}`} />
        <p className="text-[12px] font-black uppercase tracking-widest text-white/90">
          {title}
        </p>
      </div>
      <p className="font-mono text-[10px] text-white/40 uppercase tracking-tighter italic">{description}</p>
    </div>
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative h-5 w-10 border transition-all ${
        enabled ? "border-[#FF5E00] bg-[#FF5E00]/20" : "border-white/10 bg-transparent"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 transition-all duration-300 ${
          enabled ? "left-6 bg-[#FF5E00] shadow-[0_0_8px_#FF5E00]" : "left-1 bg-white/20"
        }`}
      />
    </button>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="group flex items-center justify-between border-b border-white/5 bg-transparent py-4 px-2 transition-all hover:bg-white/[0.02]">
    <div className="flex items-center gap-4">
      <span className="text-[#FF5E00]/60 group-hover:text-[#FF5E00] transition-colors">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
        {label}
      </span>
    </div>
    <span className="font-mono text-xs font-bold text-white/70">[{value}]</span>
  </div>
);

export default SettingsPage;
