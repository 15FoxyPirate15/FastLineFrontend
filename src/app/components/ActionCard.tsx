import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  detail?: string;
  progress?: number;
  delay?: number;
}

export function ActionCard({ icon: Icon, title, subtitle, detail, progress, delay = 0 }: ActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[#2c3e50] rounded-2xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl">
        <Icon className="w-5 h-5 text-white" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white">{title}</h3>
        <p className="text-white/60 text-sm">{subtitle}</p>
        {detail && (
          <p className="text-white/40 text-xs mt-1">{detail}</p>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-auto">
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
              className="h-full bg-white/80 rounded-full"
            />
          </div>
          <p className="text-white/40 text-xs mt-1.5">{progress}% Complete</p>
        </div>
      )}
    </motion.div>
  );
}
