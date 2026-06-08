import { toFa } from "@/lib/utils";

export const CHART_COLORS = [
  "#2DD4BF",
  "#3B82F6",
  "#84CC16",
  "#F59E0B",
  "#A78BFA",
  "#EF4444",
];

export const AXIS_TICK = { fill: "#9AA6BC", fontSize: 12, fontFamily: "Vazirmatn" };

/** Recharts tooltip styled for the dark theme, Persian digits. */
export function FaTooltip({
  active,
  payload,
  label,
  unit,
}: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      dir="rtl"
      className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs shadow-card"
    >
      {label != null && (
        <div className="mb-1 font-medium text-text-secondary">{label}</div>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-text-primary">
          <span className="size-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="font-semibold tnum">{toFa(p.value)}</span>
          {unit && <span className="text-text-muted">{unit}</span>}
        </div>
      ))}
    </div>
  );
}
