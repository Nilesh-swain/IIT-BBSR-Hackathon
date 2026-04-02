import React, { useEffect, useState } from "react";
import {
  Bell,
  Mail,
  Shield,
  User,
  Power,
  Cpu,
  Lock,
  Smartphone,
  Monitor,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "../../utils/api.js";
import { useNotifications } from "../../contexts/NotificationContext.jsx";

const STORAGE_KEY = "antariksh_local_settings_v1";
const defaultSettings = {
  notificationPreferences: {
    desktopNotifications: true,
    emailUpdates: true,
    webNotifications: true,
    smsUpdates: false,
    soundEffects: false,
  },
  security: {
    twoFactor: {
      enabled: false,
      method: "otp",
    },
  },
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [savingKey, setSavingKey] = useState("");

  const syncLocalCache = (nextSettings) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextSettings.notificationPreferences),
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const localPreferences = stored ? JSON.parse(stored) : {};
        const [profileRes, settingsRes] = await Promise.all([
          apiGet("/api/auth/profile"),
          apiGet("/api/auth/settings"),
        ]);

        if (profileRes?.success) {
          setProfile(profileRes.data);
        }

        if (settingsRes?.success) {
          const remote = settingsRes.data || {};
          const merged = {
            notificationPreferences: {
              ...defaultSettings.notificationPreferences,
              ...localPreferences,
              ...(remote.notificationPreferences || {}),
            },
            security: {
              twoFactor: {
                ...defaultSettings.security.twoFactor,
                ...(remote.security?.twoFactor || {}),
              },
            },
          };
          setSettings(merged);
          syncLocalCache(merged);
        }
      } catch (error) {
        console.error("Settings load failed:", error);
      }
    };

    load();
  }, []);

  const persistSettings = async (nextSettings, successMessage, savingId) => {
    setSavingKey(savingId);
    try {
      const response = await apiPut("/api/auth/settings", nextSettings);
      const merged = {
        notificationPreferences: {
          ...defaultSettings.notificationPreferences,
          ...(response.data?.notificationPreferences || {}),
        },
        security: {
          twoFactor: {
            ...defaultSettings.security.twoFactor,
            ...(response.data?.security?.twoFactor || {}),
          },
        },
      };
      setSettings(merged);
      syncLocalCache(merged);
      addNotification({
        title: "SETTINGS_SYNCED",
        message: successMessage,
        type: "INFO",
      });
    } catch (error) {
      addNotification({
        title: "SETTINGS_SYNC_FAILED",
        message: error.message || "Unable to save settings.",
        type: "WARN",
      });
    } finally {
      setSavingKey("");
    }
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
    } catch (error) {
      console.error("Audio preview unavailable:", error.message);
    }
  };

  const handleNotificationToggle = async (key) => {
    const current = settings.notificationPreferences[key];
    const nextValue = !current;

    if (key === "desktopNotifications" && nextValue && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        addNotification({
          title: "DESKTOP_UPLINK_BLOCKED",
          message: "Permission denied. Enable browser notifications to arm visual alerts.",
          type: "WARN",
        });
        return;
      }
    }

    if (key === "emailUpdates" && !profile?.email) {
      addNotification({
        title: "NO_EMAIL_ON_FILE",
        message: "Add an email in Profile before enabling mail notifications.",
        type: "WARN",
      });
      return;
    }

    const nextSettings = {
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: nextValue,
      },
    };

    if (key === "soundEffects" && nextValue) {
      playConfirmTone();
    }

    await persistSettings(nextSettings, "Notification settings saved.", key);
  };

  const handleLogout = async () => {
    try {
      await apiGet("/api/auth/logout");
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

  const notificationItems = [
    {
      key: "desktopNotifications",
      title: "Desktop Uplink",
      description: "Visual mission-critical alerts in the browser.",
      icon: <Monitor size={14} />,
    },
    {
      key: "webNotifications",
      title: "On-site Alerts",
      description: "Bell notifications inside the application.",
      icon: <Bell size={14} />,
    },
    {
      key: "emailUpdates",
      title: "Mail Notifications",
      description: profile?.email
        ? "Receive vault and research updates by email."
        : "Add an email in Profile to enable mail notifications.",
      icon: <Mail size={14} />,
      disabled: !profile?.email,
    },
    {
      key: "smsUpdates",
      title: "SMS Relay",
      description: "Reserved for future critical text alerts.",
      icon: <Smartphone size={14} />,
    },
    {
      key: "soundEffects",
      title: "Audio Feedback",
      description: "Play a short confirmation tone inside the console.",
      icon: <Volume2 size={14} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] bg-[linear-gradient(rgba(255,94,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,94,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 text-white selection:bg-[#FF5E00] selection:text-black">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="relative border-l-4 border-[#FF5E00] bg-[#0A0A0A] p-6 shadow-2xl sm:p-8 lg:p-10">
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

          <h1 className="mt-4 text-4xl font-black uppercase italic tracking-tighter sm:text-5xl lg:text-6xl">
            Control <span className="text-[#FF5E00] drop-shadow-[0_0_15px_#FF5E00]">Panel</span>
          </h1>
          <p className="mt-4 font-mono text-xs text-white/40 uppercase tracking-widest">
            Account-level notification control and responsive security status.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative border border-white/10 bg-[#080808]/90 p-5 sm:p-6 lg:p-8">
            <div className="absolute -top-[1px] -left-[1px] h-4 w-4 border-t-2 border-l-2 border-[#FF5E00]" />

            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#FF5E00]" />
                <h2 className="text-[14px] font-black uppercase tracking-[0.3em]">Notifications</h2>
              </div>
            </div>

            <div className="space-y-4">
              {notificationItems.map((item) => (
                <ToggleRow
                  key={item.key}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  enabled={settings.notificationPreferences[item.key]}
                  onToggle={() => handleNotificationToggle(item.key)}
                  disabled={Boolean(item.disabled || savingKey)}
                  busy={savingKey === item.key}
                />
              ))}
            </div>
          </section>

          <section className="relative flex flex-col gap-6 border border-white/10 bg-[#080808]/90 p-5 sm:p-6 lg:p-8">
            <div className="absolute -top-[1px] -right-[1px] h-4 w-4 border-t-2 border-r-2 border-[#FF5E00]" />

            <div className="border-b border-white/5 pb-6">
              <div className="mb-3 flex items-center gap-3">
                <Lock size={18} className="text-[#FF5E00]" />
                <h2 className="text-[14px] font-black uppercase tracking-[0.3em]">Security</h2>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                Signup uses captcha plus email OTP. Login uses password plus captcha verification.
              </p>
            </div>

            <div className="grid gap-3">
              <MethodCard
                title="Signup Protection"
                description="Every new account must solve captcha first and then verify the email OTP."
                active
                disabled
              />
              <MethodCard
                title="Login Protection"
                description="Every login must solve captcha before access is granted."
                active
                disabled
              />
            </div>

            <div className="space-y-4 border-t border-white/5 pt-6">
              <InfoRow icon={<User size={14} />} label="Operator" value={profile?.username || "---"} />
              <InfoRow icon={<Mail size={14} />} label="Uplink_Email" value={profile?.email || "---"} />
              <InfoRow icon={<Shield size={14} />} label="Clearance" value={profile?.role || "LEVEL_0"} />
            </div>

            <div className="mt-auto border-t border-white/5 pt-6">
              <button
                onClick={handleLogout}
                className="group relative w-full overflow-hidden border border-rose-500/40 bg-rose-500/5 py-5 transition-all hover:bg-rose-600 active:scale-[0.98]"
              >
                <div className="relative z-10 flex items-center justify-center gap-4 text-[12px] font-black uppercase tracking-[0.4em] text-rose-500 transition-colors group-hover:text-black">
                  <Power size={16} />
                  Terminate Session
                </div>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-y-full group-hover:animate-[scan_1.5s_infinite]" />
              </button>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

const ToggleRow = ({
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
  icon,
  busy = false,
}) => (
  <div className="group flex items-center justify-between gap-4 border border-white/5 bg-white/[0.02] p-4 sm:p-5 transition-all hover:border-[#FF5E00]/40">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[#FF5E00]/70">{icon}</span>
        <p className="text-[12px] font-black uppercase tracking-widest text-white/90">
          {title}
        </p>
      </div>
      <p className="font-mono text-[10px] text-white/40 uppercase tracking-tighter italic">
        {busy ? "Saving..." : description}
      </p>
    </div>
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative h-5 w-10 border transition-all ${
        enabled ? "border-[#FF5E00] bg-[#FF5E00]/20" : "border-white/10 bg-transparent"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <div
        className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 transition-all duration-300 ${
          enabled ? "left-6 bg-[#FF5E00] shadow-[0_0_8px_#FF5E00]" : "left-1 bg-white/20"
        }`}
      />
    </button>
  </div>
);

const MethodCard = ({ title, description, active, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`border p-4 text-left transition-all ${
      active
        ? "border-[#FF5E00] bg-[#FF5E00]/10"
        : "border-white/10 bg-white/[0.02] hover:border-white/20"
    } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
  >
    <div className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-white">
      {title}
    </div>
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
      {description}
    </p>
  </button>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="group flex items-center justify-between gap-4 border-b border-white/5 bg-transparent px-2 py-4 transition-all hover:bg-white/[0.02]">
    <div className="flex items-center gap-4">
      <span className="text-[#FF5E00]/60 transition-colors group-hover:text-[#FF5E00]">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
        {label}
      </span>
    </div>
    <span className="font-mono text-xs font-bold text-white/70">[{value}]</span>
  </div>
);

export default SettingsPage;
