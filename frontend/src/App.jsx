import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddMeeting from "./pages/AddMeeting";
import Brief from "./pages/Brief";
import Insights from "./pages/Insights";
import Timeline from "./pages/Timeline";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a14] bg-grid">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddMeeting />} />
            <Route path="/brief" element={<Brief />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}
