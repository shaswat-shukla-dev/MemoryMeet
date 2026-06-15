import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddMeeting from "./pages/AddMeeting";
import Brief from "./pages/Brief";
import Insights from "./pages/Insights";
import Timeline from "./pages/Timeline";
import { UserProvider } from "./context/UserContext";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div {...pageTransition}><Dashboard /></motion.div>} />
        <Route path="/add" element={<motion.div {...pageTransition}><AddMeeting /></motion.div>} />
        <Route path="/brief" element={<motion.div {...pageTransition}><Brief /></motion.div>} />
        <Route path="/insights" element={<motion.div {...pageTransition}><Insights /></motion.div>} />
        <Route path="/timeline" element={<motion.div {...pageTransition}><Timeline /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </UserProvider>
  );
}
