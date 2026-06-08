import { NavLink } from "react-router-dom";
import {
  Home,
  Sparkles,
  Radio,
  Eye,
  BarChart3,
  Brain,
  FolderOpen,
  Settings,
  Activity,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { cn, toFa } from "@/lib/utils";
import { useDashboards } from "@/store/dashboards";

export const NAV_ITEMS = [
  { to: "/", label: "خانه", icon: Home, end: true },
  { to: "/builder", label: "داشبوردساز هوشمند", icon: Sparkles },
  { to: "/live", label: "لحظه‌نما (Live)", icon: Radio },
  { to: "/scout", label: "دیده‌بان (Scout)", icon: Eye },
  { to: "/kpi", label: "ژرف‌نما / شاخص‌های کلیدی", icon: BarChart3 },
  { to: "/analyst", label: "تحلیل‌یار هوشمند", icon: Brain },
  { to: "/documents", label: "اسناد و شاخص‌ها", icon: FolderOpen },
];

export function Sidebar() {
  const { dashboards } = useDashboards();
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-s border-border bg-surface">
      {/* logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Activity className="size-5" />
        </span>
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-text-primary">سامانه بهره‌وری</div>
          <div className="text-[11px] text-text-muted">هوشمند بیمارستانی</div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute end-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                )}
                <Icon className="size-[18px] shrink-0" />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* saved dashboards */}
        <div className="px-3 pb-1 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-muted">داشبوردهای من</span>
            <span className="rounded-full bg-surface-2 px-1.5 text-[10px] tnum text-text-muted">
              {toFa(dashboards.length)}
            </span>
          </div>
        </div>
        {dashboards.map((d) => (
          <NavLink
            key={d.id}
            to={`/dashboard/${d.id}`}
            className={({ isActive }) =>
              cn(
                "group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] transition-colors",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute end-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                )}
                <LayoutDashboard className="size-4 shrink-0" />
                <span className="truncate">{d.title}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/builder"
          className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-2 text-[12.5px] text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Plus className="size-4 shrink-0" /> داشبورد جدید
        </NavLink>
      </nav>

      {/* user */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-[13px] font-bold text-accent">
            ا.ا
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-medium text-text-primary">دکتر احمدی</div>
            <div className="truncate text-[11px] text-text-muted">مدیر دانشگاه</div>
          </div>
          <button className="cursor-pointer rounded-md p-1.5 text-text-muted hover:bg-surface hover:text-text-primary" aria-label="تنظیمات">
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
