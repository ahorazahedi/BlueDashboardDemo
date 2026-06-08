import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert any Latin digits in a string/number to Persian digits. */
export function toFa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);
}

/** Format a number with thousands separators, then Persian digits. */
export function faNum(n: number, opts?: Intl.NumberFormatOptions): string {
  const formatted = new Intl.NumberFormat("en-US", opts).format(n);
  return toFa(formatted);
}

/** Percentage string with Persian digits + ٪ sign. */
export function faPct(n: number): string {
  return `${toFa(n)}٪`;
}

/** Signed delta with Persian digits and +/- (Persian uses + before for RTL clarity). */
export function faDelta(n: number, suffix = ""): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${toFa(Math.abs(n))}${suffix}`;
}

/** 5-level performance scale → color token + label. */
export type PerfLevel = 1 | 2 | 3 | 4 | 5;
export const PERF_SCALE: Record<PerfLevel, { color: string; label: string }> = {
  1: { color: "#EF4444", label: "خیلی ضعیف" },
  2: { color: "#F97316", label: "ضعیف" },
  3: { color: "#EAB308", label: "متوسط" },
  4: { color: "#84CC16", label: "خوب" },
  5: { color: "#22C55E", label: "خیلی خوب" },
};

/** Map a 0–100 score to a 5-level performance bucket. */
export function scoreToLevel(score: number): PerfLevel {
  if (score < 35) return 1;
  if (score < 50) return 2;
  if (score < 65) return 3;
  if (score < 80) return 4;
  return 5;
}

export function scoreColor(score: number): string {
  return PERF_SCALE[scoreToLevel(score)].color;
}

/** 4-level alarm scale (Scout). */
export type AlarmLevel = "acceptable" | "info" | "warning" | "critical";
export const ALARM_SCALE: Record<
  AlarmLevel,
  { color: string; label: string }
> = {
  acceptable: { color: "#22C55E", label: "قابل قبول" },
  info: { color: "#3B82F6", label: "جهت اطلاع" },
  warning: { color: "#F59E0B", label: "هشدار" },
  critical: { color: "#EF4444", label: "بحرانی" },
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
