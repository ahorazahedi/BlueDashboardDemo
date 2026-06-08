import type { Widget } from "./types";

export interface AnalystStepDef {
  title: string;
  detail: string;
  reveal?: "chips" | "spark" | "weights" | "ranklist";
}

export interface AnalystScript {
  id: string;
  question: string;
  steps: AnalystStepDef[];
  verdict: string;
  ranking: { label: string; value: number }[];
  whyFactors: { label: string; value: string }[];
  recommendations: string[];
  sources: string[];
}

// Reveal data used inside the stepper mini-results
export const SELECTED_KPI_CHIPS = [
  "رضایت بیمار",
  "ایمنی بیمار",
  "تعیین‌تکلیف زیر ۶ ساعت",
  "متوسط مدت بستری",
];

export const SIX_MONTH_SPARKS: { name: string; color: string; points: number[] }[] = [
  { name: "شفا یحیائیان", color: "#22C55E", points: [70, 73, 75, 77, 79, 81] },
  { name: "امام حسین", color: "#84CC16", points: [72, 74, 76, 78, 80, 81] },
  { name: "شهید اکبرآبادی", color: "#EAB308", points: [55, 57, 58, 60, 60, 61] },
  { name: "هاشمی‌نژاد", color: "#F97316", points: [50, 52, 54, 56, 58, 59] },
  { name: "رسول اکرم", color: "#EF4444", points: [40, 42, 43, 44, 45, 45] },
];

export const KPI_WEIGHTS = [
  { label: "رضایت بیمار", value: 30 },
  { label: "ایمنی بیمار", value: 30 },
  { label: "تعیین‌تکلیف زیر ۶ ساعت", value: 25 },
  { label: "متوسط مدت بستری", value: 15 },
];

export const FINAL_RANKLIST = [
  { label: "شفا یحیائیان", value: 81 },
  { label: "امام حسین", value: 81 },
  { label: "شهید اکبرآبادی", value: 61 },
  { label: "هاشمی‌نژاد", value: 59 },
  { label: "رسول اکرم", value: 45 },
];

export const ANALYST_SCRIPTS: AnalystScript[] = [
  {
    id: "best-hospital",
    question: "کدام بیمارستان بر اساس KPIها در ۶ ماه گذشته بهترین خدمات را داشته؟",
    steps: [
      { title: "مطالعه اسناد شاخص‌ها", detail: "۲۴ سند KPI خوانده شد" },
      { title: "انتخاب شاخص‌های مرتبط با کیفیت خدمات", detail: "۴ شاخص کلیدی انتخاب شد", reveal: "chips" },
      { title: "استخراج داده ۶ ماه اخیر برای ۵ بیمارستان", detail: "روند ماهانه استخراج شد", reveal: "spark" },
      { title: "وزن‌دهی شاخص‌ها بر اساس اهمیت", detail: "وزن هر شاخص تعیین شد", reveal: "weights" },
      { title: "نرمال‌سازی و امتیازدهی (۰ تا ۱۰۰)", detail: "امتیاز نهایی محاسبه شد", reveal: "ranklist" },
      { title: "جمع‌بندی و تولید نتیجه", detail: "نتیجه نهایی آماده شد" },
    ],
    verdict:
      "بیمارستان شفا یحیائیان با امتیاز ۸۱ بهترین عملکرد را در کیفیت خدمات داشته است.",
    ranking: FINAL_RANKLIST,
    whyFactors: [
      { label: "بالاترین رضایت بیمار", value: "۸۸٪" },
      { label: "کمترین مدت بستری", value: "۳.۲ روز" },
      { label: "تعیین‌تکلیف زیر ۶ ساعت", value: "۹۱٪" },
      { label: "نمره ایمنی بیمار", value: "۸۴ از ۱۰۰" },
    ],
    recommendations: [
      "برگزاری جلسات منظم با گروه‌های جراحی جهت افزایش تعداد اعمال جراحی",
      "کاهش میانگین ساعت شروع اولین عمل به زیر ۸:۰۰ صبح",
      "بهینه‌سازی فرآیند تعیین‌تکلیف بیماران اورژانس برای کاهش زمان انتظار",
      "استقرار سامانه پایش لحظه‌ای ظرفیت تخت‌های ویژه",
    ],
    sources: [
      "شاخص‌های ایمنی و رضایت بیمار.xlsx",
      "استانداردهای عملکرد بیمارستان.docx",
      "راهکارهای ارتقای راندمان.pdf",
    ],
  },
];

// "Build dashboard from this analysis" → produces this widget on the Builder
export const ANALYST_TO_WIDGET: Widget = {
  type: "hbar",
  title: "رتبه‌بندی کیفیت خدمات بیمارستان‌ها (۶ ماه)",
  unit: "امتیاز",
  data: FINAL_RANKLIST.map((r) => ({ label: r.label, value: r.value })),
};

// ───────────────────────── Deep reasoning pipeline (enterprise) ─────────────
export type ReasoningKind =
  | "reason" // long streamed thinking
  | "retrieve" // grounding in documents (citations)
  | "select" // pick indicators (chips)
  | "extract" // pull 6-month data (spark)
  | "code" // generate + run calculation
  | "weight" // weighting (bar)
  | "score" // normalize + score (ranklist)
  | "validate" // sanity-check reasoning
  | "synthesize"; // final

export interface Citation {
  doc: string;
  relevance: number; // 0-100
  snippet: string;
}

export interface ReasoningStep {
  kind: ReasoningKind;
  title: string;
  detail: string;
  durationMs: number;
  reason?: string; // streamed reasoning text
  citations?: Citation[];
  code?: string;
  codeResult?: string;
  chart?: "chips" | "spark" | "weights" | "ranklist";
}

export const ANALYST_CITATIONS: Citation[] = [
  {
    doc: "شاخص‌های ایمنی و رضایت بیمار.xlsx",
    relevance: 96,
    snippet: "نمره رضایت بیمار — رنج استاندارد ۸۰ تا ۱۰۰ • نمره ایمنی بیمار — رنج ۷۰ تا ۱۰۰ • وزن: بالا",
  },
  {
    doc: "استانداردهای عملکرد بیمارستان.docx",
    relevance: 91,
    snippet: "متوسط مدت بستری — رنج استاندارد ۳ تا ۴ روز • ضریب اشغال تخت — ۷۰ تا ۸۵٪",
  },
  {
    doc: "تعریف شاخص‌های اتاق عمل.pdf",
    relevance: 79,
    snippet: "تعیین‌تکلیف زیر ۶ ساعت اورژانس — رنج ۸۰ تا ۱۰۰٪ • وزن: متوسط",
  },
  {
    doc: "راهکارهای ارتقای راندمان.pdf",
    relevance: 74,
    snippet: "برگزاری جلسات با گروه‌های جراحی • کاهش میانگین ساعت شروع اولین عمل",
  },
];

export const ANALYST_CODE = `import pandas as pd

# وزن شاخص‌های کیفیت خدمات (استخراج‌شده از اسناد استاندارد)
weights = {
    "satisfaction": 0.30,   # رضایت بیمار
    "safety":       0.30,   # ایمنی بیمار
    "disposition":  0.25,   # تعیین‌تکلیف < 6h
    "los":          0.15,   # متوسط مدت بستری (معکوس)
}

# بارگذاری دادهٔ ۶ ماه برای ۵ بیمارستان از دریاچهٔ داده
df = load_kpis(period="6m", hospitals=HOSPITALS)
df["los"] = df["los"].max() - df["los"]        # کمتر = بهتر

# نرمال‌سازی min-max به بازهٔ 0..100، سپس امتیاز وزنی
norm = (df - df.min()) / (df.max() - df.min()) * 100
df["score"] = sum(norm[k] * w for k, w in weights.items())

ranking = df.sort_values("score", ascending=False)
print(ranking[["hospital", "score"]].round(1))`;

export const ANALYST_CODE_RESULT = `>>> پردازش ۵ بیمارستان × ۶ ماه (۳۰ رکورد)
         hospital   score
0    شفا یحیائیان    81.0
1       امام حسین    81.0
2  شهید اکبرآبادی    61.0
3       هاشمی‌نژاد    59.0
4       رسول اکرم    45.0
✓ محاسبه با موفقیت انجام شد`;

export const REASONING_STEPS: ReasoningStep[] = [
  {
    kind: "reason",
    title: "درک و تجزیهٔ پرسش",
    detail: "تعریف «کیفیت خدمات» و تعیین چارچوب سنجش",
    durationMs: 3200,
    reason:
      "برای پاسخ دقیق، نخست «کیفیت خدمات» را به مؤلفه‌های قابل‌سنجش تجزیه می‌کنم. در ادبیات اعتباربخشی بیمارستانی، کیفیت خدمات عمدتاً با چهار محور سنجیده می‌شود: رضایت بیمار، ایمنی بیمار، سرعت تعیین‌تکلیف در اورژانس، و کارایی فرآیند بستری. سپس بازهٔ زمانی را به ۶ ماه اخیر محدود می‌کنم و داده‌ها را برای هر پنج بیمارستان به‌صورت هم‌مقیاس نرمال می‌کنم تا تفاوت اندازهٔ بیمارستان‌ها نتیجه را مخدوش نکند.",
  },
  {
    kind: "retrieve",
    title: "بازیابی و ارجاع به اسناد",
    detail: "جستجوی معنایی در ۲۴ سند نمایه‌شده",
    durationMs: 3000,
    citations: ANALYST_CITATIONS,
  },
  {
    kind: "select",
    title: "انتخاب شاخص‌های سنجش کیفیت",
    detail: "نگه‌داشتن شاخص‌های مرتبط با تجربه و ایمنی بیمار",
    durationMs: 2600,
    reason:
      "از میان ۲۴ شاخص موجود، شاخص‌هایی را نگه می‌دارم که مستقیماً با تجربهٔ بیمار و ایمنی مرتبط‌اند و در اسناد استاندارد وزن بالا دارند. شاخص‌های صرفاً مالی و بهره‌وری را کنار می‌گذارم، چون «کیفیت خدمات» را به‌طور مستقیم اندازه نمی‌گیرند.",
    chart: "chips",
  },
  {
    kind: "extract",
    title: "استخراج دادهٔ ۶ ماه (۵ بیمارستان)",
    detail: "کوئری از دریاچهٔ داده و پاک‌سازی مقادیر پرت",
    durationMs: 2200,
    chart: "spark",
  },
  {
    kind: "code",
    title: "تولید و اجرای کد محاسبه",
    detail: "نرمال‌سازی min-max و امتیاز وزنی در Python",
    durationMs: 4200,
    code: ANALYST_CODE,
    codeResult: ANALYST_CODE_RESULT,
  },
  {
    kind: "weight",
    title: "وزن‌دهی شاخص‌ها",
    detail: "اعمال وزن استخراج‌شده از اسناد استاندارد",
    durationMs: 2000,
    chart: "weights",
  },
  {
    kind: "score",
    title: "نرمال‌سازی و امتیازدهی (۰ تا ۱۰۰)",
    detail: "محاسبهٔ امتیاز نهایی هر بیمارستان",
    durationMs: 1900,
    chart: "ranklist",
  },
  {
    kind: "validate",
    title: "اعتبارسنجی و تحلیل حساسیت",
    detail: "بررسی هم‌امتیازی و پایداری رتبه‌بندی",
    durationMs: 2800,
    reason:
      "نتیجه را وارسی می‌کنم: دو بیمارستان شفا یحیائیان و امام حسین امتیاز برابر ۸۱ دارند. برای تفکیک، شاخص رضایت بیمار را که وزن بالاتری دارد بررسی می‌کنم؛ شفا یحیائیان در این شاخص پیشتاز است (۸۸٪ در برابر ۸۵٪) و رتبهٔ نخست را می‌گیرد. تحلیل حساسیت نشان می‌دهد تغییر ±۵٪ در وزن‌ها رتبهٔ اول را تغییر نمی‌دهد؛ پس نتیجه پایدار است.",
  },
  {
    kind: "synthesize",
    title: "جمع‌بندی و تولید پاسخ",
    detail: "تدوین حکم، عوامل مؤثر و راهکارها",
    durationMs: 1500,
  },
];

export const REASONING_TOTAL_MS = REASONING_STEPS.reduce(
  (s, x) => s + x.durationMs,
  0
);

// 5-layer root-cause expander
export const FIVE_LAYERS = [
  { name: "لایه ۱ — بیمارستان‌ها", items: [{ n: "شفا یحیائیان", v: 81 }, { n: "امام حسین", v: 81 }, { n: "هاشمی‌نژاد", v: 59 }] },
  { name: "لایه ۲ — بخش‌ها", items: [{ n: "اتاق عمل", v: 66 }, { n: "اورژانس", v: 47 }, { n: "بستری", v: 58 }] },
  { name: "لایه ۳ — شاخص‌ها", items: [{ n: "راندمان", v: 66 }, { n: "ایمنی", v: 43 }, { n: "رضایت", v: 72 }] },
  { name: "لایه ۴ — زیرشاخص‌ها", items: [{ n: "شروع اولین عمل", v: 52 }, { n: "لغو عمل", v: 71 }, { n: "تأخیر پزشک", v: 60 }] },
  { name: "لایه ۵ — گروه تخصصی", items: [{ n: "ارتوپدی", v: 64 }, { n: "عمومی", v: 69 }, { n: "زنان", v: 58 }] },
];
