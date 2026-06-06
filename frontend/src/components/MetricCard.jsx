import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export default function MetricCard({ label, value, icon, color = "primary", delay = 0 }) {
  const count = useCountUp(typeof value === "number" ? value : 0);

  const colorMap = {
    primary: "from-primary-600/20 to-primary-800/5 border-primary-500/20",
    green: "from-emerald-600/20 to-emerald-800/5 border-emerald-500/20",
    blue: "from-blue-600/20 to-blue-800/5 border-blue-500/20",
    purple: "from-violet-600/20 to-violet-800/5 border-violet-500/20",
  };

  const iconColorMap = {
    primary: "bg-primary-500/20 text-primary-400",
    green: "bg-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-violet-500/20 text-violet-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass-card p-6 bg-gradient-to-br ${colorMap[color]} border`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {typeof value === "number" ? count : value}
      </div>
      <div className="text-sm text-white/50 font-medium">{label}</div>
    </motion.div>
  );
}
