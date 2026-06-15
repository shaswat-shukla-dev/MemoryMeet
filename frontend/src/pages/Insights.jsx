import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, ArrowRight, MessageSquareText } from "lucide-react";
import { getInsights } from "../services/api";

const SUGGESTED = [
  "What patterns does this contact show?",
  "What are their biggest concerns?",
  "What commitments have I made?",
  "What is their communication style?",
  "What should I prioritize next?",
];

export default function Insights() {
  const [form, setForm]   = useState({ contact_name: "", question: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name.trim() || !form.question.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try { setResult(await getInsights(form)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      {/* Header — mobile only */}
      <div className="hero-header lg:hidden">
        <div className="badge badge-amber" style={{ marginBottom: 12 }}>
          <Sparkles size={12} /> AI INSIGHTS
        </div>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Ask Insights</div>
        <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>Natural language questions about any contact.</div>
      </div>

      <div className="section">
        <div className="grid lg:grid-cols-2 gap-3 lg:gap-6 items-start">

          {/* ── Left: form ── */}
          <div className="flex flex-col gap-4 lg:gap-6">
            <form onSubmit={handleSubmit}>
              <div className="card card-static" style={{ padding: 22 }}>
                <div style={{ marginBottom: 18 }}>
                  <label className="label">CONTACT NAME</label>
                  <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="e.g. Sarah Chen" className="input" required />
                </div>
                <div>
                  <label className="label">YOUR QUESTION</label>
                  <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                    placeholder="e.g. What patterns does Sarah show?" rows={4} className="input textarea" required />
                </div>
              </div>

              <button type="submit" disabled={loading || !form.contact_name.trim() || !form.question.trim()} className="btn-primary" style={{ marginTop: 16 }}>
                {loading ? "Finding patterns..." : (<><Sparkles size={16} /> Get Insights</>)}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: "12px 16px", borderRadius: 14, marginTop: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={15} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Suggested questions */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                Suggested questions
              </div>
              <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-2">
                {SUGGESTED.map((q) => (
                  <button key={q} type="button"
                    onClick={() => setForm({ ...form, question: q })}
                    className="btn-secondary"
                    style={{ textAlign: "left", justifyContent: "flex-start", fontSize: 13, width: "100%" }}>
                    <ArrowRight size={14} style={{ flexShrink: 0 }} /> {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: result ── */}
          <div className="lg-sticky">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.75, delay: i * 0.15 }}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }}
                      />
                    ))}
                    <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Finding patterns…</span>
                  </div>
                  <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 12, width: "100%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 12, width: "75%" }} />
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="card card-static" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Sparkles size={18} color="#fbbf24" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fde68a" }}>AI Analysis</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75 }}>{result.answer}</p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="card empty-state">
                  <div className="empty-state-icon"><MessageSquareText size={26} /></div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
                    Ask a question about any contact and the AI will surface patterns, concerns and next steps from their memory history.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
