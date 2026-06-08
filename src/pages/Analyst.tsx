import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Check,
  ChevronDown,
  Clock,
  Cpu,
  FastForward,
  FileText,
  LayoutDashboard,
  Save,
  Search,
  Trophy,
} from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PromptBar } from "@/components/ai/PromptBar";
import { ReasoningTimeline, CitationList } from "@/components/ai/ReasoningTimeline";
import { CodeBlock } from "@/components/ai/CodeBlock";
import { HBarChart } from "@/components/charts/BarChart";
import { MiniMultiLine } from "@/components/charts/LineChart";
import { MiniGauge } from "@/components/charts/Gauge";
import { Donut } from "@/components/charts/Donut";
import { useReasoningPipeline } from "@/lib/useReasoningPipeline";
import { useDashboards } from "@/store/dashboards";
import { faNum, scoreColor, toFa } from "@/lib/utils";
import {
  ANALYST_CITATIONS,
  ANALYST_CODE,
  ANALYST_CODE_RESULT,
  ANALYST_SCRIPTS,
  ANALYST_TO_WIDGET,
  FINAL_RANKLIST,
  FIVE_LAYERS,
  KPI_WEIGHTS,
  REASONING_STEPS,
  REASONING_TOTAL_MS,
  SELECTED_KPI_CHIPS,
  SIX_MONTH_SPARKS,
} from "@/data/analyst";
import { DOC_KPI_TOTAL } from "@/data/mock";

const script = ANALYST_SCRIPTS[0];
const ANALYSIS_SECONDS = Math.round(REASONING_TOTAL_MS / 1000);

const REVEALS: Record<string, React.ReactNode> = {
  chips: (
    <div className="flex flex-wrap gap-1.5">
      {SELECTED_KPI_CHIPS.map((c) => (
        <Badge key={c} color="#2DD4BF" dot>
          {c}
        </Badge>
      ))}
    </div>
  ),
  spark: <MiniMultiLine series={SIX_MONTH_SPARKS} />,
  weights: <HBarChart data={KPI_WEIGHTS.map((w) => ({ label: w.label, value: w.value }))} unit="٪" />,
  ranklist: (
    <div className="flex flex-col gap-1.5">
      {FINAL_RANKLIST.map((r, i) => (
        <div key={r.label} className="flex items-center justify-between text-[12px]">
          <span className="text-text-secondary">
            {toFa(i + 1)}. {r.label}
          </span>
          <span className="font-bold tnum" style={{ color: scoreColor(r.value) }}>
            {toFa(r.value)}
          </span>
        </div>
      ))}
    </div>
  ),
};

// ── thinking console sidebar (progress + live telemetry + sources) ───────────
function ThinkingSidebar({ active, total, done }: { active: number; total: number; done: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setTokens((t) => t + 280 + Math.floor(Math.random() * 520));
    }, 1000);
    return () => clearInterval(id);
  }, [done]);

  const pct = done ? 100 : active < 0 ? 0 : Math.min(99, Math.round((active / total) * 100));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const retrieveDone = active > 1; // retrieve is step index 1

  return (
    <div className="sticky top-4 space-y-4">
      <Card>
        <CardBody className="flex flex-col items-center p-4">
          <Donut value={pct} color="#2DD4BF" label="پیشرفت تحلیل" size={120} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="وضعیت اجرا" statusColor="#3B82F6" />
        <CardBody className="space-y-2.5 text-[12px]">
          <Row icon={<Clock className="size-3.5" />} label="زمان سپری‌شده">
            <span className="tnum">{toFa(`${mm}:${ss}`)}</span>
          </Row>
          <Row icon={<Cpu className="size-3.5" />} label="توکن مصرفی">
            <span className="tnum">{faNum(tokens)}</span>
          </Row>
          <Row icon={<Brain className="size-3.5" />} label="مدل">
            <span>تحلیل‌یار-۱</span>
          </Row>
          <Row icon={<Search className="size-3.5" />} label="حالت">
            <span className="text-accent">استدلال عمیق</span>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="منابع ارجاع‌شده" statusColor="#22C55E" />
        <CardBody>
          {retrieveDone ? (
            <CitationList citations={ANALYST_CITATIONS} animate={false} />
          ) : (
            <div className="flex items-center gap-2 py-2 text-[12px] text-text-muted">
              <Search className="size-3.5 animate-pulse" /> در حال جستجوی منابع…
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-text-secondary">
        {icon}
        {label}
      </span>
      <span className="font-medium text-text-primary">{children}</span>
    </div>
  );
}

type Phase = "ask" | "thinking" | "result";

export default function Analyst() {
  const navigate = useNavigate();
  const { setPendingWidget } = useDashboards();
  const [phase, setPhase] = useState<Phase>("ask");
  const [question, setQuestion] = useState("");
  const [showLayers, setShowLayers] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const durations = useMemo(() => REASONING_STEPS.map((s) => s.durationMs), []);
  const { active, done, start, skip } = useReasoningPipeline(durations, 500);
  const ranRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // follow the reasoning as new steps reveal (scroll-to-bottom)
  useEffect(() => {
    if (phase === "thinking") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [active, done, phase]);

  const ask = (text: string) => {
    setQuestion(text);
    setPhase("thinking");
    ranRef.current = false;
    start();
  };

  useEffect(() => {
    if (done && !ranRef.current) {
      ranRef.current = true;
      // small deliberate pause so the reasoning stays visible before the result
      const t = setTimeout(() => setPhase("result"), 2200);
      return () => clearTimeout(t);
    }
  }, [done]);

  const buildDashboard = () => {
    setPendingWidget(ANALYST_TO_WIDGET);
    navigate("/builder");
  };

  const rankingData = FINAL_RANKLIST.map((r) => ({ label: r.label, value: r.value, color: scoreColor(r.value) }));

  return (
    <Layout title="تحلیل‌یار هوشمند" breadcrumb="پرسش تحلیلی بپرس، پاسخ مستند و قابل‌ردیابی بگیر">
      {/* STATE A — ASK */}
      {phase === "ask" && (
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Brain className="size-7" />
            </span>
            <h2 className="text-[20px] font-bold text-text-primary">یک سؤال تحلیلی بپرس</h2>
            <p className="mt-1 text-[13px] text-text-secondary">
              تحلیل‌یار اسناد را می‌خواند، کد محاسبه می‌نویسد و با استدلال گام‌به‌گام پاسخ می‌دهد.
            </p>
          </div>
          <PromptBar
            placeholder="مثلاً: کدام بیمارستان بهترین خدمات را داشته؟"
            cta="تحلیل کن"
            onSubmit={ask}
            suggestions={[
              script.question,
              "چرا راندمان اتاق عمل هاشمی‌نژاد پایین است؟",
              "راهکارهای ارتقای عملکرد اتاق عمل چیست؟",
            ]}
          />
          <button
            onClick={() => navigate("/documents")}
            className="mx-auto mt-4 flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-text-secondary transition-colors hover:text-text-primary"
          >
            <FileText className="size-3.5" /> بر اساس {DOC_KPI_TOTAL} سند شاخص بارگذاری‌شده
          </button>
        </div>
      )}

      {/* STATE B — THINKING (enterprise console) */}
      {phase === "thinking" && (
        <div>
          {/* header */}
          <Card className="mb-4">
            <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-2 text-[12px] text-accent">
                  <span className="relative inline-flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative size-2 rounded-full bg-accent" />
                  </span>
                  در حال تحلیل عمیق
                </div>
                <p className="truncate text-[15px] font-semibold text-text-primary">{question}</p>
              </div>
              <Button variant="outline" size="sm" onClick={skip}>
                <FastForward className="size-4" /> رد کردن انیمیشن
              </Button>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader title="زنجیرهٔ استدلال و محاسبه" statusColor="#2DD4BF" />
                <CardBody className="pt-2">
                  <ReasoningTimeline steps={REASONING_STEPS} active={active} reveals={REVEALS} />
                </CardBody>
              </Card>
            </div>
            <div className="lg:col-span-4">
              <ThinkingSidebar active={active} total={REASONING_STEPS.length} done={done} />
            </div>
          </div>

          {/* completion cue during the deliberate pause before the result */}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 py-2.5 text-[13px] text-success"
            >
              <Check className="size-4" /> تحلیل کامل شد — در حال آماده‌سازی نتیجه…
            </motion.div>
          )}

          <div ref={bottomRef} className="h-1" />
        </div>
      )}

      {/* STATE C — RESULT */}
      {phase === "result" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-4">
          {/* verdict */}
          <Card glow>
            <CardBody className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Trophy className="size-5" />
                </span>
                <div>
                  <div className="mb-1 text-[12px] text-text-muted">نتیجه تحلیل</div>
                  <p className="text-[17px] font-bold leading-relaxed text-text-primary">{script.verdict}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                <Badge color="#2DD4BF" dot>
                  زمان تحلیل: {toFa(ANALYSIS_SECONDS)} ثانیه
                </Badge>
                <Badge>
                  <FileText className="size-3" /> {toFa(ANALYST_CITATIONS.length)} سند ارجاع‌شده
                </Badge>
                <Badge>
                  <Cpu className="size-3" /> ۱ محاسبهٔ کد اجراشده
                </Badge>
                <Badge>حالت استدلال عمیق</Badge>
              </div>
            </CardBody>
          </Card>

          {/* ranking */}
          <Card>
            <CardHeader title="رتبه‌بندی کیفیت خدمات (۶ ماه اخیر)" statusColor="#2DD4BF" />
            <CardBody>
              <HBarChart data={rankingData} unit="امتیاز" />
            </CardBody>
          </Card>

          {/* why + recommendations */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="چرا؟ عوامل مؤثر" statusColor="#3B82F6" />
              <CardBody className="grid grid-cols-2 gap-3">
                {script.whyFactors.map((f) => (
                  <div key={f.label} className="rounded-lg border border-border bg-surface-2 p-3">
                    <div className="text-[18px] font-bold tnum text-accent">{f.value}</div>
                    <div className="mt-0.5 text-[12px] text-text-secondary">{f.label}</div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="راهکارهای پیشنهادی" statusColor="#22C55E" />
              <CardBody>
                <ul className="space-y-2.5">
                  {script.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-text-primary">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* reasoning & computation recap */}
          <Card>
            <button
              onClick={() => setShowReasoning((s) => !s)}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-[14px] font-semibold text-text-primary"
            >
              <span className="flex items-center gap-2">
                <Brain className="size-4 text-accent" /> استدلال و محاسبات مدل
              </span>
              <ChevronDown className={`size-4 transition-transform ${showReasoning ? "rotate-180" : ""}`} />
            </button>
            {showReasoning && (
              <CardBody className="space-y-3 border-t border-border pt-3">
                <div className="rounded-lg border-s-2 border-accent/40 bg-surface-2 p-3 text-[12.5px] leading-relaxed text-text-secondary">
                  {REASONING_STEPS.find((s) => s.kind === "validate")?.reason}
                </div>
                <CodeBlock code={ANALYST_CODE} result={ANALYST_CODE_RESULT} animate={false} />
                <div>
                  <div className="mb-2 text-[12px] text-text-muted">منابع ارجاع‌شده در محاسبه:</div>
                  <CitationList citations={ANALYST_CITATIONS} animate={false} />
                </div>
              </CardBody>
            )}
          </Card>

          {/* 5-layer expander */}
          <Card>
            <button
              onClick={() => setShowLayers((s) => !s)}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-[14px] font-semibold text-text-primary"
            >
              تحلیل ریشه‌ای (۵ لایه)
              <ChevronDown className={`size-4 transition-transform ${showLayers ? "rotate-180" : ""}`} />
            </button>
            {showLayers && (
              <CardBody className="space-y-3 border-t border-border pt-3">
                {FIVE_LAYERS.map((layer) => (
                  <div key={layer.name} className="flex items-center gap-4">
                    <div className="w-28 shrink-0 text-[12px] text-text-secondary">{layer.name}</div>
                    <div className="flex flex-1 justify-around">
                      {layer.items.map((it) => (
                        <MiniGauge key={it.n} value={it.v} label={it.n} />
                      ))}
                    </div>
                  </div>
                ))}
              </CardBody>
            )}
          </Card>

          {/* footer */}
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-text-muted">منابع استفاده‌شده:</span>
                {script.sources.map((s) => (
                  <Badge key={s}>
                    <FileText className="size-3" /> {s}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Save className="size-4" /> ذخیره به‌عنوان گزارش
                </Button>
                <Button size="sm" onClick={buildDashboard}>
                  <LayoutDashboard className="size-4" /> ساخت داشبورد از این تحلیل
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </Layout>
  );
}
