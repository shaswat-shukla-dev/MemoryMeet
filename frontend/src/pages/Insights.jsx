import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getInsights } from "../services/api";

const SUGGESTED = [
  "What patterns does this contact show?",
  "What are their biggest concerns?",
  "What commitments have I made to them?",
  "What is their communication style?",
  "What should I prioritize for the next meeting?",
];

export default function Insights() {
  const [form, setForm]       = useState({ contact_name: "", question: "" });
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
    <motion.div className="page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(165deg,#0f0520 0%,#1a0845 50%,#0a1020 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 55% at 50% 30%,rgba(245,158,11,0.15) 0%,transparent 100%)" }} />
        <div className="badge badge-amber" style={{ marginBottom: 10 }}>✨ AI INSIGHTS</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 5 }}>Ask Insights</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)" }}>Ask natural language questions about any contact.</div>
      </div>

      <div className="section">
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Contact Name</label>
              <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="e.g. Sarah Chen" className="input" required />
            </div>
            <div>
              <label className="field-label">Your Question</label>
              <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. What patterns does Sarah show in negotiations?" rows={3}
                className="input input-textarea" required />
            </div>
          </div>

          {/* Suggested */}
          <div style={{ marginBottom: 16 }}>
            <div className="field-label" style={{ marginBottom: 9 }}>Suggested questions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {SUGGESTED.map((q) => (
                <button key={q} type="button" onClick={() => setForm({ ...form, question: q })}
                  className="btn-secondary" style={{ textAlign: "left", justifyContent: "flex-start", fontSize: 12 }}>
                  → {q}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !form.contact_name.trim() || !form.question.trim()} className="btn-primary">
            {loading ? (
              <>
                <div className="anim-spin" style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Finding patterns...
              </>
            ) : "✨ Get Insights"}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="alert-error" style={{ marginTop: 14 }}>{error}
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            className="card" style={{ padding: 20, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#c4b5fd" }}>AI Analysis</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.75 }}>{result.answer}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
