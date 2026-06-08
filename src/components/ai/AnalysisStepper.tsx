import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

/** Compact step list shown inside the Builder's AI bubble. */
export function StepList({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence>
        {steps.map((s, i) => {
          if (i > active) return null;
          const done = i < active;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 text-[13px]"
            >
              {done ? (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                  <Check className="size-3" />
                </span>
              ) : (
                <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
              )}
              <span className={done ? "text-text-muted" : "text-text-primary"}>{s}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export interface StepperItem {
  title: string;
  detail: string;
  reveal?: ReactNode;
}

/** Rich vertical timeline for the AI Analyst showpiece. */
export function AnalysisStepper({
  items,
  active,
}: {
  items: StepperItem[];
  active: number;
}) {
  return (
    <ol className="relative flex flex-col gap-1">
      {items.map((item, i) => {
        if (i > active) return null;
        const done = i < active;
        const current = i === active;
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
                  "flex size-7 shrink-0 items-center justify-center rounded-full border",
                  done
                    ? "border-success/40 bg-success/15 text-success"
                    : "border-accent/40 bg-accent-soft text-accent",
                ].join(" ")}
              >
                {done ? <Check className="size-4" /> : <Loader2 className="size-4 animate-spin" />}
              </span>
              {i < items.length - 1 && i <= active && (
                <span className="my-1 w-px flex-1 bg-border" style={{ minHeight: 12 }} />
              )}
            </div>
            {/* content */}
            <div className="flex-1 pb-4">
              <div className={done ? "text-text-secondary" : "text-text-primary"}>
                <div className="text-[14px] font-semibold">{item.title}</div>
                <div className="text-[12px] text-text-muted">{item.detail}</div>
              </div>
              {item.reveal && (current || done) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="mt-2 overflow-hidden rounded-lg border border-border bg-surface-2 p-3"
                >
                  {item.reveal}
                </motion.div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
