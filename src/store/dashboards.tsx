import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { SavedDashboard, Widget } from "@/data/types";
import { SEED_DASHBOARDS } from "@/data/mock";

interface StoreCtx {
  dashboards: SavedDashboard[];
  saveDashboard: (title: string, widgets: Widget[]) => string;
  /** A widget queued from another page (e.g. Analyst → Builder). */
  pendingWidget: Widget | null;
  setPendingWidget: (w: Widget | null) => void;
  /** A prompt to auto-run on the Builder (from Home chips). */
  pendingPrompt: string | null;
  setPendingPrompt: (p: string | null) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function DashboardStoreProvider({ children }: { children: ReactNode }) {
  const [dashboards, setDashboards] = useState<SavedDashboard[]>(SEED_DASHBOARDS);
  const [pendingWidget, setPendingWidget] = useState<Widget | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  function saveDashboard(title: string, widgets: Widget[]) {
    const id = `dash-${dashboards.length + 1}-${title.length}`;
    setDashboards((prev) => [
      { id, title, updated: "هم‌اکنون", widgets },
      ...prev,
    ]);
    return id;
  }

  return (
    <Ctx.Provider
      value={{
        dashboards,
        saveDashboard,
        pendingWidget,
        setPendingWidget,
        pendingPrompt,
        setPendingPrompt,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDashboards() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboards must be used within provider");
  return ctx;
}
