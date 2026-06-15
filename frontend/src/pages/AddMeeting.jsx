import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen, Save, Loader2, CheckCircle2, AlertTriangle, Lightbulb,
  Building2, DollarSign, Handshake, CalendarClock, ClipboardCheck, Sparkles,
} from "lucide-react";
import { addMeeting } from "../services/api";

const DEMO_DATA = [
  { contact_name: "Sarah Chen", company: "Acme Corp", role: "CTO", meeting_notes: "Interested in SOC2 compliance. Budget 50k. Need proposal Friday. Concerned about security breaches and data privacy." },
  { contact_name: "Michael Torres", company: "CloudSync", role: "VP Engineering", meeting_notes: "Evaluating our platform vs competitors. Worried about integration complexity. Has a team of 40 engineers. Timeline is Q2." },
  { contact_name: "Priya Kapoor", company: "DataForge", role: "CEO", meeting_notes: "Wants to move fast. Budget flexible. Concerned about compliance. Needs executive dashboard. Requested a demo next week." },
];

const WHAT_STORED = [
  { icon: Building2, text: "Contact & company info", color: "#93c5fd" },
  { icon: AlertTriangle, text: "Concerns & objections", color: "#fca5a5" },
  { icon: DollarSign, text: "Budget discussions", color: "#6ee7b7" },
  { icon: Handshake, text: "Promises & commitments", color: "#c4b5fd" },
  { icon: CalendarClock, text: "Follow-up deadlines", color: "#fcd34d" },
  { icon: ClipboardCheck, text: "Meeting outcomes", color: "#67e8f9" },
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
      {/* Header — mobile only */}
      <div className="hero-header lg:hidden">
        <div className="badge badge-purple" style={{ marginBottom: 12 }}>
          <NotebookPen size={12} /> LOG MEETING
        </div>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Add Meeting</div>
        <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>Build relationship memory, one note at a time.</div>
      </div>

      <div className="section">
        <div className="grid lg:grid-cols-3 gap-3 lg:gap-6 items-start">

          {/* ── Main column: form ── */}
          <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">

            {/* Demo quick-fill */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={12} /> Quick demo fill
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DEMO_DATA.map((d) => (
                  <button
                    key={d.contact_name}
                    onClick={() => { setForm(d); setSuccess(null); setError(""); }}
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: "8px 14px" }}
                  >
                    {d.contact_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="card card-static" style={{ padding: 24 }}>
                {/* Contact name */}
                <div style={{ marginBottom: 18 }}>
                  <label className="label">CONTACT NAME *</label>
                  <input name="contact_name" value={form.contact_name} onChange={handleChange}
                    placeholder="e.g. Sarah Chen" className="input" required />
                </div>

                {/* Company + Role row */}
                <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 18 }}>
                  <div>
                    <label className="label">COMPANY</label>
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" className="input" />
                  </div>
                  <div>
                    <label className="label">ROLE</label>
                    <input name="role" value={form.role} onChange={handleChange} placeholder="CTO" className="input" />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="label">MEETING NOTES *</label>
                  <textarea name="meeting_notes" value={form.meeting_notes} onChange={handleChange}
                    placeholder="Describe concerns, budget discussed, promises made, next steps..."
                    rows={6} className="input textarea" required />
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Lightbulb size={13} /> The more detail, the smarter the memory.
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ padding: "12px 16px", borderRadius: 14, marginTop: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={15} /> {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: "14px 18px", borderRadius: 14, marginTop: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#34d399", marginBottom: 4, fontSize: 14 }}>
                      <CheckCircle2 size={16} /> Meeting stored successfully!
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(52,211,153,0.6)" }}>
                      Memory saved · Contact #{success.contact_id} · Meeting #{success.meeting_id}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 16 }}>
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                    Saving to memory...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Meeting
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Side column: what gets stored ── */}
          <div className="lg-sticky">
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={15} color="#a78bfa" />
                What gets stored?
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {WHAT_STORED.map(({ icon: Icon, text, color }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)",
                      display: "flex", alignItems: "center", justifyContent: "center", color,
                    }}>
                      <Icon size={15} />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="card lg:mt-4 mt-3" style={{ padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10 }}>Why this matters</div>
              <p style={{ fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.7 }}>
                Every note you save becomes searchable memory. MemoryMeet uses it to spot recurring concerns,
                track promises, and build a relationship health score — so your next meeting starts with full context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
