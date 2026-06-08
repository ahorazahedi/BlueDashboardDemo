import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, ArrowDownWideNarrow } from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Gauge } from "@/components/charts/Gauge";
import { HBarChart } from "@/components/charts/BarChart";
import { cn, scoreColor, toFa, PERF_SCALE, type PerfLevel } from "@/lib/utils";
import {
  UNIVERSITY_KPIS,
  HOSPITALS_FOR_KPI,
  DEPARTMENTS_FOR_KPI,
  KPI_UNIVERSITY_AVG,
} from "@/data/mock";

type Level = 1 | 2 | 3;

export default function KPI() {
  const [level, setLevel] = useState<Level>(1);
  const [kpiName, setKpiName] = useState("");
  const [hospital, setHospital] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const sortFn = <T extends { value: number }>(a: T, b: T) =>
    sortDesc ? b.value - a.value : a.value - b.value;

  const crumbs = [
    { label: "دانشگاه", onClick: () => setLevel(1), active: level === 1 },
    ...(level >= 2 ? [{ label: kpiName, onClick: () => setLevel(2), active: level === 2 }] : []),
    ...(level >= 3 ? [{ label: hospital, onClick: () => setLevel(3), active: level === 3 }] : []),
  ];

  return (
    <Layout title="ژرف‌نما" breadcrumb="شاخص‌های کلیدی عملکرد">
      {/* breadcrumb + controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-[14px]">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronLeft className="size-4 text-text-muted" />}
              <button
                onClick={c.onClick}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-1 transition-colors",
                  c.active ? "font-semibold text-accent" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {c.label}
              </button>
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortDesc((s) => !s)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowDownWideNarrow className="size-4" /> مرتب‌سازی از بیشترین
          </button>
          <Button variant="outline" size="sm">
            <Plus className="size-4" /> افزودن شاخص دلخواه
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* LEVEL 1 — university gauges */}
        {level === 1 && (
          <motion.div
            key="l1"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
          >
            {[...UNIVERSITY_KPIS]
              .filter((k) => k.value != null)
              .sort((a, b) => sortFn({ value: a.value! }, { value: b.value! }))
              .map((k) => (
                <Card
                  key={k.name}
                  onClick={() => {
                    setKpiName(k.name);
                    setLevel(2);
                  }}
                  className="flex cursor-pointer flex-col items-center p-4 transition-colors hover:border-accent/40"
                >
                  <Gauge value={k.value!} size={108} />
                  <span className="mt-2 text-center text-[13px] text-text-secondary">{k.name}</span>
                </Card>
              ))}
          </motion.div>
        )}

        {/* LEVEL 2 — hospitals for selected KPI */}
        {level === 2 && (
          <motion.div
            key="l2"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader
                title={`${kpiName} — مقایسه بیمارستان‌ها`}
                statusColor="#2DD4BF"
                action={
                  <span className="text-[12px] text-text-muted">
                    میانگین دانشگاه: {toFa(KPI_UNIVERSITY_AVG)}
                  </span>
                }
              />
              <CardBody>
                <p className="mb-3 text-[12px] text-text-muted">
                  برای مشاهده بخش‌ها، روی یک بیمارستان کلیک کن.
                </p>
                <div className="grid gap-2">
                  {[...HOSPITALS_FOR_KPI].sort(sortFn).map((h) => (
                    <button
                      key={h.name}
                      onClick={() => {
                        setHospital(h.name);
                        setLevel(3);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-1.5 text-start transition-colors hover:border-border hover:bg-surface-2"
                    >
                      <span className="w-28 shrink-0 text-[13px] text-text-secondary">{h.name}</span>
                      <span className="relative h-7 flex-1 overflow-hidden rounded-lg bg-surface-2">
                        <span
                          className="absolute end-0 top-0 h-full rounded-lg transition-[width] duration-700"
                          style={{ width: `${h.value}%`, backgroundColor: scoreColor(h.value) }}
                        />
                        <span className="absolute start-2 top-1/2 -translate-y-1/2 text-xs font-bold tnum text-text-primary">
                          {toFa(h.value)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-text-muted">
                  <span className="inline-block h-0 w-6 border-t border-dashed border-text-muted" />
                  خط‌چین = میانگین دانشگاه ({toFa(KPI_UNIVERSITY_AVG)})
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* LEVEL 3 — departments */}
        {level === 3 && (
          <motion.div
            key="l3"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader title={`${hospital} — بخش‌ها (${kpiName})`} statusColor="#2DD4BF" />
              <CardBody>
                <HBarChart
                  data={[...DEPARTMENTS_FOR_KPI]
                    .sort(sortFn)
                    .map((d) => ({ label: d.name, value: d.value, color: scoreColor(d.value) }))}
                  unit="امتیاز"
                />
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* perf scale legend */}
      <div className="mt-5 flex flex-wrap gap-4">
        {([1, 2, 3, 4, 5] as PerfLevel[]).map((l) => (
          <span key={l} className="flex items-center gap-1.5 text-[12px] text-text-secondary">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: PERF_SCALE[l].color }} />
            {PERF_SCALE[l].label}
          </span>
        ))}
      </div>
    </Layout>
  );
}
