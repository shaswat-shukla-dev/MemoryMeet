import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMeetingsForContact, getContacts } from "../services/api";

const AVATAR_COLORS = ["avatar-purple", "avatar-teal", "avatar-amber", "avatar-blue", "avatar-pink"];

export default function Timeline() {
  const [search, setSearch]     = useState("");
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => { getContacts().then(setContacts).catch(() => {}); }, []);

  const handleSelect = async (name) => {
    setSelected(name); setLoading(true); setError(""); setData(null);
    try { setData(await getMeetingsForContact(name)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(165deg,#0f0520 0%,#0a1a45 55%,#0f1020 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 55% at 70% 30%,rgba(59,130,246,0.18) 0%,transparent 100%)" }} />
        <div className="badge badge-blue" style={{ marginBottom: 10 }}>📅 TIMELINE</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 5 }}>Memory Timeline</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)" }}>Explore full interaction history for any contact.</div>
      </div>

      <div className="section">
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 18 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.28)" }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..." className="input" style={{ paddingLeft: 42 }} />
        </div>

        {/* Contact list */}
        {contacts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 0", color: "rgba(255,255,255,0.28)", fontSize: 14 }}>
            No contacts yet.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(255,255,255,0.28)", fontSize: 13 }}>
            No contacts match "{search}".
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
            {filtered.map((c, i) => (
              <button key={c.id} onClick={() => handleSelect(c.name)}
                style={{ all: "unset", cursor: "pointer", display: "block" }}>
                <div className="contact-row" style={selected === c.name ? {
                  borderColor: "rgba(139,92,246,0.35)", background: "rgba(124,58,237,0.08)"
                } : {}}>
                  <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{c.role} · {c.company}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div className="badge badge-purple">{c.meeting_count}m</div>
                    <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 15 }}>›</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Timeline detail */}
        {!selected && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card" style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🕐</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Select a contact above to view their full timeline.</div>
          </motion.div>
        )}

        {loading && (
          <div className="card" style={{ padding: 20 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                <div className="skeleton" style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 11, width: "28%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 13, width: "92%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="alert-error">{error}
            </motion.div>
          )}
        </AnimatePresence>

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            {/* Contact header */}
            <div style={{
              background: "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.06))",
              border: "1px solid rgba(124,58,237,0.18)", borderRadius: 18,
              padding: "14px 18px", marginBottom: 14,
            }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{data.contact.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", marginTop: 2 }}>
                {data.contact.role} · {data.contact.company}
              </div>
            </div>

            {data.meetings.length === 0 ? (
              <div className="card" style={{ padding: 30, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                No meetings recorded yet.
              </div>
            ) : (
              <div className="card" style={{ padding: "18px 18px 4px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
                  {data.meetings.length} Meeting{data.meetings.length !== 1 ? "s" : ""}
                </div>
                {data.meetings.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    style={{ display: "flex", gap: 14, paddingBottom: 18 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div className="timeline-dot" />
                      {i < data.meetings.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: "rgba(124,58,237,0.18)", minHeight: 20, marginTop: 4 }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>
                        {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", lineHeight: 1.7 }}>{m.notes}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
