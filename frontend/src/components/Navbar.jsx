import { NavLink } from "react-router-dom";

const NAV = [
  { to: "/",         label: "Home",     icon: "🏠" },
  { to: "/timeline", label: "Contacts", icon: "👥" },
  { to: "/timeline", label: "Timeline", icon: "📅" },
  { to: "/insights", label: "Search",   icon: "🔍" },
  { to: "/brief",    label: "Profile",  icon: "👤" },
];

export default function Navbar() {
  return (
    <div className="bottom-nav">
      <div className="nav-inner">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
