import { motion } from "motion/react";
import { Eye, ArrowRight, MoreHorizontal, Shield } from "lucide-react";
import { useState } from "react";

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#13112a" }}>
      <div
        className="w-full max-w-[390px] relative overflow-hidden rounded-[40px] shadow-2xl"
        style={{
          minHeight: "844px",
          background: "linear-gradient(160deg, #1d1b3e 0%, #252356 40%, #1a1836 100%)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* Animated background orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-80px] right-[-60px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[-100px] left-[-80px] w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)" }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-6 pt-16">
          {/* Menu Icon */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-14 left-6 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <MoreHorizontal className="w-6 h-6 text-white/60" />
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-20 mb-8"
          >
            <h1 className="text-white text-4xl font-bold mb-3" style={{ fontFamily: "Inter, sans-serif", lineHeight: "1.2" }}>
              Welcome to<br />FastLine
            </h1>
            <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Create your account and join thousands of<br />teams collaborating seamlessly
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-6"
          >
            {/* Full Name Input */}
            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-5 py-4 rounded-2xl backdrop-blur-md text-white placeholder:text-white/40 outline-none"
                style={{
                  fontFamily: "Inter, sans-serif",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              />
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-5 py-4 rounded-2xl backdrop-blur-md text-white placeholder:text-white/40 outline-none"
                style={{
                  fontFamily: "Inter, sans-serif",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-5 py-4 rounded-2xl backdrop-blur-md text-white placeholder:text-white/40 outline-none"
                style={{
                  fontFamily: "Inter, sans-serif",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                type="button"
              >
                <Eye className="w-5 h-5 text-white/40" />
              </button>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <Shield className="w-4 h-4 text-[#8b5cf6]" />
            <p className="text-white/60 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
              Military-grade encryption • Your data is secure
            </p>
          </motion.div>

          {/* Create Account Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 mb-8 group relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              boxShadow: "0 10px 30px rgba(139,92,246,0.4)",
            }}
            onClick={onLogin}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(135deg, #9d72ff 0%, #7c7fff 100%)",
              }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative text-white font-semibold text-base" style={{ fontFamily: "Inter, sans-serif" }}>
              Create Account
            </span>
            <ArrowRight className="relative w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-auto pb-8"
          >
            <p className="text-white/40 text-sm mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
              Already have an account?
            </p>
            <button
              className="text-[#a78bfa] font-semibold text-base underline underline-offset-4"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
