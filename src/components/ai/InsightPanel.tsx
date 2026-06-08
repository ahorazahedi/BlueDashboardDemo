import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, FastForward, FileText, Lightbulb, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ReasoningTimeline } from "./ReasoningTimeline";
import { useReasoningPipeline } from "@/lib/useReasoningPipeline";
import type { DashboardInsight } from "@/data/insights";

/**
 * Slide-over drawer that runs an Analyst-style reasoning specific to one
 * dashboard, then shows tailored insights. Mounted only while open so its
 * timers reset cleanly on close.
 */
export function InsightPanel({
  title,
  insight,
  onClose,
}: {
  title: string;
  insight: DashboardInsight;
  onClose: () => void;
}) {
  const durations = useMemo(() => insight.steps.map((s) => s.durationMs), [insight]);
  const { active, done, start, skip } = useReasoningPipeline(durations, 400);
  const [phase, setPhase] = useState<"thinking" | "result">("thinking");
  const ranRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (phase === "thinking") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [active, done, phase]);

  useEffect(() => {
    if (done && !ranRef.current) {
      ranRef.current = true;
      const t = setTimeout(() => setPhase("result"), 1600);
      return () => clearTimeout(t);
    }
  }, [done]);

  const pct = done ? 100 : active < 0 ? 0 : Math.min(99, Math.round((active / insight.steps.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* panel on the left (RTL end) */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="absolute inset-y-0 end-0 flex w-[min(480px,92vw)] flex-col border-e border-border bg-surface"
      >
        {/* header */}
        <div className="border-b border-border">
          <div className="flex items-center justify-between gap-2 px-4 py-3.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-text-primary">بینش هوشمند داشبورد</div>
                <div className="truncate text-[11px] text-text-muted">{title}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
              aria-label="بستن"
            >
              <X className="size-4" />
            </button>
          </div>
          {/* progress */}
          <div className="h-0.5 w-full bg-surface-2">
            <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-4">
          {phase === "thinking" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] text-accent">
                  <span className="relative inline-flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative size-2 rounded-full bg-accent" />
                  </span>
                  در حال تحلیل عمیق داشبورد
                </span>
                <Button variant="outline" size="sm" onClick={skip}>
                  <FastForward className="size-3.5" /> رد کردن
                </Button>
              </div>
              <ReasoningTimeline steps={insight.steps} active={active} reveals={{}} />
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 py-2 text-[12px] text-success"
                >
                  <Check className="size-3.5" /> تحلیل کامل شد — در حال آماده‌سازی بینش…
                </motion.div>
              )}
              <div ref={bottomRef} className="h-1" />
            </>
          )}

          {phase === "result" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* verdict */}
              <div className="rounded-xl border border-accent/40 bg-accent-soft p-4">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-accent">
                  <Lightbulb className="size-3.5" /> بینش کلیدی
                </div>
                <p className="text-[14px] font-bold leading-relaxed text-text-primary">{insight.verdict}</p>
              </div>

              {/* findings */}
              <div>
                <div className="mb-2 text-[12px] font-semibold text-text-secondary">یافته‌های مؤثر</div>
                <div className="grid grid-cols-2 gap-2">
                  {insight.findings.map((f) => (
                    <div key={f.label} className="rounded-lg border border-border bg-surface-2 p-2.5">
                      <div className="text-[15px] font-bold tnum text-accent">{f.value}</div>
                      <div className="mt-0.5 text-[11px] text-text-secondary">{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* recommendations */}
              <div>
                <div className="mb-2 text-[12px] font-semibold text-text-secondary">راهکارهای پیشنهادی</div>
                <ul className="space-y-2">
                  {insight.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] text-text-primary">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* sources */}
              <div className="border-t border-border pt-3">
                <div className="mb-2 text-[11px] text-text-muted">منابع استفاده‌شده:</div>
                <div className="flex flex-wrap gap-1.5">
                  {insight.sources.map((s) => (
                    <Badge key={s}>
                      <FileText className="size-3" /> {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
