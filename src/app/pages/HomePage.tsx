import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ListTodo, Calendar, Phone, Bookmark,
  Home, MessageSquare, Users, Settings,
  Search, Plus, Hash, UserCircle, Bell, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { FastLineLogo } from "../components/FastLineLogo";

type Screen = "home" | "messages" | "contacts" | "settings";

const BG = "linear-gradient(160deg, #1d1b3e 0%, #252356 40%, #1a1836 100%)";

const NAV_ITEMS: { id: Screen; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "messages", icon: MessageSquare, label: "Messages" },
  { id: "contacts", icon: Users, label: "Contacts" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const GROUPS = [
  { id: 1, name: "Design Team", lastMsg: "New mockups uploaded", time: "10:30", unread: 3 },
  { id: 2, name: "Dev Sprint #4", lastMsg: "PR reviewed and merged", time: "09:15", unread: 0 },
];

const MESSAGES = [
  { id: 1, name: "nayom53470", lastMsg: "No messages yet", time: "10:28", initials: "N", color: "#5d5a8a" },
  { id: 2, name: "alex_dev", lastMsg: "Can we sync tomorrow?", time: "08:50", initials: "A", color: "#3b82f6" },
];

const QUICK_CARDS = [
  { label: "Tasks", sub: "12 pending", icon: ListTodo, accent: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  { label: "Calendar", sub: "3 events today", icon: Calendar, accent: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  { label: "Calls", sub: "Next: 14:00", icon: Phone, accent: "#10b981", bg: "rgba(16,185,129,0.15)" },
  { label: "Saved", sub: "7 meetings", icon: Bookmark, accent: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{
        background: "rgba(255,255,255,0.055)",
        borderColor: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
      }}
    >
      {children}
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-14 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FastLineLogo size={40} />
          <div>
            <p className="text-white/40 text-xs font-medium tracking-wide uppercase" style={{ fontFamily: "Inter, sans-serif" }}>Workspace</p>
            <h1 className="text-white text-lg font-semibold leading-tight" style={{ fontFamily: "Inter, sans-serif" }}>FastLine</h1>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          <Bell className="w-5 h-5 text-white/60" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8b5cf6] rounded-full" />
        </motion.button>
      </div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-6 mt-5 p-5 rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(59,130,246,0.15) 100%)",
          border: "1px solid rgba(139,92,246,0.30)",
        }}
      >
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
        <p className="text-white/50 text-xs font-medium mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Good morning</p>
        <h2 className="text-white text-xl font-semibold mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Welcome back!</h2>
        <p className="text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>You have 3 tasks due today</p>
      </motion.div>

      {/* Quick Access */}
      <div className="px-6 mt-6">
        <p className="text-white/35 text-xs uppercase tracking-widest font-semibold mb-3" style={{ fontFamily: "Inter, sans-serif" }}>Quick Access</p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_CARDS.map((card, i) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative text-left p-4 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
              <p className="text-white text-sm font-semibold leading-tight" style={{ fontFamily: "Inter, sans-serif" }}>{card.label}</p>
              <p className="text-white/35 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{card.sub}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/35 text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>Recent Activity</p>
          <button className="text-[#8d8ab8] text-xs font-medium" style={{ fontFamily: "Inter, sans-serif" }}>See all</button>
        </div>
        {[
          { label: "Design review completed", time: "2h ago", dot: "#10b981" },
          { label: "Sprint planning scheduled", time: "4h ago", dot: "#3b82f6" },
          { label: "New file shared", time: "Yesterday", dot: "#f59e0b" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : undefined }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.dot }} />
            <p className="text-white/70 text-sm flex-1" style={{ fontFamily: "Inter, sans-serif" }}>{item.label}</p>
            <p className="text-white/25 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{item.time}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MessagesScreen() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>Messages</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <UserCircle className="w-5 h-5 text-white/60" />
          </motion.button>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto pb-6">
        {/* Active Projects */}
        <Section label="Active Projects" icon={ListTodo} />
        <div
          className="mb-5 p-4 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.08)" }}
        >
          <p className="text-white/25 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>No active projects</p>
        </div>

        {/* Groups */}
        <Section label="Groups" icon={Users} action={<Plus className="w-4 h-4 text-[#8d8ab8]" />} />
        <div className="space-y-2 mb-5">
          {GROUPS.map((g, i) => (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
              style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(93,90,138,0.35)" }}
              >
                <Hash className="w-5 h-5 text-[#8d8ab8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: "Inter, sans-serif" }}>{g.name}</p>
                <p className="text-white/35 text-xs truncate mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{g.lastMsg}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-white/25 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{g.time}</span>
                {g.unread > 0 && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: "#8b5cf6", fontFamily: "Inter, sans-serif" }}
                  >
                    {g.unread}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Direct Messages */}
        <Section label="Messages" icon={MessageSquare} />
        <div className="space-y-2">
          {MESSAGES.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
              style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                style={{ background: m.color, fontFamily: "Inter, sans-serif" }}
              >
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: "Inter, sans-serif" }}>{m.name}</p>
                <p className="text-white/35 text-xs truncate mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{m.lastMsg}</p>
              </div>
              <span className="text-white/25 text-xs flex-shrink-0" style={{ fontFamily: "Inter, sans-serif" }}>{m.time}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ label, icon: Icon, action }: { label: string; icon: typeof Home; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-white/30" />
        <span className="text-white/30 text-[11px] uppercase tracking-widest font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
      </div>
      {action && <button className="p-1 rounded-lg hover:bg-white/5 transition-colors">{action}</button>}
    </div>
  );
}

function ContactsScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-14 pb-4">
        <h1 className="text-white text-2xl font-bold mb-5" style={{ fontFamily: "Inter, sans-serif" }}>Contacts</h1>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            placeholder="Search contacts..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
      </div>
      <div className="px-6 space-y-2 pb-6">
        {[
          { name: "alex_dev", role: "Developer", color: "#3b82f6", initials: "A" },
          { name: "nayom53470", role: "Designer", color: "#5d5a8a", initials: "N" },
          { name: "maria_pm", role: "Product Manager", color: "#10b981", initials: "M" },
          { name: "john_lead", role: "Team Lead", color: "#f59e0b", initials: "J" },
        ].map((c, i) => (
          <motion.button
            key={c.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
            style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
              style={{ background: c.color, fontFamily: "Inter, sans-serif" }}
            >
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>{c.name}</p>
              <p className="text-white/35 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{c.role}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-white text-2xl font-bold mb-6" style={{ fontFamily: "Inter, sans-serif" }}>Settings</h1>
        <div className="flex items-center gap-4 p-4 rounded-2xl mb-6" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)" }}>
          <div className="w-14 h-14 rounded-full bg-[#5d5a8a] flex items-center justify-center text-white font-bold text-lg" style={{ fontFamily: "Inter, sans-serif" }}>U</div>
          <div>
            <p className="text-white font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>user_profile</p>
            <p className="text-white/40 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>user@fastline.app</p>
          </div>
        </div>
        {[
          ["Account", ["Profile", "Password", "Two-Factor Auth"]],
          ["Preferences", ["Notifications", "Theme", "Language"]],
          ["About", ["Privacy Policy", "Terms of Service", "Version 2.1.0"]],
        ].map(([section, items]) => (
          <div key={section as string} className="mb-5">
            <p className="text-white/30 text-[11px] uppercase tracking-widest font-semibold mb-2 px-1" style={{ fontFamily: "Inter, sans-serif" }}>{section as string}</p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {(items as string[]).map((item, i) => (
                <button
                  key={item}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: i < (items as string[]).length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span className="text-white/70 text-sm">{item}</span>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("home");

  const screens: Record<Screen, React.ReactNode> = {
    home: <HomeScreen />,
    messages: <MessagesScreen />,
    contacts: <ContactsScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#13112a" }}>
      <div
        className="w-full max-w-[390px] relative overflow-hidden rounded-[40px] shadow-2xl"
        style={{
          minHeight: "844px",
          maxHeight: "844px",
          background: BG,
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* Background orbs */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(93,90,138,0.45) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[100px] left-[-80px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)" }}
        />

        {/* Screen Content */}
        <div className="relative flex flex-col" style={{ height: "844px" }}>
          <div className="flex-1 overflow-hidden" style={{ paddingBottom: "76px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="h-full overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {screens[screen]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <div
            className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-3"
            style={{
              background: "rgba(18,16,40,0.85)",
              backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center justify-around">
              {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
                const active = screen === id;
                return (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setScreen(id)}
                    className="flex flex-col items-center gap-1 px-3 py-1 relative"
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                        style={{ background: "#8b5cf6" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      className="w-5 h-5 transition-colors duration-200"
                      style={{ color: active ? "#a78bfa" : "rgba(255,255,255,0.30)" }}
                    />
                    <span
                      className="text-[11px] font-medium transition-colors duration-200"
                      style={{
                        color: active ? "#a78bfa" : "rgba(255,255,255,0.30)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
