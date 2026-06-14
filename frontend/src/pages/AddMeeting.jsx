import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addMeeting } from "../services/api";

const DEMO_DATA = [
  { contact_name: "Sarah Chen",    company: "Acme Corp",   role: "CTO",         meeting_notes: "Interested in SOC2 compliance. Budget 50k. Need proposal Friday. Concerned about security breaches and data privacy." },
  { contact_name: "Michael Torres",company: "CloudSync",   role: "VP Eng",      meeting_notes: "Evaluating us vs competitors. Worried about integration complexity. 40-engineer team. Timeline is Q2." },
  { contact_name: "Priya Kapoor",  company: "DataForge",   role: "CEO",         meeting_notes: "Wants to move fast. Budget flexible. Concerned about compliance. Needs executive dashboard. Demo requested next week." },
];

const STORED_ITEMS = [
  { icon: "🏢", text: "Contact & company info" },
  { icon: "⚠️", text: "Concerns & objections"  },
  { icon: "💰", text: "Budget discussions"      },
  { icon: "🤝", text: "Promises made"           },
  { icon: "📅", text: "Follow-up deadlines"     },
  { icon: "✅", text: "Meeting outcomes"         },
];

export default function AddMeeting() {
  const [form, setForm]     = useState({ contact_name: "", company: "", role: "", meeting_notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]   = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name || !form.meeting_notes) { setError("Contact name and meeting notes are required."); return; }
    setLoading(true); setError("");
    try { setSuccess(await addMeeting(form)); setForm({ contact_name: "", company: "", role: "", meeting_notes: "" }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(165deg,#0f0520 0%,#1a0845 55%,#0a1520 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 60% at 80% 30%,rgba(124,58,237,0.2) 0%,transparent 100%)" }} />
        <div className="badge badge-purple" style={{ marginBottom: 10 }}>📝 LOG MEETING</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 5 }}>Add Meeting</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)" }}>Build relationship memory, one note at a time.</div>
      </div>

      <div className="section">
        {/* Demo fill */}
        <div style={{ marginBottom: 20 }}>
          <div className="field-label" style={{ marginBottom: 9 }}>Quick demo fill</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DEMO_DATA.map((d) => (
              <button key={d.contact_name} onClick={() => { setForm(d); setSuccess(null); setError(""); }} className="btn-secondary" style={{ fontSize: 12 }}>
                {d.contact_name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Contact Name *</label>
              <input name="contact_name" value={form.contact_name} onChange={handleChange}
                placeholder="e.g. Sarah Chen" className="input" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label className="field-label">Company</label>
                <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" className="input" />
              </div>
              <div>
                <label className="field-label">Role</label>
                <input name="role" value={form.role} onChange={handleChange} placeholder="CTO" className="input" />
              </div>
            </div>
            <div>
              <label className="field-label">Meeting Notes *</label>
              <textarea name="meeting_notes" value={form.meeting_notes} onChange={handleChange}
                placeholder="Describe concerns raised, budget discussed, promises made, next steps..." rows={5}
                className="input input-textarea" required />
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 7 }}>
                💡 Be specific — the more detail, the smarter the memory.
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="alert-error" style={{ marginBottom: 12 }}>{error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="alert-success" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#34d399", marginBottom: 4, fontSize: 14 }}>
                  ✅ Meeting stored successfully!
                </div>
                <div style={{ fontSize: 11, color: "rgba(52,211,153,0.6)" }}>
                  Memory saved · Contact #{success.contact_id} · Meeting #{success.meeting_id}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginBottom: 20 }}>
            {loading ? (
              <>
                <div className="anim-spin" style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Saving to memory...
              </>
            ) : "💾 Save Meeting"}
          </button>
        </form>

        {/* What gets stored */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginBottom: 12 }}>What gets stored?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {STORED_ITEMS.map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(255,255,255,0.42)" }}>
                <span style={{ fontSize: 15 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
