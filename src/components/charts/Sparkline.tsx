import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

/**
 * Tiny inline sparkline (recharts Area). RTL: oldest point on the right.
 */
export function Sparkline({
  data,
  color = "#2DD4BF",
  width = 96,
  height = 32,
  area = true,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  area?: boolean;
}) {
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={area ? 0.25 : 0} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} reversed={false} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#spark-${color})`}
            dot={false}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
