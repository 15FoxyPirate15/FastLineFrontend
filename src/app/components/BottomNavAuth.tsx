import { Home, MessageSquare, Briefcase, User } from "lucide-react";
import { motion } from "motion/react";

interface NavItemProps {
  icon: typeof Home;
  label: string;
  active?: boolean;
}

function NavItem({ icon: Icon, label, active = false }: NavItemProps) {
  return (
    <button className="flex-1 flex flex-col items-center gap-1 py-2 relative">
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#2c3e50] rounded-full"
        />
      )}
      <Icon className={`w-6 h-6 ${active ? 'text-[#2c3e50]' : 'text-gray-400'}`} />
      <span className={`text-xs ${active ? 'text-[#2c3e50]' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}

export function BottomNav() {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 rounded-b-3xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto pb-2">
        <NavItem icon={Home} label="Home" active />
        <NavItem icon={MessageSquare} label="Messages" />
        <NavItem icon={Briefcase} label="Projects" />
        <NavItem icon={User} label="Profile" />
      </div>
    </motion.div>
  );
}
