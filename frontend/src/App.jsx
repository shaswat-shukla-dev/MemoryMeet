import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddMeeting from "./pages/AddMeeting";
import Brief from "./pages/Brief";
import Insights from "./pages/Insights";
import Timeline from "./pages/Timeline";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/add"      element={<AddMeeting />} />
        <Route path="/brief"    element={<Brief />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/timeline" element={<Timeline />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", background: "#060612", position: "relative" }}>
        <AnimatedRoutes />
        <Navbar />
      </div>
    </Router>
  );
}
