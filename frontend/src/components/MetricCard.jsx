import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useCountUp(target, duration = 1300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

export default function MetricCard({ label, value, icon, colorClass = "purple", delay = 0 }) {
  const count = useCountUp(typeof value === "number" ? value : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`metric-card ${colorClass}`}
    >
      <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {typeof value === "number" ? count : value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.38)", marginTop: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}
      </div>
    </motion.div>
  );
}
