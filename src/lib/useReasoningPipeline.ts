import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives a deep-reasoning pipeline where each step has its OWN duration
 * (LLM-realistic pacing). Exposes the active index, a done flag, and a skip()
 * that jumps straight to completion (for live demos). All timers are cleared on
 * unmount / restart so steps never fire on the wrong page.
 */
export function useReasoningPipeline(durations: number[], startDelay = 500) {
  const [active, setActive] = useState(-1);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const start = useCallback(() => {
    clear();
    setDone(false);
    setActive(-1);
    let t = startDelay;
    durations.forEach((d, i) => {
      timers.current.push(setTimeout(() => setActive(i), t));
      t += d;
    });
    timers.current.push(
      setTimeout(() => {
        setActive(durations.length);
        setDone(true);
      }, t)
    );
  }, [durations, startDelay, clear]);

  const skip = useCallback(() => {
    clear();
    setActive(durations.length);
    setDone(true);
  }, [durations, clear]);

  useEffect(() => clear, [clear]);

  return { active, done, start, skip };
}
