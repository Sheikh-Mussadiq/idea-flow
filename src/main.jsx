// Polyfill for Draft.js - it expects Node.js globals
if (typeof global === "undefined") {
  window.global = window;
}

import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
