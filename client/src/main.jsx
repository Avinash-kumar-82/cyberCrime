import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Render React app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
