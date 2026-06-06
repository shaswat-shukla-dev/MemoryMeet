import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/add", label: "Add Meeting" },
  { to: "/brief", label: "Brief" },
  { to: "/timeline", label: "Timeline" },
  { to: "/insights", label: "Insights" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center glow-purple">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gradient">MemoryMeet</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} className="relative px-3 py-2 text-sm font-medium transition-colors">
                <span className={active ? "text-white" : "text-white/50 hover:text-white/80"}>
                  {label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary-600/20 border border-primary-500/30 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden flex gap-2">
          {links.slice(0, 3).map(({ to, label }) => (
            <Link key={to} to={to}
              className={`text-xs px-2 py-1 rounded-lg ${pathname === to ? "bg-primary-600 text-white" : "text-white/50"}`}>
              {label.split(" ")[0]}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
