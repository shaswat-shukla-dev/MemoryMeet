import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Search, AlertTriangle, ClipboardList, MessageCircle, CheckCircle2,
  Sparkles, Calendar,
} from "lucide-react";
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
    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", flexWrap: "wrap" }}>
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
          <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'Sora', sans-serif" }}>{score}</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Relationship Health
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden", maxWidth: 220, marginBottom: 8 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ height: "100%", background: color, borderRadius: 100 }}
          />
        </div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5 }}>{label}</div>
      </div>
    </div>
  );
}

function BriefSection({ title, items, icon: Icon, color }) {
  if (!items?.length) return null;
  const colors = {
    purple: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)", text: "#c4b5fd", dot: "#7c3aed" },
    red:    { bg: "rgba(239,68,68,0.06)",  border: "rgba(239,68,68,0.15)",  text: "#fca5a5", dot: "#ef4444" },
    green:  { bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.15)", text: "#6ee7b7", dot: "#10b981" },
    amber:  { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)", text: "#fde68a", dot: "#f59e0b" },
  };
  const c = colors[color] || colors.purple;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 18, padding: 18, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon size={17} color={c.text} />
        <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{title}</span>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}
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
  const [searchParams] = useSearchParams();
  const [name, setName] = useState(searchParams.get("contact") || "");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [error, setError] = useState("");
  const autoRan = useRef(false);

  const runBrief = async (contactName) => {
    if (!contactName.trim()) return;
    setLoading(true); setError(""); setBrief(null);
    try { setBrief(await getBrief({ contact_name: contactName.trim() })); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runBrief(name);
  };

  useEffect(() => {
    const prefill = searchParams.get("contact");
    if (prefill && !autoRan.current) {
      autoRan.current = true;
      setName(prefill);
      runBrief(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      {/* Header — mobile only */}
      <div className="hero-header lg:hidden">
        <div className="badge badge-green" style={{ marginBottom: 12 }}>
          <Brain size={12} /> AI BRIEF
        </div>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Meeting Brief</div>
        <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>AI-powered prep from recalled memories.</div>
      </div>

      <div className="section">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2.5 lg:gap-3" style={{ marginBottom: 24 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <span className="search-icon"><Search size={17} /></span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name..."
              className="input"
            />
          </div>
          <button type="submit" disabled={loading || !name.trim()} className="btn-primary" style={{ width: "auto", padding: "14px 22px", whiteSpace: "nowrap" }}>
            {loading ? "..." : "Prepare Me"}
          </button>
        </form>

        {/* Loading dots */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "var(--surface)", borderRadius: 14, marginBottom: 20, border: "1px solid var(--border-subtle)" }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.75, delay: i * 0.15 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" }}
                />
              ))}
              <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Recalling memories…</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: "12px 16px", borderRadius: 14, marginBottom: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={15} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {!brief && !loading && !error && (
          <div className="card empty-state">
            <div className="empty-state-icon"><Brain size={26} /></div>
            <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
              Enter a contact's name to generate an AI-powered meeting brief from their memory history.
            </div>
          </div>
        )}

        {brief && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid lg:grid-cols-3 gap-3 lg:gap-6 items-start">

              {/* ── Left: contact header + health (sticky on desktop) ── */}
              <div className="lg:col-span-1 lg-sticky flex flex-col gap-3 lg:gap-4">
                <div className="brief-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div className="avatar avatar-purple" style={{ width: 52, height: 52, borderRadius: 16, fontSize: 17 }}>
                      {brief.contact_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-display" style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>{brief.contact_name}</div>
                      <div className="badge badge-purple" style={{ marginTop: 4 }}>
                        {brief.previous_meetings.length} meeting{brief.previous_meetings.length !== 1 ? "s" : ""} in memory
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{brief.contact_summary}</p>
                </div>

                <div className="card card-static" style={{ padding: "4px 20px" }}>
                  <ScoreRing score={brief.relationship_health_score} />
                </div>
              </div>

              {/* ── Right: brief sections + history ── */}
              <div className="lg:col-span-2 flex flex-col gap-3 lg:gap-4">
                <div className="grid lg:grid-cols-2 gap-3 lg:gap-4">
                  <BriefSection title="Recurring Concerns" items={brief.recurring_concerns} icon={AlertTriangle} color="red" />
                  <BriefSection title="Pending Tasks" items={brief.pending_tasks} icon={ClipboardList} color="amber" />
                  <BriefSection title="Suggested Talking Points" items={brief.suggested_talking_points} icon={MessageCircle} color="purple" />
                  <BriefSection title="Recommended Actions" items={brief.recommended_actions} icon={CheckCircle2} color="green" />
                </div>

                {/* Meeting history */}
                {brief.previous_meetings.length > 0 && (
                  <div className="card card-static" style={{ padding: "20px 20px 8px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={14} /> Meeting History
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
                            <p style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.6 }}>{m.raw_notes}</p>
                            {m.concerns && (
                              <div style={{ fontSize: 11, color: "rgba(248,113,113,0.7)", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                                <AlertTriangle size={11} /> {m.concerns}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
