import type { AlarmLevel } from "@/lib/utils";

export type WidgetType =
  | "stat"
  | "bar"
  | "hbar"
  | "line"
  | "donut"
  | "gauge"
  | "table";

export interface SparkPoint {
  v: number;
}

export interface StatWidget {
  type: "stat";
  title: string;
  value: string;
  unit?: string;
  trend?: { dir: "up" | "down"; label: string };
  spark?: number[];
  level?: number; // 1-5 or use status color
  statusColor?: string;
}

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export interface BarWidget {
  type: "bar" | "hbar";
  title: string;
  data: BarDatum[];
  unit?: string;
  refLine?: { value: number; label: string };
}

export interface LinePoint {
  label: string;
  value: number;
}

export interface LineWidget {
  type: "line";
  title: string;
  series: { name: string; color: string; points: LinePoint[] }[];
  unit?: string;
  area?: boolean;
  delta?: { value: string; positive: boolean };
}

export interface DonutWidget {
  type: "donut";
  title: string;
  value: number; // percent
  label?: string;
  color?: string;
}

export interface GaugeWidget {
  type: "gauge";
  title: string;
  value: number; // 0-100
}

export interface TableWidget {
  type: "table";
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export type Widget =
  | StatWidget
  | BarWidget
  | LineWidget
  | DonutWidget
  | GaugeWidget
  | TableWidget;

export interface SavedDashboard {
  id: string;
  title: string;
  updated: string; // jalali string
  widgets: Widget[];
}

export interface ScoutMetric {
  domain: string;
  label: string;
  value: string;
  sub: string;
  level: AlarmLevel;
  trend: number[];
  owner: string;
  action?: boolean;
}
