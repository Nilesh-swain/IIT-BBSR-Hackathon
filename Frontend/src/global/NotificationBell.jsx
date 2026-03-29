import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext.jsx";

const toneStyles = {
  INFO: "from-cyan-400 to-sky-500",
  SUCCESS: "from-emerald-400 to-green-500",
  WARNING: "from-amber-400 to-orange-500",
  ALERT: "from-rose-400 to-red-500",
};

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="relative p-3 bg-white/[0.03] border border-white/10 group hover:border-[#FF5E00]/50 transition-all"
      >
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF5E00] opacity-20 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-4 min-w-4 px-1 bg-[#FF5E00] text-[8px] font-black items-center justify-center text-black">
              {unreadCount}
            </span>
          </div>
        )}
        <Bell size={18} className="text-white/40 group-hover:text-[#FF5E00] transition-colors" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="absolute right-0 top-full mt-3 w-[420px] max-h-[520px] overflow-hidden border border-white/10 bg-[#08090C]/95 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl z-[400]"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF5E00]">
                  Mission Notifications
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {unreadCount} unread of {notifications.length} total
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => notifications.forEach((notification) => markAsRead(notification.id))}
                  className="p-2 text-white/35 hover:text-white transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="p-2 text-white/35 hover:text-white transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-white/35 hover:text-white transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[440px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-6 py-16 text-center text-[11px] uppercase tracking-[0.3em] text-white/28">
                  No mission alerts stored
                </div>
              ) : (
                <div className="divide-y divide-white/6">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-5 py-4 transition-colors ${
                        notification.read ? "bg-transparent" : "bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`mt-1 h-12 w-1 rounded-full bg-gradient-to-b ${
                            toneStyles[notification.type] || toneStyles.INFO
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/85">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#FFB27A]">
                                {notification.type}
                              </p>
                            </div>
                            <p className="text-[10px] font-mono text-white/28">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-white/62">
                            {notification.message}
                          </p>

                          <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.18em]">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-[#FF5E00] hover:text-white"
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(notification.id)}
                              className="text-white/35 hover:text-white"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
