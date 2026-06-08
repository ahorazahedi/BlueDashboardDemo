import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { toFa, scoreColor } from "@/lib/utils";

/**
 * Circular gauge (recharts RadialBar, 270° sweep). Arc color from the
 * 5-level performance scale; Persian-digit value centered via overlay.
 */
export function Gauge({
  value,
  size = 124,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const color = scoreColor(value);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="72%"
            outerRadius="100%"
            data={[{ value: Math.max(0, Math.min(100, value)) }]}
            startAngle={225}
            endAngle={-45}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: "#1B2333" }}
              dataKey="value"
              cornerRadius={20}
              fill={color}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold tnum text-text-primary"
            style={{ fontSize: size * 0.26 }}
          >
            {toFa(value)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-center text-[13px] leading-tight text-text-secondary">
          {label}
        </span>
      )}
    </div>
  );
}

/** Tiny gauge for the 5-layer root-cause rows. */
export function MiniGauge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Gauge value={value} size={56} />
      <span className="text-[11px] text-text-muted">{label}</span>
    </div>
  );
}
