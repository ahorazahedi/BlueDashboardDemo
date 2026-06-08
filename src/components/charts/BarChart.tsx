import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { toFa } from "@/lib/utils";
import type { BarDatum } from "@/data/types";
import { AXIS_TICK, CHART_COLORS, FaTooltip } from "./chartTheme";

const colorAt = (d: BarDatum, i: number) =>
  d.color ?? CHART_COLORS[i % CHART_COLORS.length];

/**
 * Horizontal bar chart (recharts, RTL).
 * Category labels on the right; bars grow right → left via reversed X axis.
 */
export function HBarChart({
  data,
  unit,
}: {
  data: BarDatum[];
  unit?: string;
}) {
  // Category labels sit in a reserved band on the right (RTL). Bars grow
  // left → right; domain headroom keeps the longest bar clear of the labels.
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ResponsiveContainer width="100%" height={data.length * 46 + 8}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, bottom: 4, left: 8, right: 4 }}
        barCategoryGap={10}
      >
        <XAxis type="number" hide domain={[0, Math.ceil(max * 1.22)]} />
        <YAxis
          type="category"
          dataKey="label"
          orientation="right"
          width={96}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(45,212,191,0.06)" }} content={<FaTooltip unit={unit} />} />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={26}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorAt(d, i)} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            formatter={(v: number) => toFa(v)}
            fill="#EAF0FA"
            fontSize={12}
            fontWeight={700}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Vertical bar chart (recharts, RTL: first datum on the right). */
export function VBarChart({
  data,
  height = 200,
  unit,
}: {
  data: BarDatum[];
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, bottom: 4, left: 0, right: 0 }}>
        <XAxis
          dataKey="label"
          reversed
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: "#232C3D" }}
        />
        <YAxis hide />
        <Tooltip cursor={{ fill: "rgba(45,212,191,0.06)" }} content={<FaTooltip unit={unit} />} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorAt(d, i)} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v: number) => toFa(v)}
            fill="#EAF0FA"
            fontSize={11}
            fontWeight={700}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
