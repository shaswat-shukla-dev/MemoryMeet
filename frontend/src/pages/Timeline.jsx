import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMeetingsForContact, getContacts } from "../services/api";

const AVATAR_COLORS = ["avatar-purple", "avatar-teal", "avatar-amber", "avatar-blue", "avatar-pink"];

export default function Timeline() {
  const [search, setSearch]   = useState("");
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => { getContacts().then(setContacts).catch(() => {}); }, []);

  const handleSelect = async (name) => {
    setSelected(name); setLoading(true); setError(""); setData(null);
    try { setData(await getMeetingsForContact(name)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div style={{
        background: "linear-gradient(165deg, #0f0520 0%, #0a1a45 60%, #0f1020 100%)",
        padding: "56px 20px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 55% at 70% 30%, rgba(59,130,246,0.18) 0%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge badge-purple" style={{ marginBottom: 12, background: "rgba(59,130,246,0.12)", color: "#93c5fd", borderColor: "rgba(59,130,246,0.25)" }}>
            📅 TIMELINE
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Memory Timeline</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Explore full interaction history for any contact.</div>
        </div>
      </div>

      <div className="section">
        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: 20 }}>
          <span className="search-icon">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..." className="input" style={{ paddingLeft: 44 }} />
        </div>

        {/* Contact list */}
        {contacts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No contacts yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {filtered.map((c, i) => (
              <button key={c.id} onClick={() => handleSelect(c.name)}
                style={{ all: "unset", cursor: "pointer", display: "block" }}>
                <div className="contact-row" style={selected === c.name ? { borderColor: "rgba(139,92,246,0.4)", background: "rgba(124,58,237,0.1)" } : {}}>
                  <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.role} · {c.company}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="badge badge-purple" style={{ fontSize: 11 }}>{c.meeting_count}m</div>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>›</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Timeline detail */}
        <AnimatePresence>
          {loading && (
            <div className="card" style={{ padding: 24 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                  <div className="skeleton" style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 12, width: "30%", marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171" }}>
              {error}
            </motion.div>
          )}

          {data && !loading && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.06))",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 18, padding: "16px 20px", marginBottom: 16,
              }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{data.contact.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  {data.contact.role} · {data.contact.company}
                </div>
              </div>

              {data.meetings.length === 0 ? (
                <div className="card" style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                  No meetings recorded yet.
                </div>
              ) : (
                <div className="card" style={{ padding: "20px 20px 8px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
                    {data.meetings.length} Meeting{data.meetings.length !== 1 ? "s" : ""}
                  </div>
                  {data.meetings.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      style={{ display: "flex", gap: 16, paddingBottom: 20 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div className="timeline-dot" />
                        {i < data.meetings.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: "rgba(124,58,237,0.2)", minHeight: 24, marginTop: 4 }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>
                          {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{m.notes}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {!selected && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🕐</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Select a contact to view their timeline.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
