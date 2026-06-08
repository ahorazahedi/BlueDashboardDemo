import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Chat bubble. User = right-aligned solid; assistant = left-aligned with ✨ avatar. */
export function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: ReactNode;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-se-sm bg-accent px-4 py-2.5 text-[13px] font-medium text-base">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Sparkles className="size-4" />
      </span>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl rounded-ss-sm border border-border bg-surface px-4 py-3 text-[13px] text-text-primary"
        )}
      >
        {children}
      </div>
    </div>
  );
}
