import { useEffect, useState } from "react";
import { Loader2, Terminal } from "lucide-react";

/**
 * Terminal-style code panel. Types the code out (LTR, monospace), then "runs"
 * it and reveals the result. animate=false renders everything instantly
 * (used in the result recap).
 */
export function CodeBlock({
  code,
  result,
  filename = "analysis.py",
  animate = true,
}: {
  code: string;
  result?: string;
  filename?: string;
  animate?: boolean;
}) {
  const [n, setN] = useState(animate ? 0 : code.length);
  const [phase, setPhase] = useState<"typing" | "running" | "done">(
    animate ? "typing" : "done"
  );

  useEffect(() => {
    if (!animate) {
      setN(code.length);
      setPhase("done");
      return;
    }
    setN(0);
    setPhase("typing");
    let i = 0;
    const id = setInterval(() => {
      i += 5;
      setN(i);
      if (i >= code.length) {
        clearInterval(id);
        setPhase("running");
        setTimeout(() => setPhase("done"), 700);
      }
    }, 16);
    return () => clearInterval(id);
  }, [code, animate]);

  const typing = phase === "typing";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#0A0E15]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="size-2.5 rounded-full bg-text-muted/50" />
            <span className="size-2.5 rounded-full bg-text-muted/50" />
            <span className="size-2.5 rounded-full bg-text-muted/50" />
          </span>
          <span className="ms-1 text-[11px] text-text-secondary">{filename}</span>
        </div>
        <span className="flex items-center gap-1 rounded bg-info/15 px-1.5 py-0.5 text-[10px] text-info">
          <Terminal className="size-3" /> Python
        </span>
      </div>

      {/* code */}
      <pre dir="ltr" className="overflow-x-auto px-3 py-2.5 text-start font-mono text-[11.5px] leading-relaxed text-text-secondary">
        <code>
          {code.slice(0, n)}
          {typing && <span className="inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-accent" />}
        </code>
      </pre>

      {/* run status / result */}
      {phase === "running" && (
        <div className="flex items-center gap-2 border-t border-border px-3 py-2 text-[11.5px] text-accent">
          <Loader2 className="size-3.5 animate-spin" /> در حال اجرای کد…
        </div>
      )}
      {phase === "done" && result && (
        <pre dir="ltr" className="overflow-x-auto border-t border-border bg-base/60 px-3 py-2.5 text-start font-mono text-[11.5px] leading-relaxed">
          {result.split("\n").map((line, i) => {
            const color = line.startsWith("✓")
              ? "#84CC16"
              : line.startsWith(">>>")
                ? "#5B6678"
                : "#9AA6BC";
            return (
              <div key={i} style={{ color }}>
                {line || " "}
              </div>
            );
          })}
        </pre>
      )}
    </div>
  );
}
