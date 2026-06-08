import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Building2, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const HOSPITALS = ["هاشمی‌نژاد", "شفا یحیائیان", "امام حسین", "فیروزگر", "رسول اکرم"];

export function TopBar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-base/80 px-6 backdrop-blur">
      {/* right (RTL start): title + breadcrumb */}
      <div className="min-w-0">
        <h1 className="truncate text-[18px] font-bold text-text-primary">{title}</h1>
        {breadcrumb && <p className="truncate text-xs text-text-muted">{breadcrumb}</p>}
      </div>

      {/* left: date, hospital, bell, AI pill */}
      <div className="flex items-center gap-3">
        <span className="hidden text-[13px] text-text-secondary lg:inline">
          دوشنبه، ۱۸ خرداد ۱۴۰۴
        </span>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
          >
            <Building2 className="size-4" />
            <span>بیمارستان: {hospital}</span>
            <ChevronDown className="size-3.5" />
          </button>
          {open && (
            <div className="absolute end-0 top-11 z-40 w-44 rounded-lg border border-border bg-surface-2 p-1 shadow-card">
              {HOSPITALS.map((h) => (
                <button
                  key={h}
                  onMouseDown={() => setHospital(h)}
                  className="block w-full cursor-pointer rounded-md px-3 py-1.5 text-start text-[13px] text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative cursor-pointer rounded-lg border border-border bg-surface p-2 text-text-secondary transition-colors hover:text-text-primary" aria-label="اعلان‌ها">
          <Bell className="size-4" />
          <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-surface" />
        </button>

        <Button size="sm" onClick={() => navigate("/builder")} className="gap-1.5">
          <Sparkles className="size-4" />
          بپرس از هوش مصنوعی
        </Button>
      </div>
    </header>
  );
}
