import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addMeeting } from "../services/api";

const DEMO_DATA = [
  { contact_name: "Sarah Chen", company: "Acme Corp", role: "CTO", meeting_notes: "Interested in SOC2 compliance. Budget 50k. Need proposal Friday. Concerned about security breaches and data privacy." },
  { contact_name: "Michael Torres", company: "CloudSync", role: "VP Engineering", meeting_notes: "Evaluating our platform vs competitors. Worried about integration complexity. Has a team of 40 engineers. Timeline is Q2." },
  { contact_name: "Priya Kapoor", company: "DataForge", role: "CEO", meeting_notes: "Wants to move fast. Budget flexible. Concerned about compliance. Needs executive dashboard. Requested a demo next week." },
];

const WHAT_STORED = [
  { icon: "🏢", text: "Contact & company info" },
  { icon: "⚠️", text: "Concerns & objections" },
  { icon: "💰", text: "Budget discussions" },
  { icon: "🤝", text: "Promises & commitments" },
  { icon: "📅", text: "Follow-up deadlines" },
  { icon: "✅", text: "Meeting outcomes" },
];

export default function AddMeeting() {
  const [form, setForm] = useState({ contact_name: "", company: "", role: "", meeting_notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name || !form.meeting_notes) { setError("Contact name and notes are required."); return; }
    setLoading(true); setError("");
    try { setSuccess(await addMeeting(form)); setForm({ contact_name: "", company: "", role: "", meeting_notes: "" }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{
        background: "linear-gradient(165deg, #0f0520 0%, #1a0845 60%, #0a1520 100%)",
        padding: "56px 20px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 60% at 80% 30%, rgba(124,58,237,0.2) 0%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge badge-purple" style={{ marginBottom: 12 }}>📝 LOG MEETING</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Add Meeting</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Build relationship memory, one note at a time.</div>
        </div>
      </div>

      <div className="section">
        {/* Demo quick-fill */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Quick demo fill
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DEMO_DATA.map((d) => (
              <button
                key={d.contact_name}
                onClick={() => { setForm(d); setSuccess(null); setError(""); }}
                className="btn-secondary"
                style={{ fontSize: 12, padding: "7px 14px" }}
              >
                {d.contact_name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            {/* Contact name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>
                CONTACT NAME *
              </label>
              <input name="contact_name" value={form.contact_name} onChange={handleChange}
                placeholder="e.g. Sarah Chen" className="input" required />
            </div>

            {/* Company + Role row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>COMPANY</label>
                <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" className="input" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>ROLE</label>
                <input name="role" value={form.role} onChange={handleChange} placeholder="CTO" className="input" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>
                MEETING NOTES *
              </label>
              <textarea name="meeting_notes" value={form.meeting_notes} onChange={handleChange}
                placeholder="Describe concerns, budget discussed, promises made, next steps..."
                rows={5} className="input textarea" required />
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
                💡 The more detail, the smarter the memory.
              </div>
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: "12px 16px", borderRadius: 14, marginBottom: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171" }}>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#34d399", marginBottom: 4, fontSize: 14 }}>
                  ✅ Meeting stored successfully!
                </div>
                <div style={{ fontSize: 12, color: "rgba(52,211,153,0.6)" }}>
                  Memory saved · Contact #{success.contact_id} · Meeting #{success.meeting_id}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginBottom: 24 }}>
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }}
                />
                Saving to memory...
              </>
            ) : "💾 Save Meeting"}
          </button>
        </form>

        {/* What gets stored */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>What gets stored?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {WHAT_STORED.map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
