import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, Database, Activity, Bell, NotebookPen, Brain,
  Sparkles, ChevronRight, ArrowUpRight, AlertTriangle, ShieldCheck,
} from "lucide-react";
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

function MetricCard({ label, value, icon: Icon, colorClass, delay }) {
  const count = useCountUp(typeof value === "number" ? value : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`metric-card ${colorClass}`}
    >
      <div className={`metric-icon ${colorClass}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
        {typeof value === "number" ? count : value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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

  const healthBuckets = useMemo(() => {
    const healthy = contacts.filter((c) => (c.health_score ?? 75) >= 80).length;
    const atRisk = contacts.filter((c) => (c.health_score ?? 75) < 60).length;
    const moderate = contacts.length - healthy - atRisk;
    return { healthy, moderate, atRisk, total: contacts.length || 1 };
  }, [contacts]);

  const needsAttention = useMemo(() => {
    return [...contacts]
      .map((c, i) => ({ ...c, _score: c.health_score ?? [85, 72, 90, 68, 77][i % 5] }))
      .sort((a, b) => a._score - b._score)
      .slice(0, 3);
  }, [contacts]);

  return (
    <div className="page">
      {/* ── Hero Header ── */}
      <div className="hero-header">
        {/* Top bar — mobile only, desktop has Topbar + Sidebar */}
        <div className="lg:hidden" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "var(--grad-warm)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Brain size={19} color="white" strokeWidth={2.2} />
            </div>
            <span className="font-display" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>MemoryMeet</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="icon-btn" aria-label="Notifications" style={{ width: 40, height: 40 }}>
              <Bell size={18} />
              <div className="notif-dot" />
            </button>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #c4b5fd, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: "#1e1b4b", fontFamily: "'Sora', sans-serif",
            }}>SJ</div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>
            {greeting} 👋
          </div>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Welcome back, <span className="text-gradient">Sarah</span>
          </div>
          <div style={{ fontSize: 14, color: "var(--text-tertiary)", marginTop: 6, maxWidth: 460 }}>
            Here's your relationship intelligence dashboard — everything you've remembered, organized for what's next.
          </div>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="section" style={{ paddingTop: 24 }}>
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 14, marginBottom: 20,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8,
          }}><AlertTriangle size={15} /> {error}</div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <MetricCard label="Contacts" value={stats.total_contacts} icon={Users} colorClass="purple" delay={0} />
          <MetricCard label="Meetings" value={stats.total_meetings} icon={CalendarDays} colorClass="blue" delay={0.06} />
          <MetricCard label="Memories" value={stats.total_memories} icon={Database} colorClass="teal" delay={0.12} />
          <MetricCard label="Avg Health" value={avgHealth} icon={Activity} colorClass="amber" delay={0.18} />
        </div>
      </div>

      {/* ── Main responsive grid ── */}
      <div className="px-safe lg:px-0">
        <div className="grid lg:grid-cols-3 gap-3 lg:gap-6">

          {/* ── Left / main column ── */}
          <div className="lg:col-span-2 flex flex-col gap-3 lg:gap-6">

            {/* Quick Actions */}
            <div>
              <div className="section-header">
                <span className="section-title">Quick Actions</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 lg:gap-4">
                {[
                  { to: "/add",      icon: NotebookPen, label: "Add Meeting",   sub: "Log notes",     bg: "linear-gradient(135deg,#7c3aed,#a855f7)" },
                  { to: "/brief",    icon: Brain,        label: "Brief",         sub: "Prep with AI",  bg: "linear-gradient(135deg,#0d9488,#10b981)" },
                  { to: "/insights", icon: Sparkles,     label: "Insights",      sub: "Find patterns", bg: "linear-gradient(135deg,#d97706,#f59e0b)" },
                ].map(({ to, icon: Icon, label, sub, bg }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 + i * 0.07, duration: 0.4 }}
                  >
                    <Link to={to} className="action-card">
                      <div className="action-icon" style={{ background: bg }}>
                        <Icon size={22} color="white" strokeWidth={2.2} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{sub}</div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Contacts */}
            <div>
              <div className="section-header">
                <span className="section-title">Recent Contacts</span>
                <Link to="/timeline" className="section-link">View all <ChevronRight size={14} /></Link>
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
                  className="card empty-state"
                >
                  <div className="empty-state-icon">
                    <Users size={26} />
                  </div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: 14, marginBottom: 20 }}>
                    No contacts yet. Add your first meeting to get started.
                  </div>
                  <Link to="/add" className="btn-primary" style={{ width: "auto", display: "inline-flex", padding: "12px 24px" }}>
                    <NotebookPen size={16} /> Add Meeting
                  </Link>
                </motion.div>
              ) : (
                <div className="stagger grid lg:grid-cols-2 gap-2.5 lg:gap-3">
                  {contacts.slice(0, 6).map((c, i) => {
                    const score = c.health_score ?? [85, 72, 90, 68, 77][i % 5];
                    const timeAgo = ["2 days ago", "5 days ago", "1 week ago", "3 days ago", "yesterday"][i % 5];
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                      >
                        <Link to={`/timeline?contact=${encodeURIComponent(c.name)}`} style={{ textDecoration: "none" }}>
                          <div className="contact-row">
                            <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {c.name}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                {c.company ?? "—"}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              <div className={`score-badge ${scoreClass(score)}`}>{score}</div>
                              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{timeAgo}</div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right / side column ── */}
          <div className="flex flex-col gap-3 lg:gap-6">

            {/* AI Insight */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
              className="insight-banner"
            >
              <div className="insight-pill"><Sparkles size={12} /> AI INSIGHT</div>
              <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45, marginBottom: 16, position: "relative", zIndex: 1 }}>
                You haven't followed up with{" "}
                <span className="text-gradient-gold">
                  {contacts[0]?.name ?? "John Doe"}
                </span>{" "}
                in 2 days. Generate a brief before your next meeting.
              </div>
              <Link to={`/brief?contact=${encodeURIComponent(contacts[0]?.name ?? "John Doe")}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(124,58,237,0.35)", border: "1px solid rgba(139,92,246,0.35)",
                borderRadius: 12, padding: "10px 18px",
                color: "#c4b5fd", fontWeight: 600, fontSize: 14, textDecoration: "none",
                transition: "all 0.2s", position: "relative", zIndex: 1,
              }}>
                Generate Brief <ArrowUpRight size={15} />
              </Link>
            </motion.div>

            {/* Relationship Health Overview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.45 }}
              className="card"
              style={{ padding: 20 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Activity size={16} color="#a78bfa" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Relationship Health</span>
              </div>

              <div style={{ display: "flex", height: 10, borderRadius: 100, overflow: "hidden", marginBottom: 16, background: "rgba(255,255,255,0.06)" }}>
                {healthBuckets.healthy > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(healthBuckets.healthy / healthBuckets.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                    style={{ background: "var(--grad-success)" }}
                  />
                )}
                {healthBuckets.moderate > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(healthBuckets.moderate / healthBuckets.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
                    style={{ background: "var(--grad-gold)" }}
                  />
                )}
                {healthBuckets.atRisk > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(healthBuckets.atRisk / healthBuckets.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
                    style={{ background: "linear-gradient(90deg, #ef4444, #f87171)" }}
                  />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Thriving", count: healthBuckets.healthy, dot: "#34d399" },
                  { label: "Needs follow-up", count: healthBuckets.moderate, dot: "#fbbf24" },
                  { label: "At risk", count: healthBuckets.atRisk, dot: "#f87171" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.dot, display: "inline-block" }} />
                      {row.label}
                    </div>
                    <span style={{ fontWeight: 700, color: "#fff", fontFamily: "'Sora', sans-serif" }}>{row.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Needs Attention */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.45 }}
              className="card"
              style={{ padding: 20 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <ShieldCheck size={16} color="#fbbf24" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Needs Attention</span>
              </div>

              {needsAttention.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text-faint)" }}>Nothing needs attention right now.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {needsAttention.map((c, i) => (
                    <Link key={c.id} to={`/brief?contact=${encodeURIComponent(c.name)}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, transition: "background 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`} style={{ width: 36, height: 36, fontSize: 12, borderRadius: 11 }}>
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{c.company ?? "—"}</div>
                        </div>
                        <div className={`score-badge ${scoreClass(c._score)}`} style={{ width: 38, height: 38, fontSize: 13 }}>{c._score}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
