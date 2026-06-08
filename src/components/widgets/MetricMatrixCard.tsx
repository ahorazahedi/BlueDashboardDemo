import { AlertTriangle } from "lucide-react";
import { Sparkline } from "@/components/charts/Sparkline";
import { ALARM_SCALE, cn } from "@/lib/utils";
import type { ScoutMetric } from "@/data/types";

/** A Scout cell: dot + label + value + sub-label + mini trend + owner. */
export function MetricMatrixCard({ m }: { m: ScoutMetric }) {
  const { color, label: levelLabel } = ALARM_SCALE[m.level];
  const critical = m.level === "critical";
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent/30",
        critical && "border-danger/60 ring-1 ring-danger/20"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[13px] leading-snug text-text-primary">{m.label}</span>
        </div>
        {m.action && (
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-danger/15 px-1.5 py-0.5 text-[10px] font-medium text-danger">
            <AlertTriangle className="size-3" /> اقدام فوری
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-2xl font-bold tnum text-text-primary">{m.value}</div>
          <div className="mt-0.5 text-[11px] text-text-muted">{m.sub}</div>
        </div>
        <Sparkline data={m.trend} color={color} width={64} height={28} area={false} />
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span
            className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-base"
            style={{ backgroundColor: color }}
          >
            {m.owner.charAt(0)}
          </span>
          {m.owner}
        </span>
        <span className="text-[10px]" style={{ color }}>{levelLabel}</span>
      </div>
    </div>
  );
}
