import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "../config/nav";

export default function Navbar() {
  return (
    <div className="bottom-nav">
      <div className="nav-inner">
        {NAV_ITEMS.map(({ to, label, icon: Icon }, i) => {
          const isAddItem = to === "/add";

          if (isAddItem) {
            return (
              <NavLink key={to} to={to} className="nav-item" aria-label={label}>
                <div className="nav-item-add">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active-bg"
                      className="nav-item-bg"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon size={21} strokeWidth={2.2} />
                  <span className="nav-label">{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
