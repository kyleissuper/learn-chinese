import { render } from "preact";
import Router from "preact-router";
import { Dashboard } from "./pages/Dashboard";
import { Reader } from "./pages/Reader";
import { Review } from "./pages/Review";
import "./app.css";

function App() {
  return (
    <div class="min-h-screen flex flex-col">
      <div class="flex-1 min-h-screen">
        <Router>
          <Dashboard path="/" />
          <Reader path="/read/:id" />
          <Review path="/review" />
        </Router>
      </div>
      <footer class="max-w-2xl mx-auto py-4 text-center text-xs text-zinc-700">
        Made with <span class="text-zinc-600">♥</span> by <a href="https://kyletan.com" class="text-zinc-600 no-underline">Kyle Tan</a>
      </footer>
    </div>
  );
}

render(<App />, document.getElementById("app")!);
