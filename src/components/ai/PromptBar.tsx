import { useState } from "react";
import { Mic, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Large prompt input + ✨ button + suggestion chips. */
export function PromptBar({
  placeholder = "چه داشبوردی می‌خواهی بسازی؟",
  cta = "بساز",
  suggestions = [],
  onSubmit,
  big = true,
  mic = false,
}: {
  placeholder?: string;
  cta?: string;
  suggestions?: string[];
  onSubmit: (text: string) => void;
  big?: boolean;
  mic?: boolean;
}) {
  const [text, setText] = useState("");
  const submit = (t: string) => {
    const v = t.trim();
    if (v) onSubmit(v);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className={`flex items-center gap-2 rounded-2xl border border-border bg-surface ${
          big ? "p-2.5" : "p-2"
        } focus-within:border-accent/50`}
      >
        <span className="ms-2 text-accent">
          <Sparkles className={big ? "size-5" : "size-4"} />
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted ${
            big ? "text-[15px]" : "text-[13px]"
          }`}
        />
        {mic && (
          <button type="button" className="cursor-pointer rounded-lg p-2 text-text-muted hover:text-text-primary" aria-label="ضبط صدا">
            <Mic className="size-4" />
          </button>
        )}
        <Button type="submit" size={big ? "md" : "sm"} className="gap-1.5">
          {cta}
          <Send className="size-4" />
        </Button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="cursor-pointer rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
