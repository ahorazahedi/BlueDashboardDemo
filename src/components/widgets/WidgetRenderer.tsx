import { MoreHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HBarChart, VBarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { Donut } from "@/components/charts/Donut";
import { Gauge } from "@/components/charts/Gauge";
import { Sparkline } from "@/components/charts/Sparkline";
import { toFa } from "@/lib/utils";
import type { Widget } from "@/data/types";

function WidgetMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer rounded-md p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
        aria-label="گزینه‌های ویجت"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute end-0 top-8 z-20 w-40 rounded-lg border border-border bg-surface-2 p-1 text-[13px] shadow-card">
          {["ویرایش", "تغییر نوع نمایش", "حذف"].map((item) => (
            <button
              key={item}
              className="block w-full cursor-pointer rounded-md px-3 py-1.5 text-start text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders any Widget union member inside a themed card. */
export function WidgetRenderer({ widget, menu = true }: { widget: Widget; menu?: boolean }) {
  const action = menu ? <WidgetMenu /> : undefined;

  if (widget.type === "stat") {
    return (
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="truncate text-[13px] text-text-secondary">{widget.title}</span>
          {action}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[30px] font-bold leading-none tnum">{widget.value}</span>
              {widget.unit && <span className="text-[13px] text-text-muted">{widget.unit}</span>}
            </div>
            {widget.trend && (
              <div className="mt-2 text-xs text-success">{widget.trend.label}</div>
            )}
          </div>
          {widget.spark && (
            <Sparkline data={widget.spark} color={widget.statusColor ?? "#2DD4BF"} width={84} height={36} />
          )}
        </div>
      </Card>
    );
  }

  if (widget.type === "hbar" || widget.type === "bar") {
    return (
      <Card>
        <CardHeader title={widget.title} statusColor="#2DD4BF" action={action} />
        <CardBody>
          {widget.type === "hbar" ? (
            <HBarChart data={widget.data} unit={widget.unit} />
          ) : (
            <VBarChart data={widget.data} unit={widget.unit} />
          )}
        </CardBody>
      </Card>
    );
  }

  if (widget.type === "line") {
    return (
      <Card>
        <CardHeader
          title={widget.title}
          statusColor="#2DD4BF"
          action={
            <div className="flex items-center gap-2">
              {widget.delta && (
                <Badge color={widget.delta.positive ? "#22C55E" : "#EF4444"} dot>
                  {widget.delta.value}
                </Badge>
              )}
              {action}
            </div>
          }
        />
        <CardBody>
          <LineChart series={widget.series} area={widget.area} unit={widget.unit} />
        </CardBody>
      </Card>
    );
  }

  if (widget.type === "donut") {
    return (
      <Card>
        <CardHeader title={widget.title} statusColor={widget.color ?? "#2DD4BF"} action={action} />
        <CardBody className="flex justify-center pt-2">
          <Donut value={widget.value} color={widget.color} label={widget.label} />
        </CardBody>
      </Card>
    );
  }

  if (widget.type === "gauge") {
    return (
      <Card>
        <CardHeader title={widget.title} action={action} />
        <CardBody className="flex justify-center pt-2">
          <Gauge value={widget.value} />
        </CardBody>
      </Card>
    );
  }

  if (widget.type !== "table") return null;
  return (
    <Card>
      <CardHeader title={widget.title} statusColor="#3B82F6" action={action} />
      <CardBody className="px-0 pb-0">
        <table className="w-full text-start text-[13px]">
          <thead>
            <tr className="border-b border-border text-text-secondary">
              {widget.columns.map((c) => (
                <th key={c} className="px-4 py-2 text-start font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {widget.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-surface-2/50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 tnum text-text-primary">
                    {typeof cell === "number" ? toFa(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
