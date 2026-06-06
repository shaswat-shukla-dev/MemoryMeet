import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getInsights } from "../services/api";

const SUGGESTED = [
  "What patterns does this contact show?",
  "What are their biggest concerns?",
  "What commitments have I made?",
  "What is their communication style?",
  "What should I prioritize for the next meeting?",
];

export default function Insights() {
  const [form, setForm] = useState({ contact_name: "", question: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name.trim() || !form.question.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await getInsights(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Insights Panel</h1>
        <p className="text-white/40">Ask natural language questions about any contact's patterns.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="label">Contact Name</label>
              <input
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="e.g. Sarah Chen"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Your Question</label>
              <textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. What patterns does Sarah show?"
                rows={3}
                className="input-field resize-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.contact_name.trim() || !form.question.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing memories...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Extract Insights
              </>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 bg-primary-600/10 border-primary-500/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-primary-300">Insights for {result.contact_name}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{result.insights}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Suggested questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Suggested Questions</h3>
            <div className="space-y-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => setForm({ ...form, question: q })}
                  className="w-full text-left text-xs text-white/50 hover:text-white/80 py-2 px-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-card p-5 bg-violet-600/10 border-violet-500/20">
            <div className="text-xs text-violet-300 font-semibold mb-1 uppercase tracking-wider">Pattern Extraction</div>
            <p className="text-xs text-white/40 leading-relaxed">
              Insights are generated from recalled memories only — no hallucination. The more meetings you log, the richer the patterns.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
