/* Insights.jsx */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <div style={{
        background: "linear-gradient(165deg, #0f0520 0%, #1a0845 50%, #0a1020 100%)",
        padding: "56px 20px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 55% at 50% 30%, rgba(245,158,11,0.15) 0%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge badge-amber" style={{ marginBottom: 12 }}>✨ AI INSIGHTS</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Ask Insights</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Natural language questions about any contact.</div>
        </div>
      </div>

      <div className="section">
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>CONTACT NAME</label>
              <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="e.g. Sarah Chen" className="input" required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>YOUR QUESTION</label>
              <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. What patterns does Sarah show?" rows={3} className="input textarea" required />
            </div>
          </div>

          {/* Suggested questions */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Suggested questions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTED.map((q) => (
                <button key={q} type="button"
                  onClick={() => setForm({ ...form, question: q })}
                  className="btn-secondary"
                  style={{ textAlign: "left", justifyContent: "flex-start", fontSize: 13 }}>
                  → {q}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !form.contact_name.trim() || !form.question.trim()} className="btn-primary">
            {loading ? "Finding patterns..." : "✨ Get Insights"}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: "12px 16px", borderRadius: 14, marginTop: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171" }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="card" style={{ padding: 24, marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>✨</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#c4b5fd" }}>AI Analysis</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>{result.answer}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
