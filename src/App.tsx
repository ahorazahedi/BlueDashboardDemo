import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Builder from "./pages/Builder";
import Live from "./pages/Live";
import Scout from "./pages/Scout";
import KPI from "./pages/KPI";
import Analyst from "./pages/Analyst";
import Documents from "./pages/Documents";
import ViewDashboard from "./pages/ViewDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/builder" element={<Builder />} />
      <Route path="/live" element={<Live />} />
      <Route path="/scout" element={<Scout />} />
      <Route path="/kpi" element={<KPI />} />
      <Route path="/analyst" element={<Analyst />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/dashboard/:id" element={<ViewDashboard />} />
    </Routes>
  );
}
