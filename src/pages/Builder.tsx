import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Check, LayoutGrid, Pencil, Plus, Save, Sparkles, Wand2 } from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChatBubble } from "@/components/ai/ChatBubble";
import { TypingDots } from "@/components/ai/TypingDots";
import { Typewriter } from "@/components/ai/Typewriter";
import { StepList } from "@/components/ai/AnalysisStepper";
import { PromptBar } from "@/components/ai/PromptBar";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";
import { useTimedSteps } from "@/lib/useTimedSteps";
import { toFa } from "@/lib/utils";
import { useDashboards } from "@/store/dashboards";
import {
  BUILDER_SCRIPTS,
  DEFAULT_EDIT,
  EDIT_SCRIPTS,
  type BuilderScript,
  type EditScript,
} from "@/data/mock";
import type { Widget } from "@/data/types";

const EDIT_SUGGESTIONS = [
  "هشدار ماندگاری بالای ۶ ساعت را اضافه کن",
  "نمودار روند درآمد را اضافه کن",
  "میانگین مدت بستری بخش‌ها را اضافه کن",
  "ویجت تخت خالی را اضافه کن",
  "آخرین ویجت را حذف کن",
];

function matchScript(text: string): BuilderScript {
  const t = text.trim();
  const exact = BUILDER_SCRIPTS.find((s) => s.prompt === t);
  if (exact) return exact;
  const byId = (id: string) => BUILDER_SCRIPTS.find((s) => s.id === id)!;
  const wantsDashboard = /داشبورد|کامل|مدیریتی/.test(t);
  if (wantsDashboard && /اورژانس/.test(t)) return byId("emergency-dashboard");
  if (wantsDashboard && /(اتاق عمل|جراح|عمل)/.test(t)) return byId("or-dashboard");
  const kw: [string, string][] = [
    ["مدت بستری", "los-by-ward"],
    ["اشغال", "bed-occupancy"],
    ["ویژه", "bed-occupancy"],
    ["جراح", "top-surgeons"],
    ["درآمد", "emergency-revenue"],
    ["اورژانس", "emergency-revenue"],
    ["بیمار", "patients-or"],
    ["اتاق عمل", "patients-or"],
    ["عمل", "top-surgeons"],
  ];
  for (const [k, id] of kw) if (t.includes(k)) return byId(id);
  return byId("or-dashboard");
}

function matchEdit(text: string): EditScript {
  const t = text.trim();
  if (/حذف|پاک|بردار/.test(t)) return EDIT_SCRIPTS.find((e) => e.id === "remove-widget")!;
  for (const e of EDIT_SCRIPTS) {
    if (e.keywords.length && e.keywords.some((k) => t.includes(k))) return e;
  }
  return DEFAULT_EDIT;
}

interface Job {
  kind: "build" | "edit";
  thinking?: string;
  steps: string[];
  stepMs: number;
  thinkMs: number;
  doneLabel: string;
  followLead?: string;
  followUps: string[];
  apply: () => void;
}

type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; key: number; job: Job };

/** Streamed "thinking" panel shown before the steps. */
function ThinkingPanel({ text, animate }: { text: string; animate: boolean }) {
  return (
    <div className="rounded-lg border-s-2 border-accent/40 bg-surface-2 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-text-muted">
        <Brain className="size-3" /> در حال فکر کردن
      </div>
      <p className="text-[12px] leading-relaxed text-text-secondary">
        <Typewriter text={text} animate={animate} caret={animate} />
      </p>
    </div>
  );
}

/** One assistant job: thinking → scripted steps → done label + follow-up chips. */
function JobBubble({
  job,
  onFollow,
  onProgress,
}: {
  job: Job;
  onFollow: (t: string) => void;
  onProgress: () => void;
}) {
  const { active, done, start } = useTimedSteps(job.steps.length, job.stepMs, job.thinkMs);
  const fired = useRef(false);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    onProgress();
    if (done && !fired.current) {
      fired.current = true;
      job.apply();
    }
  }, [active, done, job, onProgress]);

  return (
    <ChatBubble role="assistant">
      <div className="flex flex-col gap-2">
        {job.kind === "edit" && (
          <span className="flex w-fit items-center gap-1 rounded-md bg-info/15 px-1.5 py-0.5 text-[10px] text-info">
            <Pencil className="size-2.5" /> ویرایش داشبورد
          </span>
        )}
        {job.thinking ? (
          <ThinkingPanel text={job.thinking} animate={active < 0} />
        ) : (
          active < 0 && <TypingDots />
        )}
        {active >= 0 && <StepList steps={job.steps} active={active} />}
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2 border-t border-border pt-2"
          >
            <div className="flex items-center gap-1.5 text-[13px] text-success">
              <Check className="size-3.5" /> {job.doneLabel}
            </div>
            {job.followUps.length > 0 && (
              <>
                {job.followLead && (
                  <p className="text-[12px] text-text-secondary">{job.followLead}</p>
                )}
                <div className="flex flex-col items-start gap-1.5">
                  {job.followUps.map((f) => (
                    <button
                      key={f}
                      onClick={() => onFollow(f)}
                      className="cursor-pointer rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-start text-[12px] text-accent transition-colors hover:bg-accent/15"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </ChatBubble>
  );
}

export default function Builder() {
  const navigate = useNavigate();
  const { saveDashboard, pendingPrompt, setPendingPrompt, pendingWidget, setPendingWidget } =
    useDashboards();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [saved, setSaved] = useState(false);
  const builtRef = useRef(false);
  // edit-mode UI shows once a dashboard actually exists on the canvas
  const editMode = widgets.length > 0;
  const keyRef = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);

  const addWidgets = (ws: Widget[]) => setWidgets((prev) => [...prev, ...ws]);
  const applyEdit = (op: EditScript["op"]) => {
    if (op.type === "add") addWidgets(op.widgets);
    else setWidgets((prev) => prev.slice(0, -1));
  };

  const buildJob = (script: BuilderScript): Job => {
    const n = script.widgets.length;
    return {
      kind: "build",
      thinking: script.thinking,
      steps: script.steps,
      stepMs: 700,
      thinkMs: 2600,
      followLead: script.followLead,
      followUps: script.followUps,
      doneLabel:
        n > 1
          ? `${toFa(n)} ویجت ساخته شد و داشبورد روی بوم چیده شد.`
          : "ویجت ساخته شد و به بوم اضافه شد.",
      apply: () => addWidgets(script.widgets),
    };
  };

  const editJob = (edit: EditScript): Job => ({
    kind: "edit",
    thinking:
      "تغییر درخواستی را روی داشبورد فعلی اعمال می‌کنم؛ ابتدا نوع تغییر و شاخص هدف را مشخص می‌کنم.",
    steps: edit.steps,
    stepMs: 520,
    thinkMs: 1400,
    followLead: edit.followUp ? "می‌خواهی این را هم اضافه کنم؟" : undefined,
    followUps: edit.followUp ? [edit.followUp] : [],
    doneLabel: edit.doneLabel,
    apply: () => applyEdit(edit.op),
  });

  // first prompt builds the dashboard; every prompt after that edits it
  const run = (text: string) => {
    keyRef.current += 1;
    const job = builtRef.current ? editJob(matchEdit(text)) : buildJob(matchScript(text));
    builtRef.current = true;
    setTurns((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", key: keyRef.current, job },
    ]);
  };

  // hand-off from Home (prompt) / Analyst (widget)
  useEffect(() => {
    if (pendingPrompt) {
      run(pendingPrompt);
      setPendingPrompt(null);
    }
    if (pendingWidget) {
      setWidgets((w) => [...w, pendingWidget]);
      setPendingWidget(null);
      builtRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollThread = useCallback(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollThread();
  }, [turns, scrollThread]);

  const onSave = () => {
    if (!widgets.length) return;
    const id = saveDashboard("داشبورد سفارشی من", widgets);
    setSaved(true);
    // dashboard now appears in the sidebar + home; open its saved view
    setTimeout(() => navigate(`/dashboard/${id}`), 900);
  };

  const suggestions = editMode
    ? EDIT_SUGGESTIONS
    : turns.length === 0
      ? BUILDER_SCRIPTS.map((s) => s.prompt)
      : [];

  return (
    <Layout title="داشبوردساز هوشمند" breadcrumb="یک داشبورد بساز، سپس با گفت‌وگو ویرایشش کن" noPad>
      <div className="flex h-full">
        {/* RIGHT (RTL start): chat panel */}
        <div className="flex w-[36%] min-w-[340px] flex-col border-s border-border bg-surface/40">
          <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {turns.length === 0 && (
              <div className="mt-6 text-center">
                <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Sparkles className="size-6" />
                </span>
                <p className="text-[13px] text-text-secondary">
                  اول یک داشبورد بساز؛ بعد می‌توانی با گفت‌وگو ویرایشش کنی.
                </p>
              </div>
            )}
            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <ChatBubble key={i} role="user">
                  {turn.text}
                </ChatBubble>
              ) : (
                <JobBubble key={turn.key} job={turn.job} onFollow={run} onProgress={scrollThread} />
              )
            )}
          </div>
          <div className="border-t border-border p-3">
            <PromptBar
              placeholder={editMode ? "تغییری در داشبورد بده… (افزودن/حذف ویجت)" : "چه داشبوردی می‌خواهی بسازی؟"}
              cta={editMode ? "اعمال" : "بساز"}
              big={false}
              mic
              suggestions={suggestions}
              onSubmit={run}
            />
          </div>
        </div>

        {/* LEFT: live canvas */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <LayoutGrid className="size-4" /> بوم داشبورد
              <span className="text-text-muted">({toFa(widgets.length)} ویجت)</span>
              {editMode && (
                <Badge color="#3B82F6" dot className="ms-1">
                  حالت ویرایش
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!widgets.length}>
                <Plus className="size-4" /> افزودن به صفحه
              </Button>
              <Button size="sm" onClick={onSave} disabled={!widgets.length}>
                {saved ? <Check className="size-4" /> : <Save className="size-4" />}
                {saved ? "ذخیره شد" : "ذخیره داشبورد"}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {widgets.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="mb-4 flex size-16 items-center justify-center rounded-3xl border border-dashed border-border text-text-muted">
                  <Wand2 className="size-7" />
                </span>
                <p className="text-[15px] font-medium text-text-secondary">نتیجه اینجا ساخته می‌شود</p>
                <p className="mt-1 text-[13px] text-text-muted">
                  یک درخواست بنویس تا ویجت‌ها روی این بوم ظاهر شوند.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {widgets.map((w, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className={
                      w.type === "stat" || w.type === "gauge" || w.type === "donut"
                        ? ""
                        : "md:col-span-2"
                    }
                  >
                    <WidgetRenderer widget={w} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
