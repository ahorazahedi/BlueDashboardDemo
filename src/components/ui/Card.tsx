import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className,
  glow,
  ...props
}: HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-card",
        glow && "border-accent/50 ring-1 ring-accent/20",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  statusColor,
  action,
  className,
}: {
  title: ReactNode;
  statusColor?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-4 pt-4 pb-2",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {statusColor && (
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: statusColor }}
            aria-hidden
          />
        )}
        <h3 className="truncate text-[15px] font-semibold text-text-primary">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 pb-4", className)} {...props} />;
}
