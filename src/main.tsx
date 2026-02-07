import { createRoot } from "react-dom/client";
import { useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Dashboard } from "./pages/Dashboard";
import { Reader } from "./pages/Reader";
import { Review } from "./pages/Review";
import "./app.css";

const OFFSET = 30;

function depth(path: string) {
  return path === "/" ? 0 : path.split("/").length - 1;
}

function AnimatedRoutes() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const forward = depth(location.pathname) >= depth(prevPath.current);
  prevPath.current = location.pathname;

  return (
    <AnimatePresence mode="wait" custom={forward}>
      <motion.div
        key={location.pathname}
        custom={forward}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          initial: (fwd: boolean) => ({ opacity: 0, x: fwd ? OFFSET : -OFFSET }),
          animate: { opacity: 1, x: 0 },
          exit: (fwd: boolean) => ({ opacity: 0, x: fwd ? -OFFSET : OFFSET }),
        }}
        transition={{ duration: 0.2 }}
        className="flex-1 min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/read/:id" element={<Reader />} />
          <Route path="/review" element={<Review />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedRoutes />
      <footer className="max-w-2xl mx-auto py-4 text-center text-xs text-zinc-700">
        Made with <span className="text-zinc-600">♥</span> by <a href="https://kyletan.com" className="text-zinc-600 no-underline">Kyle Tan</a>
      </footer>
    </div>
  );
}

document.fonts.ready.then(() => {
  createRoot(document.getElementById("app")!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
