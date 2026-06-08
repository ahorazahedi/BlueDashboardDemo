import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/utils";

/**
 * Single big-number stat card: value + label + unit + trend + sparkline +
 * status dot. The hero building block, reused across Live / Builder / Home.
 */
export function StatCard({
  title,
  value,
  unit,
  trend,
  spark,
  statusColor = "#22C55E",
  live,
}: {
  title: string;
  value: string;
  unit?: string;
  trend?: { dir: "up" | "down"; label: string };
  spark?: number[];
  statusColor?: string;
  live?: boolean;
}) {
  const TrendIcon = trend?.dir === "down" ? ArrowDownLeft : ArrowUpLeft;
  const trendColor = trend?.dir === "down" ? "#EF4444" : "#22C55E";
  return (
    <Card className={cn("p-4", live && "shimmer-overlay")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-[13px] text-text-secondary">{title}</span>
        <span className="relative inline-flex size-2 shrink-0">
          {live && (
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-60"
              style={{ backgroundColor: statusColor }}
            />
          )}
          <span className="relative size-2 rounded-full" style={{ backgroundColor: statusColor }} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[30px] font-bold leading-none tnum text-text-primary">
              {value}
            </span>
            {unit && <span className="text-[13px] text-text-muted">{unit}</span>}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: trendColor }}>
              <TrendIcon className="size-3.5" />
              <span>{trend.label}</span>
            </div>
          )}
        </div>
        {spark && <Sparkline data={spark} color={statusColor} width={84} height={36} />}
      </div>
    </Card>
  );
}
