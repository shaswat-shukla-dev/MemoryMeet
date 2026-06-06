import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addMeeting } from "../services/api";

const DEMO_DATA = [
  { contact_name: "Sarah Chen", company: "Acme Corp", role: "CTO", meeting_notes: "Interested in SOC2 compliance. Budget 50k. Need proposal Friday. Concerned about security breaches and data privacy." },
  { contact_name: "Michael Torres", company: "CloudSync", role: "VP Engineering", meeting_notes: "Evaluating our platform vs competitors. Worried about integration complexity. Has a team of 40 engineers. Timeline is Q2." },
  { contact_name: "Priya Kapoor", company: "DataForge", role: "CEO", meeting_notes: "Wants to move fast. Budget flexible. Concerned about compliance. Needs executive dashboard. Requested a demo next week." },
];

export default function AddMeeting() {
  const [form, setForm] = useState({ contact_name: "", company: "", role: "", meeting_notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name || !form.meeting_notes) {
      setError("Contact name and meeting notes are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await addMeeting(form);
      setSuccess(res);
      setForm({ contact_name: "", company: "", role: "", meeting_notes: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (data) => {
    setForm(data);
    setSuccess(null);
    setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add Meeting</h1>
        <p className="text-white/40">Log a meeting to build memory for this contact.</p>
      </div>

      {/* Demo quick-fill */}
      <div className="mb-6">
        <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Quick demo fill</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_DATA.map((d) => (
            <button
              key={d.contact_name}
              onClick={() => fillDemo(d)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-primary-500/40 transition-all"
            >
              {d.contact_name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="label">Contact Name *</label>
              <input
                name="contact_name"
                value={form.contact_name}
                onChange={handleChange}
                placeholder="e.g. Sarah Chen"
                className="input-field"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Company</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <input
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. CTO"
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="label">Meeting Notes *</label>
              <textarea
                name="meeting_notes"
                value={form.meeting_notes}
                onChange={handleChange}
                placeholder="Describe what happened: concerns raised, budget discussed, promises made, objections, next steps..."
                rows={6}
                className="input-field resize-none"
                required
              />
              <p className="text-xs text-white/25 mt-1.5">Be specific — the more detail, the smarter the memory.</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Meeting stored successfully!
                </div>
                <div className="text-xs text-emerald-300/60">
                  Memory saved · Contact #{success.contact_id} · Meeting #{success.meeting_id}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving to memory...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Meeting
              </>
            )}
          </button>
        </form>

        {/* Side info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3 text-sm">What gets stored?</h3>
            <ul className="space-y-2">
              {[
                "Contact details & company info",
                "Concerns & objections raised",
                "Budget & pricing discussions",
                "Promises & commitments made",
                "Follow-up items & deadlines",
                "Meeting outcomes",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-5 bg-primary-600/10 border-primary-500/20">
            <div className="text-xs text-primary-300 font-semibold mb-1 uppercase tracking-wider">Hindsight Memory</div>
            <p className="text-xs text-white/40 leading-relaxed">
              Every note is parsed and stored as structured memory. The more meetings you log, the smarter your briefs become.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
