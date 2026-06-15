import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      <Sidebar />

      <div className="main-area">
        <Topbar />
        <main className="content-wrap">{children}</main>
      </div>

      <Navbar />
    </div>
  );
}
