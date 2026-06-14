import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBrief } from "../services/api";

function ScoreRing({ score }) {
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const label = score >= 80
    ? "Strong — relationship is building momentum."
    : score >= 60
    ? "Moderate — some follow-ups may be overdue."
    : "At risk — missed commitments detected.";

  return (
    <div className="card" style={{ padding: "6px 18px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 10 }}>
        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
              strokeLinecap="round" strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color }}>{score}</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.42)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>
            Relationship Health
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden", width: 150, marginBottom: 8 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ height: "100%", background: color, borderRadius: 100 }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function BriefSection({ title, items, icon, variant }) {
  if (!items?.length) return null;
  const map = {
    red:    { color: "#fca5a5", dot: "#ef4444" },
    amber:  { color: "#fde68a", dot: "#f59e0b" },
    purple: { color: "#c4b5fd", dot: "#7c3aed" },
    green:  { color: "#6ee7b7", dot: "#10b981" },
  };
  const c = map[variant] || map.purple;
  return (
    <div className={`brief-section ${variant}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{title}</span>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((item, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 6 }} />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function Brief() {
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief]     = useState(null);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError(""); setBrief(null);
    try { setBrief(await getBrief({ contact_name: name.trim() })); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(165deg,#0f0520 0%,#1a0845 55%,#0f1a40 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 60% at 20% 30%,rgba(13,148,136,0.2) 0%,transparent 100%)" }} />
        <div className="badge badge-green" style={{ marginBottom: 10 }}>🧠 AI BRIEF</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 5 }}>Meeting Brief</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)" }}>AI-powered prep from recalled memories.</div>
      </div>

      <div className="section">
        {/* Search */}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.28)" }}>🔍</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name..." className="input" style={{ paddingLeft: 42 }} />
          </div>
          <button type="submit" disabled={loading || !name.trim()} className="btn-primary"
            style={{ width: "auto", padding: "13px 18px", whiteSpace: "nowrap" }}>
            {loading ? "..." : "Prepare Me"}
          </button>
        </form>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", marginBottom: 16 }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.75, delay: i * 0.15 }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed" }} />
              ))}
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Recalling memories and generating your brief…</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="alert-error" style={{ marginBottom: 16 }}>{error}
            </motion.div>
          )}
        </AnimatePresence>

        {brief && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            {/* Contact card */}
            <div className="brief-header-card">
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 12 }}>
                <div className="avatar avatar-purple" style={{ width: 50, height: 50, borderRadius: 15, fontSize: 16 }}>
                  {brief.contact_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{brief.contact_name}</div>
                  <div className="badge badge-purple" style={{ marginTop: 4 }}>
                    {brief.previous_meetings.length} meeting{brief.previous_meetings.length !== 1 ? "s" : ""} in memory
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.7 }}>{brief.contact_summary}</p>
            </div>

            <ScoreRing score={brief.relationship_health_score} />

            <BriefSection title="Recurring Concerns"       items={brief.recurring_concerns}      icon="⚠️" variant="red"    />
            <BriefSection title="Pending Tasks"            items={brief.pending_tasks}            icon="📋" variant="amber"  />
            <BriefSection title="Suggested Talking Points" items={brief.suggested_talking_points} icon="💬" variant="purple" />
            <BriefSection title="Recommended Actions"      items={brief.recommended_actions}      icon="✅" variant="green"  />

            {brief.previous_meetings.length > 0 && (
              <div className="card" style={{ padding: "18px 18px 6px", marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
                  Meeting History
                </div>
                {brief.previous_meetings.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    style={{ display: "flex", gap: 14, paddingBottom: 18 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div className="timeline-dot" />
                      {i < brief.previous_meetings.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: "rgba(124,58,237,0.18)", minHeight: 22, marginTop: 4 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: 2 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>{m.date}</div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{m.raw_notes}</p>
                      {m.concerns && <div style={{ fontSize: 11, color: "rgba(248,113,113,0.65)", marginTop: 4 }}>⚠ {m.concerns}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
