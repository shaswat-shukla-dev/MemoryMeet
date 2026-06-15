import { useLocation, Link } from "react-router-dom";
import { Search, Bell, Plus } from "lucide-react";
import { NAV_ITEMS } from "../config/nav";

export default function Topbar() {
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find((n) => n.to === pathname) || NAV_ITEMS[0];

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title font-display">{current.title}</div>
        <div className="topbar-subtitle">{current.subtitle}</div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={16} />
          <span style={{ color: "var(--text-faint)" }}>Search contacts, meetings…</span>
        </div>

        <Link to="/add" className="btn-primary" style={{ width: "auto", padding: "11px 18px", fontSize: 14 }}>
          <Plus size={16} strokeWidth={2.5} />
          New Meeting
        </Link>

        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <div className="notif-dot" />
        </button>

        <div className="topbar-avatar">SJ</div>
      </div>
    </header>
  );
}
