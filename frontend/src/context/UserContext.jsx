import { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, User } from "lucide-react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userName, setUserName] = useState(() => localStorage.getItem("mm_user_name") || "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("mm_user_role") || "");
  const [showSetup, setShowSetup] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputRole, setInputRole] = useState("");

  useEffect(() => {
    if (!userName) setShowSetup(true);
  }, []);

  const saveUser = () => {
    const name = inputName.trim();
    if (!name) return;
    const role = inputRole.trim() || "Team Member";
    localStorage.setItem("mm_user_name", name);
    localStorage.setItem("mm_user_role", role);
    setUserName(name);
    setUserRole(role);
    setShowSetup(false);
  };

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <UserContext.Provider value={{ userName, userRole, initials }}>
      {children}

      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 22,
                padding: "40px 36px",
                maxWidth: 440,
                width: "100%",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "linear-gradient(135deg, #a78bfa, #6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Brain size={22} color="white" strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "var(--text-primary)", fontFamily: "'Sora', sans-serif" }}>
                    Welcome to MemoryMeet
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>
                    Relationship Intelligence
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>
                What's your name?
              </div>
              <div style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 28, lineHeight: 1.6 }}>
                This helps personalise your workspace and greet you properly.
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Your Full Name
                </label>
                <input
                  autoFocus
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveUser()}
                  placeholder="e.g. Alex Rivera"
                  className="input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Your Role <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
                </label>
                <input
                  value={inputRole}
                  onChange={(e) => setInputRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveUser()}
                  placeholder="e.g. Account Executive"
                  className="input"
                  style={{ width: "100%" }}
                />
              </div>

              <button
                onClick={saveUser}
                disabled={!inputName.trim()}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <User size={16} /> Get Started
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
