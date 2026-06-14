import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrief } from "../services/api";

function ScoreRing({ score }) {
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const label = score >= 80 ? "Strong momentum — relationship is thriving."
    : score >= 60 ? "Moderate — some follow-ups may be overdue."
    : "At risk — missed commitments detected.";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0" }}>
      <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
        <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="44" cy="44" r={r}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color }}>{score}</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Relationship Health
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden", width: 160, marginBottom: 8 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ height: "100%", background: color, borderRadius: 100 }}
          />
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{label}</div>
      </div>
    </div>
  );
}

function BriefSection({ title, items, icon, color }) {
  if (!items?.length) return null;
  const colors = {
    purple: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)", text: "#c4b5fd", dot: "#7c3aed" },
    red:    { bg: "rgba(239,68,68,0.06)",  border: "rgba(239,68,68,0.15)",  text: "#fca5a5", dot: "#ef4444" },
    green:  { bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.15)", text: "#6ee7b7", dot: "#10b981" },
    amber:  { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)", text: "#fde68a", dot: "#f59e0b" },
  };
  const c = colors[color] || colors.purple;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 18, padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{title}</span>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 6 }} />
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
    setLoading(true); setError(""); setBrief(null);
    try { setBrief(await getBrief({ contact_name: name.trim() })); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{
        background: "linear-gradient(165deg, #0f0520 0%, #1a0845 60%, #0f1a40 100%)",
        padding: "56px 20px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 55% 60% at 20% 30%, rgba(13,148,136,0.2) 0%, transparent 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge badge-green" style={{ marginBottom: 12 }}>🧠 AI BRIEF</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Meeting Brief</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>AI-powered prep from recalled memories.</div>
        </div>
      </div>

      <div className="section">
        {/* Search bar */}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "rgba(255,255,255,0.3)" }}>🔍</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name..."
              className="input"
              style={{ paddingLeft: 44 }}
            />
          </div>
          <button type="submit" disabled={loading || !name.trim()} className="btn-primary" style={{ width: "auto", padding: "14px 20px", whiteSpace: "nowrap" }}>
            {loading ? "..." : "Prepare Me"}
          </button>
        </form>

        {/* Loading dots */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 20, border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.75, delay: i * 0.15 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" }}
                />
              ))}
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Recalling memories…</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: "12px 16px", borderRadius: 14, marginBottom: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171" }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {brief && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Contact header */}
            <div className="brief-header" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div className="avatar avatar-purple" style={{ width: 52, height: 52, borderRadius: 16, fontSize: 17 }}>
                  {brief.contact_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>{brief.contact_name}</div>
                  <div className="badge badge-purple" style={{ marginTop: 4 }}>
                    {brief.previous_meetings.length} meeting{brief.previous_meetings.length !== 1 ? "s" : ""} in memory
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{brief.contact_summary}</p>
            </div>

            {/* Health score */}
            <div className="card" style={{ padding: "4px 20px", marginBottom: 16 }}>
              <ScoreRing score={brief.relationship_health_score} />
            </div>

            {/* Brief sections */}
            <BriefSection title="Recurring Concerns" items={brief.recurring_concerns} icon="⚠️" color="red" />
            <BriefSection title="Pending Tasks" items={brief.pending_tasks} icon="📋" color="amber" />
            <BriefSection title="Suggested Talking Points" items={brief.suggested_talking_points} icon="💬" color="purple" />
            <BriefSection title="Recommended Actions" items={brief.recommended_actions} icon="✅" color="green" />

            {/* Meeting history */}
            {brief.previous_meetings.length > 0 && (
              <div className="card" style={{ padding: "20px 20px 8px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
                  Meeting History
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {brief.previous_meetings.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{ display: "flex", gap: 16, paddingBottom: 20 }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div className="timeline-dot" />
                        {i < brief.previous_meetings.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: "rgba(124,58,237,0.2)", minHeight: 24, marginTop: 4 }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>{m.date}</div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{m.raw_notes}</p>
                        {m.concerns && (
                          <div style={{ fontSize: 11, color: "rgba(248,113,113,0.7)", marginTop: 4 }}>⚠ {m.concerns}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
