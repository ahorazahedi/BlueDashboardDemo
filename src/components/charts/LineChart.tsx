import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart as RCLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toFa } from "@/lib/utils";
import type { LineWidget } from "@/data/types";
import { AXIS_TICK, FaTooltip } from "./chartTheme";

/**
 * Line / area chart (recharts, RTL). X axis reversed so the series reads
 * right → left. Persian-digit ticks and tooltip.
 */
export function LineChart({
  series,
  area,
  height = 220,
  unit,
}: {
  series: LineWidget["series"];
  area?: boolean;
  height?: number;
  unit?: string;
}) {
  // merge points into rows keyed by label
  const labels = series[0].points.map((p) => p.label);
  const rows = labels.map((label, i) => {
    const row: Record<string, number | string> = { label };
    series.forEach((s) => (row[s.name] = s.points[i].value));
    return row;
  });

  const Chart: any = area ? AreaChart : RCLineChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={rows} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.name} id={`fill-${s.name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="#232C3D" vertical={false} />
        <XAxis dataKey="label" reversed tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: "#232C3D" }} />
        <YAxis
          orientation="right"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={(v) => toFa(v)}
        />
        <Tooltip content={<FaTooltip unit={unit} />} />
        {series.map((s) =>
          area ? (
            <Area
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              fill={`url(#fill-${s.name})`}
              dot={{ r: 2.5, fill: s.color }}
              activeDot={{ r: 4 }}
            />
          ) : (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: s.color }}
              activeDot={{ r: 4 }}
            />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

/** Minimal multi-line sparkline used inside the analyst stepper. */
export function MiniMultiLine({
  series,
  height = 64,
}: {
  series: { name: string; color: string; points: number[] }[];
  height?: number;
}) {
  const n = series[0].points.length;
  const rows = Array.from({ length: n }, (_, i) => {
    const row: Record<string, number> = { i };
    series.forEach((s) => (row[s.name] = s.points[i]));
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RCLineChart data={rows} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <XAxis dataKey="i" hide reversed />
        <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
        {series.map((s) => (
          <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={1.75} dot={false} />
        ))}
      </RCLineChart>
    </ResponsiveContainer>
  );
}
