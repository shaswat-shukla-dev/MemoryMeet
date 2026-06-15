import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Search, Clock, AlertTriangle, Users } from "lucide-react";
import { getMeetingsForContact, getContacts } from "../services/api";

const AVATAR_COLORS = ["avatar-purple", "avatar-teal", "avatar-amber", "avatar-blue", "avatar-pink"];

export default function Timeline() {
  const [searchParams] = useSearchParams();
  const [search, setSearch]   = useState("");
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const autoRan = useRef(false);

  useEffect(() => { getContacts().then(setContacts).catch(() => {}); }, []);

  const handleSelect = async (name) => {
    setSelected(name); setLoading(true); setError(""); setData(null);
    try { setData(await getMeetingsForContact(name)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const prefill = searchParams.get("contact");
    if (prefill && !autoRan.current && contacts.length > 0) {
      autoRan.current = true;
      handleSelect(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      {/* Header — mobile only */}
      <div className="hero-header lg:hidden">
        <div className="badge badge-blue" style={{ marginBottom: 12 }}>
          <CalendarClock size={12} /> TIMELINE
        </div>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Memory Timeline</div>
        <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>Explore full interaction history for any contact.</div>
      </div>

      <div className="section">
        <div className="grid lg:grid-cols-3 gap-3 lg:gap-6 items-start">

          {/* ── Left: search + contact list ── */}
          <div className="lg:col-span-1 lg-sticky">
            <div className="search-wrap" style={{ marginBottom: 16 }}>
              <span className="search-icon"><Search size={17} /></span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..." className="input" />
            </div>

            {contacts.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon"><Users size={24} /></div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>No contacts yet.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-1">
                {filtered.map((c, i) => (
                  <button key={c.id} onClick={() => handleSelect(c.name)}
                    style={{ all: "unset", cursor: "pointer", display: "block" }}>
                    <div className="contact-row" style={selected === c.name ? { borderColor: "rgba(139,92,246,0.4)", background: "rgba(124,58,237,0.1)" } : {}}>
                      <div className={`avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.role} · {c.company}</div>
                      </div>
                      <div className="badge badge-purple" style={{ fontSize: 11, flexShrink: 0 }}>{c.meeting_count}m</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: timeline detail ── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card" style={{ padding: 24 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                      <div className="skeleton" style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: 12, width: "30%", marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 14, width: "100%" }} />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {error && !loading && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={15} /> {error}
                </motion.div>
              )}

              {data && !loading && (
                <motion.div key="data" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.06))",
                    border: "1px solid rgba(124,58,237,0.2)",
                    borderRadius: 18, padding: "18px 22px", marginBottom: 16,
                  }}>
                    <div className="font-display" style={{ fontSize: 18, fontWeight: 800 }}>{data.contact.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                      {data.contact.role} · {data.contact.company}
                    </div>
                  </div>

                  {data.meetings.length === 0 ? (
                    <div className="card empty-state">
                      <div className="empty-state-icon"><Clock size={24} /></div>
                      <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>No meetings recorded yet.</div>
                    </div>
                  ) : (
                    <div className="card card-static" style={{ padding: "20px 20px 8px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
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
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{m.notes}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {!selected && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="card empty-state">
                  <div className="empty-state-icon"><Clock size={26} /></div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Select a contact to view their timeline.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
