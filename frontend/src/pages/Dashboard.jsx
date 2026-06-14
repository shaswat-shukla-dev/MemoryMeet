import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getStats, getContacts } from "../services/api";

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else { setValue(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function MetricCard({ label, value, icon, colorClass, delay }) {
  const count = useCountUp(typeof value === "number" ? value : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`metric-card ${colorClass}`}
    >
      <div style={{ marginBottom: 14, fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {typeof value === "number" ? count : value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
    </motion.div>
  );
}

const AVATAR_COLORS = ["avatar-purple", "avatar-teal", "avatar-amber", "avatar-blue", "avatar-pink"];

function scoreClass(s) {
  if (s >= 80) return "score-high";
  if (s >= 60) return "score-mid";
  return "score-low";
}

export default function Dashboard() {
  const [stats, setStats]     = useState({ total_contacts: 0, total_meetings: 0, total_memories: 0 });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    Promise.all([getStats(), getContacts()])
      .then(([s, c]) => { setStats(s); setContacts(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const avgHealth = contacts.length > 0
    ? Math.round(contacts.reduce((a, c) => a + (c.health_score ?? 75), 0) / contacts.length)
    : 0;

  return (
    <div className="page">
      {/* ── Hero Header ── */}
      <div className="hero-header">
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🧠</div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>MemoryMeet</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
              position: "relative", cursor: "pointer", color: "white", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              🔔
              <div className="notif-dot" />
            </button>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #c4b5fd, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: "#1e1b4b",
            }}>SJ</div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: 2 }}>
            {greeting} 👋
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Sarah Johnson
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>
            Here's your relationship intelligence dashboard.
          </div>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="section" style={{ paddingTop: 24 }}>
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 14, marginBottom: 20,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            fontSize: 13, color: "#f87171",
          }}>⚠ {error}</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <MetricCard label="Contacts" value={stats.total_contacts} icon="👥" colorClass="purple" delay={0} />
          <MetricCard label="Meetings" value={stats.total_meetings} icon="📅" colorClass="blue" delay={0.06} />
          <MetricCard label="Memories" value={stats.total_memories} icon="💾" colorClass="teal" delay={0.12} />
          <MetricCard label="Avg Health" value={avgHealth} icon="📊" colorClass="amber" delay={0.18} />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="section" style={{ paddingTop: 4 }}>
        <div className="section-header">
          <span className="section-title">Quick Actions</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { to: "/add",      icon: "📝", label: "Add Meeting",   sub: "Log notes",    bg: "linear-gradient(135deg,#7c3aed,#a855f7)" },
            { to: "/brief",    icon: "🧠", label: "Brief",         sub: "Prep with AI", bg: "linear-gradient(135deg,#0d9488,#10b981)" },
            { to: "/insights", icon: "✨", label: "Insights",      sub: "Find patterns",bg: "linear-gradient(135deg,#d97706,#f59e0b)" },
          ].map(({ to, icon, label, sub, bg }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 + i * 0.07, duration: 0.4 }}
            >
              <Link to={to} className="action-card">
                <div className="action-icon" style={{ background: bg }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sub}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── AI Insight ── */}
      <div className="px-safe" style={{ marginBottom: 28 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          className="insight-banner"
        >
          <div className="insight-pill">✦ AI INSIGHT</div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45, marginBottom: 16, position: "relative", zIndex: 1 }}>
            You haven't followed up with{" "}
            <span className="text-gradient-gold">
              {contacts[0]?.name ?? "John Doe"}
            </span>{" "}
            in 2 days. Generate a brief before your next meeting.
          </div>
          <Link to="/brief" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(124,58,237,0.35)", border: "1px solid rgba(139,92,246,0.35)",
            borderRadius: 12, padding: "10px 18px",
            color: "#c4b5fd", fontWeight: 600, fontSize: 14, textDecoration: "none",
            transition: "all 0.2s",
          }}>
            Generate Brief →
          </Link>
        </motion.div>
      </div>

      {/* ── Recent Contacts ── */}
      <div className="section" style={{ paddingTop: 4 }}>
        <div className="section-header">
          <span className="section-title">Recent Contacts</span>
          <Link to="/timeline" className="section-link">View all →</Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="contact-row" style={{ pointerEvents: "none" }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 11, width: "35%" }} />
                </div>
                <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 12 }} />
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{ padding: "40px 24px", textAlign: "center" }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 20 }}>
              No contacts yet. Add your first meeting to get started.
            </div>
            <Link to="/add" style={{
              display: "inline-block", background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              padding: "12px 24px", borderRadius: 12, color: "white",
              fontWeight: 600, fontSize: 14, textDecoration: "none",
            }}>+ Add Meeting</Link>
          </motion.div>
        ) : (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contacts.slice(0, 5).map((c, i) => {
              const score = c.health_score ?? [85, 72, 90, 68, 77][i % 5];
              const timeAgo = ["2 days ago", "5 days ago", "1 week ago", "3 days ago", "yesterday"][i % 5];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                >
                  <Link to="/timeline" style={{ textDecoration: "none" }}>
                    <div className="contact-row">
                      <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          {c.company ?? "—"}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <div className={`score-badge ${scoreClass(score)}`}>{score}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{timeAgo}</div>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>›</div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <Link to="/add">
        <button className="fab" aria-label="Add meeting">+</button>
      </Link>
    </div>
  );
}
