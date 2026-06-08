import { motion } from "framer-motion";
import {
  Brain,
  Check,
  Code2,
  Database,
  FileSearch,
  FileText,
  ListChecks,
  ListOrdered,
  Loader2,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { Typewriter } from "./Typewriter";
import { CodeBlock } from "./CodeBlock";
import { toFa } from "@/lib/utils";
import type { Citation, ReasoningKind, ReasoningStep } from "@/data/analyst";

const KIND_ICON: Record<ReasoningKind, typeof Brain> = {
  reason: Brain,
  retrieve: FileSearch,
  select: ListChecks,
  extract: Database,
  code: Code2,
  weight: Scale,
  score: ListOrdered,
  validate: ShieldCheck,
  synthesize: Sparkles,
};

/** Documents the model "referenced", with relevance + snippet. */
export function CitationList({ citations, animate = true }: { citations: Citation[]; animate?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {citations.map((c, i) => (
        <motion.div
          key={c.doc}
          initial={animate ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animate ? i * 0.25 : 0 }}
          className="rounded-lg border border-border bg-surface-2 p-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-text-primary">
              <FileText className="size-3.5 shrink-0 text-accent" />
              <span className="truncate">{c.doc}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="h-1 w-12 overflow-hidden rounded-full bg-base">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${c.relevance}%` }} />
              </span>
              <span className="text-[10px] tnum text-accent">{toFa(c.relevance)}٪</span>
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-text-muted">{c.snippet}</p>
        </motion.div>
      ))}
    </div>
  );
}

/** A streamed "chain of thought" panel. */
function ReasonPanel({ text, animate }: { text: string; animate: boolean }) {
  return (
    <div className="rounded-lg border-s-2 border-accent/40 bg-surface-2 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-text-muted">
        <Brain className="size-3" /> زنجیرهٔ استدلال
      </div>
      <p className="text-[12.5px] leading-relaxed text-text-secondary">
        <Typewriter text={text} animate={animate} caret={animate} />
      </p>
    </div>
  );
}

export function ReasoningTimeline({
  steps,
  active,
  reveals,
}: {
  steps: ReasoningStep[];
  active: number;
  reveals: Record<string, ReactNode>;
}) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        if (i > active) return null;
        const done = i < active;
        const current = i === active;
        const Icon = KIND_ICON[step.kind];
        return (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3"
          >
            {/* rail */}
            <div className="flex flex-col items-center">
              <span
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                  done
                    ? "border-success/40 bg-success/15 text-success"
                    : "border-accent/40 bg-accent-soft text-accent",
                ].join(" ")}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              {i < steps.length - 1 && (
                <span className="my-1 w-px flex-1 bg-border" style={{ minHeight: 14 }} />
              )}
            </div>

            {/* content */}
            <div className="flex-1 pb-5">
              <div className="flex items-center gap-2">
                <span className={`text-[14px] font-semibold ${done ? "text-text-secondary" : "text-text-primary"}`}>
                  {step.title}
                </span>
                {current && <Loader2 className="size-3.5 animate-spin text-accent" />}
              </div>
              <div className="text-[12px] text-text-muted">{step.detail}</div>

              {(current || done) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-2.5"
                >
                  {step.reason && <ReasonPanel text={step.reason} animate={current} />}
                  {step.citations && <CitationList citations={step.citations} animate={current} />}
                  {step.code && (
                    <CodeBlock code={step.code} result={step.codeResult} animate={current} />
                  )}
                  {step.chart && reveals[step.chart] && (
                    <div className="rounded-lg border border-border bg-surface-2 p-3">
                      {reveals[step.chart]}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
