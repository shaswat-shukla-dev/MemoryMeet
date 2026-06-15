import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Settings } from "lucide-react";
import { NAV_ITEMS } from "../config/nav";
import { useUser } from "../context/UserContext";

export default function Sidebar() {
  const { userName, userRole, initials } = useUser();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Brain size={20} color="white" strokeWidth={2.2} />
        </div>
        <div>
          <div className="sidebar-logo-text">MemoryMeet</div>
          <div className="sidebar-logo-tag">Relationship Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="sidebar-link-bg"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="sidebar-link-icon">
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div
            style={{
              width: 38, height: 38, borderRadius: 11,
              background: "linear-gradient(135deg, #c4b5fd, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, color: "#1e1b4b", flexShrink: 0,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{userName || "New User"}</div>
            <div className="sidebar-user-role">{userRole || "Member"}</div>
          </div>
          <Settings size={16} color="var(--text-faint)" />
        </div>
      </div>
    </aside>
  );
}
