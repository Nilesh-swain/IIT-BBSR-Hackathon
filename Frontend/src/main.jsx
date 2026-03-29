import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CosmosProvider } from "./contexts/CosmosContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import App from "./App.jsx"; // Renamed from AppWrapper for clarity
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <NotificationProvider>
      <CosmosProvider>
        <App />
      </CosmosProvider>
    </NotificationProvider>
  </StrictMode>,
);
