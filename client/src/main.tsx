import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./app.css"; // Pulls Tailwind into the bundle

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Fatal: Could not find the root element to mount the application.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);