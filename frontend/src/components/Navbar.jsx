import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/",         label: "Home",     icon: "🏠" },
  { to: "/timeline", label: "Contacts", icon: "👥" },
  { to: "/timeline", label: "Timeline", icon: "📅", exact: false },
  { to: "/insights", label: "Search",   icon: "🔍" },
  { to: "/brief",    label: "Profile",  icon: "👤" },
];

export default function Navbar() {
  return (
    <div className="bottom-nav">
      <div className="nav-inner">
        {NAV_ITEMS.map(({ to, label, icon, exact }, i) => (
          <NavLink
            key={`${to}-${i}`}
            to={to}
            end={to === "/" || exact !== false}
            className={({ isActive }) =>
              `nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
