import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrief } from "../services/api";

function HealthMeter({ score }) {
  const color = score >= 80 ? "emerald" : score >= 60 ? "yellow" : "red";
  const colorMap = {
    emerald: { bar: "bg-emerald-500", text: "text-emerald-400", ring: "border-emerald-500/40" },
    yellow: { bar: "bg-yellow-500", text: "text-yellow-400", ring: "border-yellow-500/40" },
    red: { bar: "bg-red-500", text: "text-red-400", ring: "border-red-500/40" },
  };
  const c = colorMap[color];

  return (
    <div className={`glass-card p-5 border ${c.ring}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white/70">Relationship Health</span>
        <span className={`text-3xl font-bold ${c.text}`}>{score}<span className="text-lg">/100</span></span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${c.bar} rounded-full`}
        />
      </div>
      <div className="text-xs text-white/30 mt-2">
        {score >= 80 ? "Strong relationship — momentum is building." :
         score >= 60 ? "Moderate health — some follow-ups may be overdue." :
         "At risk — missed commitments detected."}
      </div>
    </div>
  );
}

function Section({ title, items, icon, color = "primary" }) {
  if (!items || items.length === 0) return null;
  const colorMap = {
    primary: "text-primary-400",
    red: "text-red-400",
    emerald: "text-emerald-400",
    yellow: "text-yellow-400",
  };
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg ${colorMap[color]}`}>{icon}</span>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2 text-sm text-white/60"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color].replace("text-", "bg-")} flex-shrink-0 mt-2`} />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function Brief() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    setBrief(null);
    try {
      const data = await getBrief({ contact_name: name.trim() });
      setBrief(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Meeting Brief</h1>
        <p className="text-white/40">Generate a personalized AI brief powered by recalled memories.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8 max-w-lg">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter contact name..."
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Recalling...
            </>
          ) : "Prepare Me"}
        </button>
      </form>

      {/* Typing indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-5 mb-6 flex items-center gap-3"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-2 h-2 rounded-full bg-primary-500"
                />
              ))}
            </div>
            <span className="text-sm text-white/50">Recalling memories and generating your brief...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {brief && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="glass-card p-6 bg-primary-600/10 border-primary-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold">
                {brief.contact_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{brief.contact_name}</h2>
                <span className="text-xs text-primary-400 font-medium">
                  {brief.previous_meetings.length} meeting{brief.previous_meetings.length !== 1 ? "s" : ""} in memory
                </span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{brief.contact_summary}</p>
          </div>

          {/* Health Score */}
          <HealthMeter score={brief.relationship_health_score} />

          {/* Sections grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Section title="Recurring Concerns" items={brief.recurring_concerns} icon="⚠" color="red" />
            <Section title="Pending Tasks" items={brief.pending_tasks} icon="📋" color="yellow" />
            <Section title="Suggested Talking Points" items={brief.suggested_talking_points} icon="💬" color="primary" />
            <Section title="Recommended Actions" items={brief.recommended_actions} icon="✅" color="emerald" />
          </div>

          {/* Meeting History */}
          {brief.previous_meetings.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-4">Meeting History</h3>
              <div className="space-y-3">
                {brief.previous_meetings.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className="timeline-dot" />
                      {i < brief.previous_meetings.length - 1 && (
                        <div className="w-px flex-1 bg-white/5 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="text-xs text-primary-400 font-medium mb-0.5">{m.date}</div>
                      <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{m.raw_notes}</p>
                      {m.concerns && (
                        <div className="text-xs text-red-400/60 mt-1">Concern: {m.concerns}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
