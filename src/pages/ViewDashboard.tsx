import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Clock, Pencil, Share2, Sparkles, Trash2 } from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { Button } from "@/components/ui/Button";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { InsightPanel } from "@/components/ai/InsightPanel";
import { useDashboards } from "@/store/dashboards";
import { toFa } from "@/lib/utils";
import { DASHBOARD_INSIGHTS, defaultInsight } from "@/data/insights";

export default function ViewDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dashboards } = useDashboards();
  const dash = dashboards.find((d) => d.id === id);
  const [insightOpen, setInsightOpen] = useState(false);

  if (!dash) {
    return (
      <Layout title="داشبورد یافت نشد">
        <div className="flex h-full flex-col items-center justify-center gap-3 text-text-muted">
          این داشبورد وجود ندارد یا حذف شده است.
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            بازگشت به خانه
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={dash.title} breadcrumb="داشبوردهای من">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <Clock className="size-3.5" /> آخرین ویرایش: {dash.updated} • {toFa(dash.widgets.length)} ویجت
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="size-4" /> اشتراک‌گذاری
          </Button>
          <Button variant="ghost" size="sm" className="text-danger hover:text-danger">
            <Trash2 className="size-4" /> حذف
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/builder")}>
            <Pencil className="size-4" /> ویرایش
          </Button>
          <Button size="sm" onClick={() => setInsightOpen(true)}>
            <Sparkles className="size-4" /> بینش هوشمند
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dash.widgets.map((w, i) => (
          <div
            key={i}
            className={
              w.type === "stat" || w.type === "gauge" || w.type === "donut"
                ? ""
                : "md:col-span-2"
            }
          >
            <WidgetRenderer widget={w} menu={false} />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {insightOpen && (
          <InsightPanel
            title={dash.title}
            insight={DASHBOARD_INSIGHTS[dash.id] ?? defaultInsight(dash.title)}
            onClose={() => setInsightOpen(false)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
