import { useState } from "react";
import { ArrowDownWideNarrow } from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { MetricMatrixCard } from "@/components/widgets/MetricMatrixCard";
import { ALARM_SCALE, cn, type AlarmLevel } from "@/lib/utils";
import { SCOUT_DOMAINS, SCOUT_METRICS } from "@/data/mock";

const SEVERITY: Record<AlarmLevel, number> = {
  critical: 3,
  warning: 2,
  info: 1,
  acceptable: 0,
};

type Filter = "all" | "critical" | "warning+";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "warning+", label: "هشدار به بالا" },
  { id: "critical", label: "فقط بحرانی" },
];

export default function Scout() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sorted, setSorted] = useState(false);

  const pass = (lvl: AlarmLevel) =>
    filter === "all"
      ? true
      : filter === "critical"
        ? lvl === "critical"
        : SEVERITY[lvl] >= 2;

  const criticalCount = SCOUT_METRICS.filter((m) => m.level === "critical").length;
  const warningCount = SCOUT_METRICS.filter((m) => m.level === "warning").length;

  return (
    <Layout title="دیده‌بان" breadcrumb="پایش انحرافات نیازمند اقدام">
      {/* filter bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                filter === f.id
                  ? "border-accent/50 bg-accent-soft text-accent"
                  : "border-border bg-surface-2 text-text-secondary hover:text-text-primary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
            <span className="size-2 rounded-full bg-danger" /> {criticalCount} بحرانی
            <span className="ms-2 size-2 rounded-full bg-warning" /> {warningCount} هشدار
          </span>
          <button
            onClick={() => setSorted((s) => !s)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] transition-colors",
              sorted ? "border-accent/50 text-accent" : "border-border text-text-secondary hover:text-text-primary"
            )}
          >
            <ArrowDownWideNarrow className="size-4" /> مرتب‌سازی بر اساس شدت
          </button>
        </div>
      </div>

      {/* matrix board — columns per domain, RTL rightmost first */}
      <div className="flex gap-4 overflow-x-auto pb-3">
        {SCOUT_DOMAINS.map((domain) => {
          let cells = SCOUT_METRICS.filter((m) => m.domain === domain && pass(m.level));
          if (sorted) cells = [...cells].sort((a, b) => SEVERITY[b.level] - SEVERITY[a.level]);
          return (
            <div key={domain} className="flex w-64 shrink-0 flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
                <span className="text-[13px] font-semibold text-text-primary">{domain}</span>
                <span className="text-[11px] text-text-muted">{cells.length} شاخص</span>
              </div>
              {cells.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-[12px] text-text-muted">
                  موردی نیست
                </div>
              ) : (
                cells.map((m) => <MetricMatrixCard key={m.label} m={m} />)
              )}
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {(Object.keys(ALARM_SCALE) as AlarmLevel[]).map((lvl) => (
          <span key={lvl} className="flex items-center gap-1.5 text-[12px] text-text-secondary">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: ALARM_SCALE[lvl].color }} />
            {ALARM_SCALE[lvl].label}
          </span>
        ))}
      </div>
    </Layout>
  );
}
