import process from "process";

// ⚡ Must be BEFORE any ethers / biconomy import
window.process = process;

import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes/routes";
import Web3Provider from "./context/Web3Provider";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Web3Provider>
    <RouterProvider router={routes} />
  </Web3Provider>
);
