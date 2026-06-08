import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { faPct } from "@/lib/utils";

/**
 * Donut for a single percentage KPI (recharts Pie). Center shows the
 * Persian-digit percentage via overlay.
 */
export function Donut({
  value,
  size = 124,
  color = "#2DD4BF",
  label,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const data = [
    { name: "v", value },
    { name: "rest", value: 100 - value },
  ];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              innerRadius="74%"
              outerRadius="100%"
              stroke="none"
              cornerRadius={8}
            >
              <Cell fill={color} />
              <Cell fill="#1B2333" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold tnum text-text-primary" style={{ fontSize: size * 0.22 }}>
            {faPct(value)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-center text-[13px] leading-tight text-text-secondary">{label}</span>
      )}
    </div>
  );
}
