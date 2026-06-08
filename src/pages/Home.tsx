import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  Clock,
  Database,
  Hash,
  LineChart as LineIcon,
  PieChart,
  Plus,
  Sparkles,
  Table as TableIcon,
} from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/widgets/StatCard";
import { Sparkline } from "@/components/charts/Sparkline";
import { Gauge } from "@/components/charts/Gauge";
import { Donut } from "@/components/charts/Donut";
import { HBarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { useDashboards } from "@/store/dashboards";
import {
  LIVE_CARDS,
  LIVE_OCCUPANCY,
  SCOUT_METRICS,
  UNIVERSITY_KPIS,
  DATA_LAKE_STATS,
  DATA_LAKE_QUALITY,
  DATA_LAKE_BY_SOURCE,
  DATA_LAKE_SOURCES,
  SOURCE_STATUS_META,
  DATA_LAKE_INGESTION,
} from "@/data/mock";
import { ALARM_SCALE, scoreColor, toFa } from "@/lib/utils";
import type { SavedDashboard, Widget } from "@/data/types";

const TYPE_ICON: Record<Widget["type"], typeof Hash> = {
  stat: Hash,
  bar: BarChart3,
  hbar: BarChart3,
  line: LineIcon,
  donut: PieChart,
  gauge: PieChart,
  table: TableIcon,
};

// ── helpers ──────────────────────────────────────────────────────────────────
function SectionTitle({ children, onMore }: { children: React.ReactNode; onMore?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-[16px] font-semibold text-text-primary">
        <span className="h-4 w-1 rounded-full bg-accent" />
        {children}
      </h3>
      {onMore && (
        <button
          onClick={onMore}
          className="flex cursor-pointer items-center gap-1 text-[13px] text-text-secondary transition-colors hover:text-accent"
        >
          مشاهدهٔ کامل <ChevronLeft className="size-4" />
        </button>
      )}
    </div>
  );
}

const liveBy = (t: string) => LIVE_CARDS.find((c) => c.title === t)!;
const kpiBy = (n: string) => UNIVERSITY_KPIS.find((k) => k.name === n)!;

// ── compact saved-dashboard card (kept from before) ──────────────────────────
function Thumb({ widgets }: { widgets: Widget[] }) {
  const first = widgets[0];
  return (
    <div className="flex h-20 items-end gap-1.5 rounded-lg border border-border bg-surface-2 p-3">
      {first?.type === "stat" ? (
        <div className="flex h-full w-full flex-col justify-center">
          <span className="text-xl font-bold tnum text-accent">{first.value}</span>
          {first.spark && <Sparkline data={first.spark} width={120} height={24} />}
        </div>
      ) : first?.type === "line" ? (
        <Sparkline data={first.series[0].points.map((p) => p.value)} width={220} height={48} />
      ) : first?.type === "hbar" || first?.type === "bar" ? (
        <div className="flex h-full w-full items-end gap-1.5">
          {first.data.slice(0, 6).map((d, i) => {
            const max = Math.max(...first.data.map((x) => x.value));
            return (
              <div key={i} className="flex-1 rounded-t bg-accent/70" style={{ height: `${(d.value / max) * 100}%` }} />
            );
          })}
        </div>
      ) : (
        <div className="m-auto size-12 rounded-full border-4 border-accent/60 border-e-surface" />
      )}
    </div>
  );
}

function DashCard({ d }: { d: SavedDashboard }) {
  const navigate = useNavigate();
  const types = [...new Set(d.widgets.map((w) => w.type))];
  return (
    <Card onClick={() => navigate(`/dashboard/${d.id}`)} className="cursor-pointer p-3 transition-colors hover:border-accent/40">
      <Thumb widgets={d.widgets} />
      <div className="mt-2.5 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-text-primary">{d.title}</h3>
        <div className="flex gap-1">
          {types.map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <span key={t} className="text-text-muted">
                <Icon className="size-3.5" />
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-text-muted">
        <Clock className="size-3" /> {d.updated}
      </div>
    </Card>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { dashboards } = useDashboards();

  const critical = SCOUT_METRICS.filter((m) => m.level === "critical");
  const warning = SCOUT_METRICS.filter((m) => m.level === "warning");
  const liveSummary = [
    liveBy("درآمد نقدی بیمارستان"),
    liveBy("تعداد اعمال جراحی"),
    liveBy("تعداد پذیرش اورژانس"),
    liveBy("پذیرش بستری"),
  ];
  const kpiSnapshot = [
    kpiBy("تراز مالی"),
    kpiBy("راندمان اتاق عمل"),
    kpiBy("درصد اشغال تخت"),
    kpiBy("نمره ایمنی بیمار"),
  ];

  return (
    <Layout title="خانه" breadcrumb="نمای کلی سامانه">
      {/* hero */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary">سلام دکتر احمدی 👋</h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            نمای کلی وضعیت بیمارستان، هشدارها، شاخص‌های کلیدی و سلامت داده — یک‌جا.
          </p>
        </div>
        <Button onClick={() => navigate("/builder")} className="gap-1.5">
          <Sparkles className="size-4" /> ساخت داشبورد جدید
        </Button>
      </div>

      {/* ── row 1: today summary stat cards (from Live) ── */}
      <SectionTitle onMore={() => navigate("/live")}>خلاصهٔ وضعیت امروز</SectionTitle>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveSummary.map((c) => (
          <StatCard
            key={c.title}
            title={c.title}
            value={c.value}
            unit={c.unit}
            spark={c.spark}
            statusColor={c.statusColor}
            live={c.live}
          />
        ))}
      </div>

      {/* ── row 2: Scout + KPI + Live occupancy summaries ── */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Scout alerts */}
        <Card>
          <CardHeader title="هشدارهای فعال (دیده‌بان)" statusColor="#EF4444" />
          <CardBody>
            <div className="mb-3 flex gap-3">
              <div className="flex-1 rounded-lg border border-border bg-surface-2 p-3 text-center">
                <div className="text-2xl font-bold tnum text-danger">{toFa(critical.length)}</div>
                <div className="mt-0.5 text-[12px] text-text-secondary">بحرانی</div>
              </div>
              <div className="flex-1 rounded-lg border border-border bg-surface-2 p-3 text-center">
                <div className="text-2xl font-bold tnum text-warning">{toFa(warning.length)}</div>
                <div className="mt-0.5 text-[12px] text-text-secondary">هشدار</div>
              </div>
            </div>
            <ul className="space-y-2">
              {critical.slice(0, 3).map((m) => (
                <li key={m.label} className="flex items-center gap-2 text-[13px]">
                  <AlertTriangle className="size-3.5 shrink-0 text-danger" />
                  <span className="flex-1 truncate text-text-primary">{m.label}</span>
                  <span className="font-bold tnum text-danger">{m.value}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/scout")}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-border py-2 text-[13px] text-text-secondary transition-colors hover:text-accent"
            >
              مشاهدهٔ همهٔ هشدارها <ChevronLeft className="size-4" />
            </button>
          </CardBody>
        </Card>

        {/* KPI snapshot */}
        <Card>
          <CardHeader title="شاخص‌های کلیدی (ژرف‌نما)" statusColor="#2DD4BF" />
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              {kpiSnapshot.map((k) => (
                <div key={k.name} className="flex flex-col items-center rounded-lg border border-border bg-surface-2 p-2">
                  <Gauge value={k.value!} size={78} />
                  <span className="mt-1 text-center text-[11px] text-text-secondary">{k.name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/kpi")}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-border py-2 text-[13px] text-text-secondary transition-colors hover:text-accent"
            >
              ژرف‌نمای کامل شاخص‌ها <ChevronLeft className="size-4" />
            </button>
          </CardBody>
        </Card>

        {/* Live occupancy */}
        <Card>
          <CardHeader title="اشغال تخت (لحظه‌نما)" statusColor="#F59E0B" />
          <CardBody>
            <div className="flex justify-around py-2">
              {LIVE_OCCUPANCY.map((o) => (
                <Donut key={o.title} value={o.value} color={o.color} label={o.title} size={104} />
              ))}
            </div>
            <button
              onClick={() => navigate("/live")}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-border py-2 text-[13px] text-text-secondary transition-colors hover:text-accent"
            >
              نمای زندهٔ کامل <ChevronLeft className="size-4" />
            </button>
          </CardBody>
        </Card>
      </div>

      {/* ── row 3: data-lake health ── */}
      <SectionTitle>
        <span className="flex items-center gap-2">
          <Database className="size-4 text-accent" /> سلامت دریاچهٔ داده
        </span>
      </SectionTitle>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DATA_LAKE_STATS.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} unit={s.unit} spark={s.spark} statusColor={s.statusColor} />
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* quality + records by source */}
        <Card className="lg:col-span-2">
          <CardHeader title="کیفیت و حجم داده به تفکیک منبع" statusColor="#22C55E" />
          <CardBody className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[160px_1fr]">
            <div className="flex flex-col items-center">
              <Donut value={DATA_LAKE_QUALITY} color="#22C55E" label="کیفیت کلی داده" size={120} />
            </div>
            <HBarChart data={DATA_LAKE_BY_SOURCE} unit="م رکورد" />
          </CardBody>
        </Card>

        {/* source status list */}
        <Card>
          <CardHeader title="وضعیت اتصال منابع" statusColor="#3B82F6" />
          <CardBody className="space-y-2">
            {DATA_LAKE_SOURCES.map((src) => {
              const meta = SOURCE_STATUS_META[src.status];
              return (
                <div key={src.name} className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2">
                  <span className="relative inline-flex size-2 shrink-0">
                    {(src.status === "syncing" || src.status === "healthy") && (
                      <span className="absolute inset-0 animate-ping rounded-full opacity-50" style={{ backgroundColor: meta.color }} />
                    )}
                    <span className="relative size-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] text-text-primary">{src.name}</div>
                    <div className="text-[10px] text-text-muted">{src.lastSync}</div>
                  </div>
                  <span className="shrink-0 text-[11px] tnum text-text-secondary">{src.records}</span>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* ingestion trend */}
      <div className="mb-8">
        <Card>
          <CardHeader title={DATA_LAKE_INGESTION.title} statusColor="#2DD4BF" />
          <CardBody>
            <LineChart series={DATA_LAKE_INGESTION.series} area unit={DATA_LAKE_INGESTION.unit} height={180} />
          </CardBody>
        </Card>
      </div>

      {/* ── saved dashboards (compact) ── */}
      <SectionTitle>داشبوردهای من</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboards.map((d) => (
          <DashCard key={d.id} d={d} />
        ))}
        <button
          onClick={() => navigate("/builder")}
          className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/40 text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl border border-dashed border-border">
            <Plus className="size-5" />
          </span>
          <span className="text-[13px] font-medium">داشبورد جدید</span>
        </button>
      </div>
    </Layout>
  );
}
