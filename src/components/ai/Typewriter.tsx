import { useEffect, useState } from "react";

/**
 * Reveals text progressively (LLM token-streaming feel). When animate=false,
 * shows the full text instantly (used in the result recap).
 */
export function Typewriter({
  text,
  cps = 60,
  animate = true,
  className,
  caret = true,
}: {
  text: string;
  cps?: number;
  animate?: boolean;
  className?: string;
  caret?: boolean;
}) {
  const [n, setN] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setN(text.length);
      return;
    }
    setN(0);
    const step = Math.max(1, Math.round(text.length / (cps * 0.5))); // ~ chars per 500ms tick scaled
    let i = 0;
    const id = setInterval(() => {
      i += Math.max(2, Math.ceil(cps / 20));
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);

  const typing = animate && n < text.length;
  return (
    <span className={className}>
      {text.slice(0, n)}
      {caret && typing && (
        <span className="ms-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-accent align-middle" />
      )}
    </span>
  );
}
