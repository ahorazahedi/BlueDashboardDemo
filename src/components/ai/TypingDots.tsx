/** Three teal dots bouncing with a 0.15s stagger — the "AI is working" cue. */
export function TypingDots() {
  return (
    <div className="flex items-center gap-1" aria-label="در حال نوشتن">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-accent animate-bounce-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
