import { Radio } from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/widgets/StatCard";
import { Donut } from "@/components/charts/Donut";
import { LIVE_CARDS, LIVE_OCCUPANCY, TRIAGE_STACK } from "@/data/mock";
import { toFa } from "@/lib/utils";

const GROUPS = ["مالی", "اورژانس", "بستری و اتاق عمل"];

export default function Live() {
  return (
    <Layout title="لحظه‌نما" breadcrumb="نمای زنده فعالیت بیمارستان">
      <div className="mb-5 flex items-center justify-between">
        <Badge color="#22C55E" dot className="text-[13px]">
          <Radio className="size-3.5" /> به‌روزرسانی زنده • ۳۰ ثانیه پیش
        </Badge>
        <span className="text-xs text-text-muted">بیمارستان هاشمی‌نژاد</span>
      </div>

      {GROUPS.map((group) => (
        <section key={group} className="mb-7">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-text-secondary">
            <span className="h-4 w-1 rounded-full bg-accent" />
            {group}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {LIVE_CARDS.filter((c) => c.group === group).map((c) => (
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
        </section>
      ))}

      {/* occupancy + triage */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="درصد اشغال تخت" statusColor="#F59E0B" />
          <CardBody className="flex justify-around pt-2">
            {LIVE_OCCUPANCY.map((o) => (
              <Donut key={o.title} value={o.value} color={o.color} label={o.title} size={110} />
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="پذیرش اورژانس به تفکیک سطح تریاژ" statusColor="#EAB308" />
          <CardBody>
            <div className="mb-3 flex h-9 w-full overflow-hidden rounded-lg" dir="rtl">
              {TRIAGE_STACK.map((t) => {
                const total = TRIAGE_STACK.reduce((s, x) => s + x.value, 0);
                return (
                  <div
                    key={t.label}
                    className="flex items-center justify-center text-[11px] font-semibold text-base"
                    style={{ width: `${(t.value / total) * 100}%`, backgroundColor: t.color }}
                    title={t.label}
                  >
                    {toFa(t.value)}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              {TRIAGE_STACK.map((t) => (
                <span key={t.label} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="size-2.5 rounded-sm" style={{ backgroundColor: t.color }} />
                  {t.label}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
    </Layout>
  );
}
