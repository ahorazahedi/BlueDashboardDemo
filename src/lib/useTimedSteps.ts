import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives a scripted reveal: advances an index 0..count over time, marking
 * earlier steps "done". All timers are cleared on unmount or restart, so the
 * sequence never fires on the wrong page (the hero flows depend on this).
 */
export function useTimedSteps(count: number, stepMs = 800, startDelay = 600) {
  const [active, setActive] = useState(-1); // -1 = not started / typing
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
    for (let i = 0; i < count; i++) {
      timers.current.push(
        setTimeout(() => setActive(i), startDelay + i * stepMs)
      );
    }
    timers.current.push(
      setTimeout(() => {
        setActive(count);
        setDone(true);
      }, startDelay + count * stepMs)
    );
  }, [count, stepMs, startDelay, clear]);

  const reset = useCallback(() => {
    clear();
    setActive(-1);
    setDone(false);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { active, done, start, reset };
}
