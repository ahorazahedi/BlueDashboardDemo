import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({
  children,
  color,
  className,
  dot,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary",
        className
      )}
      style={color ? { color, borderColor: `${color}40`, backgroundColor: `${color}1a` } : undefined}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: color ?? "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}

export function StatusDot({
  color,
  pulse,
  size = 8,
}: {
  color: string;
  pulse?: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      {pulse && (
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-60"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-block rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}
