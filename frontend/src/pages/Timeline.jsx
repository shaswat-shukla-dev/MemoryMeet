import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMeetingsForContact, getContacts } from "../services/api";
import { useEffect } from "react";

export default function Timeline() {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getContacts().then(setContacts).catch(() => {});
  }, []);

  const handleSelect = async (name) => {
    setSelected(name);
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await getMeetingsForContact(name);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Memory Timeline</h1>
        <p className="text-white/40">Explore the full interaction history for any contact.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Contact list */}
        <div className="lg:col-span-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="input-field mb-3"
          />
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-sm text-white/30 text-center py-8">No contacts found.</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.name)}
                  className={`w-full text-left glass-card p-4 transition-all ${
                    selected === c.name
                      ? "border-primary-500/50 bg-primary-600/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{c.name}</div>
                      <div className="text-xs text-white/40">{c.role} · {c.company}</div>
                    </div>
                    <div className="ml-auto text-xs text-white/30">
                      {c.meeting_count}m
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-3">
          {!selected && (
            <div className="glass-card p-10 text-center">
              <div className="text-4xl mb-3">🕐</div>
              <p className="text-white/30 text-sm">Select a contact to view their timeline.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-6 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/10 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded w-1/4 mb-2" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

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

          {data && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Contact header */}
              <div className="glass-card p-5 bg-primary-600/10 border-primary-500/20">
                <h2 className="text-lg font-bold text-white">{data.contact.name}</h2>
                <p className="text-sm text-white/50">{data.contact.role} · {data.contact.company}</p>
              </div>

              {/* Timeline entries */}
              {data.meetings.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-white/30 text-sm">No meetings found for this contact.</p>
                </div>
              ) : (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
                    {data.meetings.length} Meeting{data.meetings.length !== 1 ? "s" : ""}
                  </h3>
                  <div className="space-y-0">
                    {data.meetings.map((m, i) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="timeline-dot" />
                          {i < data.meetings.length - 1 && (
                            <div className="w-px flex-1 bg-white/5 my-1 min-h-[24px]" />
                          )}
                        </div>
                        <div className="pb-5">
                          <div className="text-xs font-semibold text-primary-400 mb-1">
                            {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">{m.notes}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
