import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getStats, getContacts } from "../services/api";
import MetricCard from "../components/MetricCard";

const AVATAR_COLORS = ["avatar-purple", "avatar-teal", "avatar-amber", "avatar-blue", "avatar-pink"];
const SCORE_CLASS = (s) => s >= 80 ? "score-high" : s >= 60 ? "score-mid" : "score-low";
const TIME_AGO = ["2 days ago", "5 days ago", "1 week ago", "3 days ago", "yesterday", "today"];

export default function Dashboard() {
  const [stats, setStats]       = useState({ total_contacts: 0, total_meetings: 0, total_memories: 0 });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

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

      {/* ── Hero Header ─────────────────────── */}
      <div className="hero-header">
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#f97316,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              🧠
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>MemoryMeet</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, cursor: "pointer" }}>
                🔔
              </div>
              <div className="notif-dot" />
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#c4b5fd,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#1e1b4b" }}>
              SJ
            </div>
          </div>
        </div>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500, marginBottom: 2 }}>
            {greeting} {greetEmoji}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            Sarah Johnson
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 5 }}>
            Here's your relationship intelligence dashboard.
          </div>
        </motion.div>
      </div>

      {/* ── Error ─────────────────────────── */}
      {error && (
        <div className="px20" style={{ paddingTop: 16 }}>
          <div className="alert-error">⚠ {error}</div>
        </div>
      )}

      {/* ── Metrics ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "20px 20px 8px" }}>
        <MetricCard label="Total Contacts" value={stats.total_contacts}  icon="👥" colorClass="purple" delay={0}    />
        <MetricCard label="Total Meetings" value={stats.total_meetings}  icon="📅" colorClass="blue"   delay={0.07} />
        <MetricCard label="Memories"       value={stats.total_memories}  icon="💾" colorClass="teal"   delay={0.14} />
        <MetricCard label="Avg Health"     value={avgHealth}             icon="📊" colorClass="amber"  delay={0.21} />
      </div>

      {/* ── Quick Actions ──────────────────── */}
      <div className="section" style={{ paddingTop: 8 }}>
        <div className="section-header">
          <span className="section-title">Quick Actions</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { to: "/add",      emoji: "📝", label: "Add Meeting", sub: "Log notes",   bg: "linear-gradient(135deg,#7c3aed,#a855f7)" },
            { to: "/brief",    emoji: "🧠", label: "Brief",       sub: "Prep with AI",bg: "linear-gradient(135deg,#0d9488,#10b981)" },
            { to: "/insights", emoji: "✨", label: "Insights",    sub: "Find patterns",bg:"linear-gradient(135deg,#d97706,#f59e0b)" },
          ].map(({ to, emoji, label, sub, bg }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + i * 0.07 }}>
              <Link to={to} className="action-card">
                <div className="action-icon" style={{ background: bg }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#fff", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>{sub}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── AI Insight ─────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
        <div className="insight-banner">
          <div className="insight-pill">✦ AI INSIGHT</div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, marginBottom: 14 }}>
            You haven't followed up with{" "}
            <span className="text-gradient-gold">{contacts[0]?.name ?? "John Doe"}</span>
            {" "}in 2 days. Generate a brief before your next meeting.
          </div>
          <Link to="/brief" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(124,58,237,0.3)", border: "1px solid rgba(139,92,246,0.32)",
            borderRadius: 12, padding: "9px 16px",
            color: "#c4b5fd", fontWeight: 700, fontSize: 13, textDecoration: "none",
          }}>
            Generate Brief →
          </Link>
        </div>
      </motion.div>

      {/* ── Recent Contacts ────────────────── */}
      <div className="section" style={{ paddingTop: 4 }}>
        <div className="section-header">
          <span className="section-title">Recent Contacts</span>
          <Link to="/timeline" className="section-link">View all →</Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="contact-row" style={{ pointerEvents: "none" }}>
                <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 13, width: "52%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 10, width: "32%" }} />
                </div>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card" style={{ padding: "38px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              No contacts yet. Add your first meeting to get started.
            </div>
            <Link to="/add" style={{
              display: "inline-block", background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              padding: "11px 22px", borderRadius: 12, color: "white",
              fontWeight: 700, fontSize: 13, textDecoration: "none",
            }}>
              + Add Meeting
            </Link>
          </motion.div>
        ) : (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contacts.slice(0, 6).map((c, i) => {
              const score = c.health_score ?? [85, 72, 90, 68, 77, 82][i % 6];
              return (
                <Link key={c.id} to="/timeline" style={{ textDecoration: "none" }}>
                  <div className="contact-row">
                    <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                        {c.company ?? "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
                      <div className={`score-badge ${SCORE_CLASS(score)}`}>{score}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)" }}>{TIME_AGO[i % TIME_AGO.length]}</div>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, marginLeft: 4 }}>›</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link to="/add" className="fab" aria-label="Add meeting">+</Link>
    </div>
  );
}
