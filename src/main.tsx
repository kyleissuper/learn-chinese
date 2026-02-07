import { render } from "preact";
import Router from "preact-router";
import { Dashboard } from "./pages/Dashboard";
import { Reader } from "./pages/Reader";
import { Review } from "./pages/Review";
import "./app.css";

function App() {
  return (
    <Router>
      <Dashboard path="/" />
      <Reader path="/read/:id" />
      <Review path="/review" />
    </Router>
  );
}

render(<App />, document.getElementById("app")!);
