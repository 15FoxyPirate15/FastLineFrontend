import React from "react";
import { motion } from "motion/react";

interface FastLineLogoProps {
  size?: number;
}

export function FastLineLogo({ size = 64 }: FastLineLogoProps) {
  const dotSize = Math.max(4, Math.round(size * 0.16));
  const gap = Math.max(2, Math.round(size * 0.07));

  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(93,90,138,0.25) 100%)",
        border: "1px solid rgba(139,92,246,0.30)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center" style={{ gap }}>
        {[0, 0.25, 0.5].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.9, 0.5, 0.9] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay }}
            className="rounded-full bg-white"
            style={{ width: dotSize, height: dotSize }}
          />
        ))}
      </div>
    </div>
  );
}
