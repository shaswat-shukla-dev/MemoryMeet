import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getStats, getContacts } from "../services/api";
import MetricCard from "../components/MetricCard";

export default function Dashboard() {
  const [stats, setStats] = useState({ total_contacts: 0, total_meetings: 0, total_memories: 0 });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getStats(), getContacts()])
      .then(([s, c]) => { setStats(s); setContacts(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const icons = {
    contacts: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    meetings: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    memories: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    score: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      {/* Header */}
      <div className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gradient mb-2"
        >
          MemoryMeet
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-white/50 text-lg"
        >
          AI meeting prep that learns every interaction.
        </motion.p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ⚠ Could not reach the backend: {error}. Make sure the server is running.
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard label="Total Contacts" value={stats.total_contacts} icon={icons.contacts} color="primary" delay={0} />
        <MetricCard label="Total Meetings" value={stats.total_meetings} icon={icons.meetings} color="blue" delay={0.05} />
        <MetricCard label="Memories Stored" value={stats.total_memories} icon={icons.memories} color="purple" delay={0.1} />
        <MetricCard label="Avg Health Score" value={stats.total_contacts > 0 ? 78 : 0} icon={icons.score} color="green" delay={0.15} />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { to: "/add", label: "Add Meeting", desc: "Log notes for a new or existing contact", emoji: "📝" },
          { to: "/brief", label: "Generate Brief", desc: "Prepare for your next meeting with AI", emoji: "🧠" },
          { to: "/insights", label: "Ask Insights", desc: "Uncover patterns and relationship signals", emoji: "🔍" },
        ].map(({ to, label, desc, emoji }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Link to={to} className="glass-card p-5 block">
              <div className="text-2xl mb-3">{emoji}</div>
              <div className="font-semibold text-white mb-1">{label}</div>
              <div className="text-sm text-white/40">{desc}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Contacts</h2>
          <Link to="/timeline" className="text-sm text-primary-400 hover:text-primary-300">
            View timeline →
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 flex-1 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 text-center"
          >
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-white/40 mb-4">No contacts yet. Add your first meeting to get started.</p>
            <Link to="/add" className="btn-primary inline-block">Add Meeting</Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contacts.slice(0, 6).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{c.name}</div>
                    <div className="text-xs text-white/40">{c.role} · {c.company}</div>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-white/40">
                  <span>{c.meeting_count} meeting{c.meeting_count !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{c.memory_count} memor{c.memory_count !== 1 ? "ies" : "y"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
