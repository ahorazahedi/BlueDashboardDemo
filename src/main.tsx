import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { DashboardStoreProvider } from "./store/dashboards";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DashboardStoreProvider>
        <App />
      </DashboardStoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
