import { render } from "preact";
import { useEffect } from "preact/hooks";
import Router, { route } from "preact-router";
import { Dashboard } from "./pages/Dashboard";
import { Reader } from "./pages/Reader";
import { Review } from "./pages/Review";
import "./app.css";

function App() {
  // Intercept internal link clicks to use View Transitions for smooth crossfade
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!(document as any).startViewTransition) return;

      e.preventDefault();
      e.stopPropagation();
      (document as any).startViewTransition(() => {
        route(url.pathname + url.search);
      });
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  return (
    <Router>
      <Dashboard path="/" />
      <Reader path="/read/:id" />
      <Review path="/review" />
    </Router>
  );
}

render(<App />, document.getElementById("app")!);
