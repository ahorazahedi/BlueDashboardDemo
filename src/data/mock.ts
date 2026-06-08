import type { ScoutMetric, Widget, SavedDashboard } from "./types";

// ───────────────────────── Builder: scripted prompt → result pairs ──────────
export interface BuilderScript {
  id: string;
  prompt: string;
  /** Streamed "thinking" shown before the steps (deeper reasoning feel). */
  thinking: string;
  steps: string[];
  /** Lead-in message shown above the follow-up example chips. */
  followLead: string;
  followUps: string[];
  /** One or more widgets to drop on the canvas (a whole dashboard if many). */
  widgets: Widget[];
}

// ── single-widget building blocks (reused by the multi-widget dashboards) ────
const W_PATIENTS_OR: Widget = {
  type: "stat",
  title: "بیماران فعلی در اتاق عمل",
  value: "۱۲",
  unit: "بیمار",
  trend: { dir: "up", label: "+۲ نسبت به امروز صبح" },
  spark: [8, 9, 7, 10, 11, 9, 12, 12],
  statusColor: "#22C55E",
};

const W_TOP_SURGEONS: Widget = {
  type: "hbar",
  title: "جراحان با بیشترین عمل (۵ ماه اخیر)",
  unit: "عمل",
  data: [
    { label: "دکتر رضایی", value: 522 },
    { label: "دکتر کریمی", value: 417 },
    { label: "دکتر موسوی", value: 389 },
    { label: "دکتر احمدی", value: 337 },
    { label: "دکتر نوری", value: 157 },
  ],
};

const W_EMERGENCY_REVENUE: Widget = {
  type: "line",
  title: "روند درآمد اورژانس (۶ ماه)",
  unit: "م.ر",
  area: true,
  delta: { value: "+۱۸٪ نسبت به دوره قبل", positive: true },
  series: [
    {
      name: "درآمد اورژانس",
      color: "#2DD4BF",
      points: [
        { label: "آذر", value: 86 },
        { label: "دی", value: 92 },
        { label: "بهمن", value: 88 },
        { label: "اسفند", value: 101 },
        { label: "فروردین", value: 110 },
        { label: "اردیبهشت", value: 120 },
      ],
    },
  ],
};

export const BUILDER_SCRIPTS: BuilderScript[] = [
  // ── multi-widget: WHOLE operating-room dashboard ──────────────────────────
  {
    id: "or-dashboard",
    prompt: "یک داشبورد کامل برای اتاق عمل بساز",
    thinking:
      "این یک درخواست ساخت داشبورد جامع است. هدف، پایش عملکرد اتاق عمل است؛ پس باید شاخص‌های لحظه‌ای (بیماران و اعمال) را در کنار شاخص‌های روند (راندمان و درآمد) و یک نمای برنامه‌ریزی (جدول اعمال) بیاورم تا هم وضعیت فعلی و هم روند با هم دیده شوند.",
    steps: [
      "در حال تحلیل درخواست…",
      "شناسایی حوزه: اتاق عمل",
      "تعیین هدف داشبورد: پایش عملکرد و بهره‌وری اتاق عمل",
      "بازیابی تعریف شاخص‌ها از اسناد استاندارد",
      "انتخاب ۶ شاخص کلیدی: بیماران، اعمال، راندمان، ظرفیت، درآمد، برنامه",
      "اتصال به منابع داده: HIS اتاق عمل + سامانه مالی",
      "استعلام دادهٔ لحظه‌ای و ۶ ماه اخیر",
      "پاک‌سازی، نرمال‌سازی و اعتبارسنجی داده‌ها",
      "تحلیل نوع هر داده برای انتخاب بهترین نمایش",
      "انتخاب نوع نمایش: عدد، گیج، میله‌ای، خطی، جدول",
      "چیدمان بهینهٔ ویجت‌ها بر اساس اهمیت",
      "تولید و رندر ویجت‌ها روی بوم…",
    ],
    followLead: "داشبورد اتاق عمل آماده است. می‌خواهی یکی از این موارد را هم اضافه کنم؟",
    followUps: [
      "نمودار روند درآمد اتاق عمل را اضافه کن",
      "میانگین مدت بستری بخش‌ها را اضافه کن",
      "ویجت تخت خالی را اضافه کن",
    ],
    widgets: [
      W_PATIENTS_OR,
      {
        type: "stat",
        title: "اعمال جراحی امروز",
        value: "۴۸",
        unit: "عمل",
        trend: { dir: "up", label: "+۶ نسبت به دیروز" },
        spark: [30, 36, 40, 44, 46, 48],
        statusColor: "#84CC16",
      },
      {
        type: "gauge",
        title: "راندمان اتاق عمل",
        value: 66,
      },
      W_TOP_SURGEONS,
      {
        type: "donut",
        title: "ظرفیت اتاق‌های عمل",
        value: 65,
        label: "میانگین اشغال امروز",
        color: "#84CC16",
      },
      {
        type: "line",
        title: "روند راندمان اتاق عمل (۶ ماه)",
        unit: "٪",
        area: true,
        delta: { value: "+۹٪ نسبت به دوره قبل", positive: true },
        series: [
          {
            name: "راندمان",
            color: "#2DD4BF",
            points: [
              { label: "آذر", value: 57 },
              { label: "دی", value: 59 },
              { label: "بهمن", value: 60 },
              { label: "اسفند", value: 62 },
              { label: "فروردین", value: 64 },
              { label: "اردیبهشت", value: 66 },
            ],
          },
        ],
      },
      {
        type: "table",
        title: "برنامهٔ اعمال امروز",
        columns: ["اتاق", "جراح", "نوع عمل", "ساعت", "وضعیت"],
        rows: [
          ["اتاق ۱", "دکتر رضایی", "تعویض مفصل زانو", "۸:۰۰", "در حال انجام"],
          ["اتاق ۲", "دکتر کریمی", "آپاندکتومی", "۸:۳۰", "در حال انجام"],
          ["اتاق ۳", "دکتر موسوی", "کوله‌سیستکتومی", "۹:۱۵", "آماده‌سازی"],
          ["اتاق ۴", "دکتر احمدی", "هرنی اینگوینال", "۱۰:۰۰", "در صف"],
          ["اتاق ۵", "دکتر نوری", "سزارین", "۱۰:۳۰", "در صف"],
        ],
      },
    ],
  },
  // ── multi-widget: WHOLE emergency dashboard ───────────────────────────────
  {
    id: "emergency-dashboard",
    prompt: "داشبورد مدیریتی اورژانس را بساز",
    thinking:
      "هدف، یک داشبورد مدیریتی برای اورژانس است. باید جریان بیمار (پذیرش)، گلوگاه‌ها (ماندگاری و تریاژ)، ظرفیت (تخت خالی) و جنبهٔ مالی (درآمد) را با هم پوشش دهم تا مدیر شیفت تصویر کاملی از وضعیت لحظه‌ای و روند داشته باشد.",
    steps: [
      "در حال تحلیل درخواست…",
      "شناسایی حوزه: اورژانس",
      "تعیین هدف داشبورد: پایش جریان و گلوگاه‌های اورژانس",
      "بازیابی تعریف شاخص‌ها از اسناد استاندارد",
      "انتخاب ۵ شاخص کلیدی: پذیرش، درآمد، ماندگاری، تریاژ، تخت خالی",
      "اتصال به منابع داده: HIS اورژانس + سامانه مالی",
      "استعلام دادهٔ لحظه‌ای و ۶ ماه اخیر",
      "پاک‌سازی، نرمال‌سازی و اعتبارسنجی داده‌ها",
      "تحلیل نوع هر داده برای انتخاب بهترین نمایش",
      "انتخاب نوع نمایش: عدد، خطی، میله‌ای، جدول",
      "چیدمان بهینهٔ ویجت‌ها بر اساس اهمیت",
      "تولید و رندر ویجت‌ها روی بوم…",
    ],
    followLead: "داشبورد اورژانس آماده است. می‌خواهی یکی از این موارد را هم اضافه کنم؟",
    followUps: [
      "هشدار ماندگاری بالای ۶ ساعت را اضافه کن",
      "نمودار روند درآمد را اضافه کن",
      "ویجت تخت خالی را اضافه کن",
    ],
    widgets: [
      {
        type: "stat",
        title: "پذیرش اورژانس امروز",
        value: "۱۳۴",
        unit: "نفر",
        trend: { dir: "up", label: "+۹ نسبت به دیروز" },
        spark: [110, 120, 118, 125, 130, 134],
        statusColor: "#EAB308",
      },
      {
        type: "stat",
        title: "بیمار ماندگار بالای ۶ ساعت",
        value: "۵",
        unit: "بیمار",
        trend: { dir: "up", label: "+۱ نسبت به شیفت قبل" },
        spark: [2, 3, 3, 4, 5, 5],
        statusColor: "#F59E0B",
      },
      W_EMERGENCY_REVENUE,
      {
        type: "bar",
        title: "پذیرش به تفکیک سطح تریاژ",
        unit: "نفر",
        data: [
          { label: "سطح ۱", value: 8, color: "#EF4444" },
          { label: "سطح ۲", value: 22, color: "#F97316" },
          { label: "سطح ۳", value: 64, color: "#EAB308" },
          { label: "سطح ۴", value: 30, color: "#84CC16" },
          { label: "سطح ۵", value: 10, color: "#22C55E" },
        ],
      },
      {
        type: "table",
        title: "بیماران بلاتکلیف اورژانس",
        columns: ["بیمار", "سطح تریاژ", "مدت حضور", "پزشک معالج"],
        rows: [
          ["ب. محمدی", "۲", "۱۴ ساعت", "دکتر صادقی"],
          ["م. حسینی", "۳", "۱۱ ساعت", "دکتر رحیمی"],
          ["ع. کاظمی", "۲", "۹ ساعت", "دکتر صادقی"],
          ["ز. اکبری", "۳", "۷ ساعت", "دکتر رحیمی"],
        ],
      },
    ],
  },
  // ── single-widget examples ────────────────────────────────────────────────
  {
    id: "patients-or",
    prompt: "تعداد بیماران فعلی در اتاق عمل",
    thinking:
      "این یک شاخص لحظه‌ای است؛ یک عدد تکی همراه با اسپارک‌لاین روند بهترین نمایش را می‌دهد تا هم مقدار فعلی و هم تغییرات اخیر در یک نگاه دیده شود.",
    steps: [
      "در حال تحلیل درخواست…",
      "شناسایی شاخص: تعداد بیماران بستری در اتاق عمل",
      "تعیین نوع شاخص: لحظه‌ای",
      "بازیابی تعریف شاخص از اسناد استاندارد",
      "اتصال به منبع داده: HIS اتاق عمل (لحظه‌ای)",
      "استعلام و اعتبارسنجی دادهٔ لحظه‌ای",
      "تحلیل نوع داده برای انتخاب بهترین نمایش",
      "انتخاب نوع نمایش: عدد تکی + اسپارک‌لاین",
      "در حال ساخت ویجت…",
    ],
    followLead: "ویجت آماده است. می‌خواهی کامل‌ترش کنم؟",
    followUps: ["نمودار روند درآمد را اضافه کن", "ویجت تخت خالی را اضافه کن"],
    widgets: [W_PATIENTS_OR],
  },
  {
    id: "top-surgeons",
    prompt: "جراحانی که بیشترین عمل را در ۵ ماه اخیر داشته‌اند",
    thinking:
      "این یک مقایسهٔ رتبه‌ای میان جراحان است؛ نمودار میله‌ای افقیِ مرتب‌شده بهترین گزینه برای خواندن سریع رتبه‌بندی و مقایسهٔ مقادیر است.",
    steps: [
      "در حال تحلیل درخواست…",
      "شناسایی شاخص: تعداد اعمال جراحی به تفکیک جراح",
      "تعیین نوع شاخص: مقایسه‌ای / رتبه‌ای",
      "بازیابی تعریف شاخص از اسناد استاندارد",
      "اتصال به منبع داده: HIS اتاق عمل (۵ ماه اخیر)",
      "استعلام و تجمیع داده به تفکیک جراح",
      "مرتب‌سازی نزولی و انتخاب ۵ جراح برتر",
      "انتخاب نوع نمایش: نمودار میله‌ای افقی",
      "در حال ساخت ویجت…",
    ],
    followLead: "ویجت آماده است. پیشنهادهای بعدی:",
    followUps: ["میانگین مدت بستری بخش‌ها را اضافه کن", "نمودار روند درآمد را اضافه کن"],
    widgets: [W_TOP_SURGEONS],
  },
  {
    id: "emergency-revenue",
    prompt: "روند درآمد اورژانس در ۶ ماه گذشته",
    thinking:
      "این یک شاخص روند زمانی است؛ نمودار خطی با محاسبهٔ اختلاف دوره، هم مسیر تغییرات و هم رشد نسبت به دورهٔ قبل را نشان می‌دهد.",
    steps: [
      "در حال تحلیل درخواست…",
      "شناسایی شاخص: درآمد اورژانس (ماهانه)",
      "تعیین نوع شاخص: روند زمانی",
      "بازیابی تعریف شاخص از اسناد استاندارد",
      "اتصال به منبع داده: سامانه مالی بیمارستان",
      "استعلام دادهٔ ۶ ماه و پاک‌سازی",
      "محاسبهٔ اختلاف دوره نسبت به بازهٔ قبل",
      "انتخاب نوع نمایش: نمودار خطی + اختلاف دوره",
      "در حال ساخت ویجت…",
    ],
    followLead: "ویجت آماده است. می‌خواهی کامل‌ترش کنم؟",
    followUps: ["ویجت تخت خالی را اضافه کن", "هشدار ماندگاری بالای ۶ ساعت را اضافه کن"],
    widgets: [W_EMERGENCY_REVENUE],
  },
  {
    id: "bed-occupancy",
    prompt: "درصد اشغال تخت ویژه را نشان بده",
    thinking:
      "این یک نسبت درصدی است؛ گیج/دونات درصدی با رنگ‌بندی استاندارد، وضعیت اشغال را در یک نگاه قابل‌فهم می‌کند.",
    steps: [
      "در حال تحلیل درخواست…",
      "شناسایی شاخص: ضریب اشغال تخت ویژه (ICU/CCU)",
      "تعیین نوع شاخص: نسبت درصدی",
      "بازیابی رنج استاندارد از اسناد",
      "اتصال به منبع داده: سامانهٔ مدیریت تخت",
      "استعلام و اعتبارسنجی دادهٔ لحظه‌ای",
      "تحلیل نوع داده برای انتخاب بهترین نمایش",
      "انتخاب نوع نمایش: گیج درصدی",
      "در حال ساخت ویجت…",
    ],
    followLead: "ویجت آماده است. پیشنهادهای بعدی:",
    followUps: ["ویجت تخت خالی را اضافه کن", "نمودار روند درآمد را اضافه کن"],
    widgets: [
      {
        type: "donut",
        title: "اشغال تخت ویژه",
        value: 65,
        label: "ICU / CCU",
        color: "#84CC16",
      },
    ],
  },
  {
    id: "los-by-ward",
    prompt: "میانگین مدت بستری به تفکیک بخش",
    thinking:
      "این یک مقایسهٔ میان بخش‌هاست؛ نمودار میله‌ای عمودی برای مقایسهٔ مقدار میان دسته‌ها مناسب‌ترین نمایش است.",
    steps: [
      "در حال تحلیل درخواست…",
      "شناسایی شاخص: میانگین مدت بستری (روز)",
      "تعیین نوع شاخص: مقایسه میان بخش‌ها",
      "بازیابی رنج استاندارد از اسناد",
      "اتصال به منبع داده: HIS بستری",
      "استعلام و تجمیع داده به تفکیک بخش",
      "تحلیل نوع داده برای انتخاب بهترین نمایش",
      "انتخاب نوع نمایش: نمودار میله‌ای عمودی",
      "در حال ساخت ویجت…",
    ],
    followLead: "ویجت آماده است. می‌خواهی کامل‌ترش کنم؟",
    followUps: ["نمودار روند درآمد را اضافه کن", "ویجت تخت خالی را اضافه کن"],
    widgets: [
      {
        type: "bar",
        title: "میانگین مدت بستری به تفکیک بخش",
        unit: "روز",
        data: [
          { label: "داخلی", value: 4 },
          { label: "جراحی", value: 3 },
          { label: "ارتوپدی", value: 5 },
          { label: "CCU", value: 6 },
          { label: "عفونی", value: 7 },
        ],
      },
    ],
  },
];

// ───────────────────────── Builder: EDIT prompts (after first build) ────────
export interface EditScript {
  id: string;
  keywords: string[];
  steps: string[];
  doneLabel: string;
  followUp?: string;
  op:
    | { type: "add"; widgets: Widget[] }
    | { type: "remove" }; // removes the last widget on the canvas
}

const EDIT_STEPS_ADD = (indicator: string, source: string, display: string) => [
  "در حال درک تغییر درخواستی…",
  "شناسایی داشبورد فعلی و ویجت‌های موجود",
  "تشخیص نوع تغییر: افزودن ویجت",
  `شناسایی شاخص جدید: ${indicator}`,
  `اتصال به منبع داده: ${source}`,
  "استعلام و اعتبارسنجی دادهٔ شاخص",
  `انتخاب نوع نمایش: ${display}`,
  "جای‌گذاری ویجت در چیدمان…",
  "به‌روزرسانی داشبورد…",
];

export const EDIT_SCRIPTS: EditScript[] = [
  {
    id: "add-staleness",
    keywords: ["ماندگاری", "ماندگار", "۶ ساعت", "6 ساعت"],
    steps: EDIT_STEPS_ADD("ماندگاری بالای ۶ ساعت", "HIS اورژانس", "کارت هشدار + روند"),
    doneLabel: "ویجت «ماندگار بالای ۶ ساعت» به داشبورد اضافه شد.",
    followUp: "می‌خواهی روند درآمد اورژانس را هم اضافه کنم؟",
    op: {
      type: "add",
      widgets: [
        {
          type: "stat",
          title: "ماندگار بالای ۶ ساعت",
          value: "۵",
          unit: "بیمار",
          trend: { dir: "up", label: "+۱ نسبت به شیفت قبل" },
          spark: [2, 3, 3, 4, 5, 5],
          statusColor: "#EF4444",
        },
      ],
    },
  },
  {
    id: "add-revenue",
    keywords: ["درآمد", "روند درآمد"],
    steps: EDIT_STEPS_ADD("روند درآمد", "سامانه مالی", "نمودار خطی"),
    doneLabel: "نمودار «روند درآمد» به داشبورد اضافه شد.",
    followUp: "می‌خواهی ویجت تخت خالی را هم اضافه کنم؟",
    op: { type: "add", widgets: [W_EMERGENCY_REVENUE] },
  },
  {
    id: "add-empty-bed",
    keywords: ["تخت خالی", "تخت"],
    steps: EDIT_STEPS_ADD("تخت خالی", "سامانهٔ مدیریت تخت", "عدد تکی + روند"),
    doneLabel: "ویجت «تخت خالی» به داشبورد اضافه شد.",
    op: {
      type: "add",
      widgets: [
        {
          type: "stat",
          title: "تخت خالی اورژانس",
          value: "۸",
          unit: "تخت",
          spark: [12, 10, 9, 8, 8, 8],
          statusColor: "#84CC16",
        },
      ],
    },
  },
  {
    id: "add-los",
    keywords: ["مدت بستری", "بستری"],
    steps: EDIT_STEPS_ADD("میانگین مدت بستری بخش‌ها", "HIS بستری", "نمودار میله‌ای"),
    doneLabel: "نمودار «میانگین مدت بستری بخش‌ها» به داشبورد اضافه شد.",
    op: {
      type: "add",
      widgets: [
        {
          type: "bar",
          title: "میانگین مدت بستری به تفکیک بخش",
          unit: "روز",
          data: [
            { label: "داخلی", value: 4 },
            { label: "جراحی", value: 3 },
            { label: "ارتوپدی", value: 5 },
            { label: "CCU", value: 6 },
            { label: "عفونی", value: 7 },
          ],
        },
      ],
    },
  },
  {
    id: "remove-widget",
    keywords: ["حذف", "پاک", "بردار"],
    steps: [
      "در حال درک تغییر درخواستی…",
      "شناسایی داشبورد فعلی و ویجت‌های موجود",
      "تشخیص نوع تغییر: حذف ویجت",
      "انتخاب ویجت هدف برای حذف",
      "حذف ویجت از چیدمان…",
      "به‌روزرسانی داشبورد…",
    ],
    doneLabel: "ویجت انتخابی از داشبورد حذف شد.",
    op: { type: "remove" },
  },
];

// default edit when no keyword matches → add an occupancy donut
export const DEFAULT_EDIT: EditScript = {
  id: "edit-default",
  keywords: [],
  steps: EDIT_STEPS_ADD("ضریب اشغال تخت", "سامانهٔ مدیریت تخت", "نمودار دونات"),
  doneLabel: "تغییر اعمال و داشبورد به‌روزرسانی شد.",
  op: {
    type: "add",
    widgets: [
      { type: "donut", title: "ضریب اشغال تخت", value: 86, label: "بخش بستری", color: "#F59E0B" },
    ],
  },
};

// ───────────────────────── Home: seeded saved dashboards ────────────────────
const OR_DASH_WIDGETS = BUILDER_SCRIPTS.find((s) => s.id === "or-dashboard")!.widgets;
const ER_DASH_WIDGETS = BUILDER_SCRIPTS.find((s) => s.id === "emergency-dashboard")!.widgets;

export const SEED_DASHBOARDS: SavedDashboard[] = [
  {
    id: "or-overview",
    title: "نمای کلی اتاق عمل",
    updated: "۱۵ خرداد ۱۴۰۴",
    widgets: OR_DASH_WIDGETS,
  },
  {
    id: "emergency-flow",
    title: "جریان اورژانس",
    updated: "۱۲ خرداد ۱۴۰۴",
    widgets: ER_DASH_WIDGETS,
  },
  {
    id: "finance-pulse",
    title: "نبض مالی بیمارستان",
    updated: "۹ خرداد ۱۴۰۴",
    widgets: [
      {
        type: "stat",
        title: "درآمد نقدی بیمارستان",
        value: "۸۴۲",
        unit: "م.ر",
        trend: { dir: "up", label: "+۵٪ نسبت به دیروز" },
        spark: [620, 700, 680, 760, 800, 842],
        statusColor: "#22C55E",
      },
      {
        type: "stat",
        title: "اعمال گلوبال با تراز منفی",
        value: "۶",
        unit: "مورد",
        trend: { dir: "up", label: "+۱ این ماه" },
        spark: [2, 3, 4, 5, 6, 6],
        statusColor: "#EF4444",
      },
      {
        type: "line",
        title: "روند درآمد کل (۶ ماه)",
        unit: "م.ر",
        area: true,
        delta: { value: "+۱۲٪ نسبت به دوره قبل", positive: true },
        series: [
          {
            name: "درآمد",
            color: "#2DD4BF",
            points: [
              { label: "آذر", value: 620 },
              { label: "دی", value: 700 },
              { label: "بهمن", value: 680 },
              { label: "اسفند", value: 760 },
              { label: "فروردین", value: 800 },
              { label: "اردیبهشت", value: 842 },
            ],
          },
        ],
      },
      {
        type: "hbar",
        title: "درآمد به تفکیک بخش",
        unit: "م.ر",
        data: [
          { label: "جراحی", value: 210 },
          { label: "ارتوپدی", value: 130 },
          { label: "اورژانس", value: 120 },
          { label: "داخلی", value: 95 },
          { label: "زنان", value: 88 },
        ],
      },
      { type: "donut", title: "تراز مالی", value: 68, label: "شاخص تراز", color: "#84CC16" },
      { type: "donut", title: "ضریب اشغال تخت", value: 86, label: "اشغال تخت عادی", color: "#F59E0B" },
    ],
  },
  {
    id: "surgeon-performance",
    title: "عملکرد جراحان",
    updated: "۷ خرداد ۱۴۰۴",
    widgets: [
      W_TOP_SURGEONS,
      {
        type: "stat",
        title: "اعمال جراحی امروز",
        value: "۴۸",
        unit: "عمل",
        trend: { dir: "up", label: "+۶ نسبت به دیروز" },
        spark: [30, 36, 40, 44, 46, 48],
        statusColor: "#84CC16",
      },
      { type: "gauge", title: "راندمان اتاق عمل", value: 66 },
      {
        type: "bar",
        title: "اعمال به تفکیک گروه جراحی",
        unit: "عمل",
        data: [
          { label: "ارتوپدی", value: 182 },
          { label: "عمومی", value: 156 },
          { label: "زنان", value: 98 },
          { label: "قلب", value: 74 },
          { label: "اعصاب", value: 52 },
        ],
      },
      {
        type: "line",
        title: "روند اعمال جراحی (۶ ماه)",
        unit: "عمل",
        area: true,
        delta: { value: "+۱۵٪ نسبت به دوره قبل", positive: true },
        series: [
          {
            name: "اعمال",
            color: "#84CC16",
            points: [
              { label: "آذر", value: 1120 },
              { label: "دی", value: 1180 },
              { label: "بهمن", value: 1150 },
              { label: "اسفند", value: 1240 },
              { label: "فروردین", value: 1290 },
              { label: "اردیبهشت", value: 1340 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bed-management",
    title: "مدیریت تخت‌ها",
    updated: "۴ خرداد ۱۴۰۴",
    widgets: [
      { type: "donut", title: "اشغال تخت عادی", value: 86, label: "بخش عادی", color: "#F59E0B" },
      { type: "donut", title: "اشغال تخت ویژه", value: 65, label: "ICU / CCU", color: "#84CC16" },
      {
        type: "stat",
        title: "تخت خالی عادی",
        value: "۱۲",
        unit: "تخت",
        spark: [20, 18, 15, 14, 13, 12],
        statusColor: "#EAB308",
      },
      {
        type: "stat",
        title: "تخت خالی ویژه",
        value: "۳",
        unit: "تخت",
        spark: [6, 5, 4, 4, 3, 3],
        statusColor: "#F59E0B",
      },
      {
        type: "bar",
        title: "میانگین مدت بستری به تفکیک بخش",
        unit: "روز",
        data: [
          { label: "داخلی", value: 4 },
          { label: "جراحی", value: 3 },
          { label: "ارتوپدی", value: 5 },
          { label: "CCU", value: 6 },
          { label: "عفونی", value: 7 },
        ],
      },
      {
        type: "line",
        title: "روند ضریب اشغال (۶ ماه)",
        unit: "٪",
        area: true,
        series: [
          {
            name: "اشغال",
            color: "#F59E0B",
            points: [
              { label: "آذر", value: 78 },
              { label: "دی", value: 80 },
              { label: "بهمن", value: 82 },
              { label: "اسفند", value: 84 },
              { label: "فروردین", value: 85 },
              { label: "اردیبهشت", value: 86 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "kpi-board",
    title: "تابلوی شاخص‌های کلیدی",
    updated: "۱ خرداد ۱۴۰۴",
    widgets: [
      { type: "gauge", title: "تراز مالی", value: 68 },
      { type: "gauge", title: "راندمان اتاق عمل", value: 66 },
      { type: "gauge", title: "نمره رضایت بیمار", value: 72 },
      { type: "gauge", title: "تراز گلوبال", value: 40 },
      { type: "gauge", title: "نمره ایمنی بیمار", value: 43 },
      { type: "gauge", title: "راندمان درمانگاه", value: 47 },
    ],
  },
];

// ───────────────────────── Live page stat cards ────────────────────────────
export interface LiveCard {
  title: string;
  value: string;
  unit?: string;
  spark?: number[];
  live?: boolean;
  statusColor?: string;
  group: string;
}

export const LIVE_CARDS: LiveCard[] = [
  { group: "مالی", title: "درآمد نقدی بیمارستان", value: "۸۴۲", unit: "م.ر", spark: [620, 700, 680, 760, 800, 842], live: true, statusColor: "#22C55E" },
  { group: "مالی", title: "درآمد اورژانس", value: "۱۲۰", unit: "م.ر", spark: [86, 92, 88, 101, 110, 120], statusColor: "#84CC16" },
  { group: "مالی", title: "بیماران بدون ودیعه", value: "۰", unit: "بیمار", spark: [3, 2, 1, 2, 0, 0], statusColor: "#22C55E" },
  { group: "مالی", title: "تعداد اعمال گلوبال با تراز منفی", value: "۶", unit: "مورد", spark: [2, 3, 4, 5, 6, 6], statusColor: "#EF4444" },

  { group: "اورژانس", title: "تعداد پذیرش اورژانس", value: "۱۳۴", unit: "نفر", spark: [110, 120, 118, 125, 130, 134], live: true, statusColor: "#EAB308" },
  { group: "اورژانس", title: "بیمار ماندگار بالای ۶ ساعت", value: "۵", unit: "بیمار", spark: [2, 3, 3, 4, 5, 5], statusColor: "#F59E0B" },
  { group: "اورژانس", title: "تعیین تکلیف بالای ۱۲ ساعت", value: "۵", unit: "بیمار", spark: [1, 2, 3, 4, 5, 5], statusColor: "#EF4444" },
  { group: "اورژانس", title: "تخت خالی اورژانس", value: "۸", unit: "تخت", spark: [12, 10, 9, 8, 8, 8], statusColor: "#84CC16" },

  { group: "بستری و اتاق عمل", title: "تعداد اعمال جراحی", value: "۴۸", unit: "عمل", spark: [30, 36, 40, 44, 46, 48], live: true, statusColor: "#84CC16" },
  { group: "بستری و اتاق عمل", title: "تعداد زایمان", value: "۶", unit: "مورد", spark: [4, 5, 3, 6, 5, 6], statusColor: "#84CC16" },
  { group: "بستری و اتاق عمل", title: "تخت خالی عادی", value: "۱۲", unit: "تخت", spark: [20, 18, 15, 14, 13, 12], statusColor: "#EAB308" },
  { group: "بستری و اتاق عمل", title: "پذیرش بستری", value: "۳۷", unit: "نفر", spark: [28, 30, 33, 35, 36, 37], statusColor: "#84CC16" },
];

export const LIVE_OCCUPANCY = [
  { title: "اشغال تخت عادی", value: 86, color: "#F59E0B" },
  { title: "اشغال تخت ویژه", value: 65, color: "#84CC16" },
];

export const TRIAGE_STACK = [
  { label: "سطح ۱", value: 8, color: "#EF4444" },
  { label: "سطح ۲", value: 22, color: "#F97316" },
  { label: "سطح ۳", value: 64, color: "#EAB308" },
  { label: "سطح ۴", value: 30, color: "#84CC16" },
  { label: "سطح ۵", value: 10, color: "#22C55E" },
];

// ───────────────────────── Scout matrix ────────────────────────────────────
export const SCOUT_DOMAINS = [
  "مالی",
  "بخش‌های بستری",
  "اورژانس",
  "اتاق‌های عمل",
  "درمانگاه",
  "پاراکلینیک",
  "نیروی انسانی",
  "دارو و لوازم مصرفی",
];

export const SCOUT_METRICS: ScoutMetric[] = [
  { domain: "اتاق‌های عمل", label: "تأخیر بیش از نیم ساعت پزشک", value: "۲", sub: "به تفکیک گروه جراحی", level: "warning", trend: [0, 1, 1, 2, 2], owner: "سوپروایزر اتاق عمل" },
  { domain: "اتاق‌های عمل", label: "درصد ظرفیت اتاق عمل", value: "۶۵٪", sub: "میانگین امروز", level: "acceptable", trend: [60, 62, 64, 63, 65], owner: "مدیر اتاق عمل" },
  { domain: "اورژانس", label: "تعیین تکلیف بالای ۱۲ ساعت", value: "۵", sub: "بیماران بلاتکلیف", level: "critical", trend: [1, 2, 3, 4, 5], owner: "سرپرستار اورژانس", action: true },
  { domain: "اورژانس", label: "بیمار ماندگار بالای ۶ ساعت", value: "۵", sub: "اورژانس داخلی", level: "warning", trend: [2, 3, 3, 4, 5], owner: "سرپرستار اورژانس" },
  { domain: "مالی", label: "تعداد اعمال گلوبال با تراز منفی", value: "۶", sub: "ماه جاری", level: "critical", trend: [2, 3, 4, 5, 6], owner: "مدیر مالی", action: true },
  { domain: "مالی", label: "بیماران بدون ودیعه", value: "۰", sub: "بخش بستری", level: "acceptable", trend: [2, 1, 1, 0, 0], owner: "واحد پذیرش" },
  { domain: "دارو و لوازم مصرفی", label: "اقلام دارویی با موجودی کمتر از ۷ روز", value: "۴۸", sub: "اقلام حیاتی", level: "critical", trend: [30, 35, 40, 45, 48], owner: "مسئول داروخانه", action: true },
  { domain: "دارو و لوازم مصرفی", label: "اقلام مصرفی رو به اتمام", value: "۱۲", sub: "لوازم اتاق عمل", level: "warning", trend: [6, 8, 9, 11, 12], owner: "انبار تجهیزات" },
  { domain: "بخش‌های بستری", label: "ضریب اشغال تخت", value: "۸۶٪", sub: "بخش داخلی", level: "warning", trend: [78, 80, 82, 84, 86], owner: "سرپرستار بستری" },
  { domain: "بخش‌های بستری", label: "میانگین مدت بستری", value: "۴.۱", sub: "روز", level: "info", trend: [4.4, 4.3, 4.2, 4.1, 4.1], owner: "مدیر پرستاری" },
  { domain: "درمانگاه", label: "میانگین زمان انتظار", value: "۳۸", sub: "دقیقه", level: "warning", trend: [30, 32, 35, 37, 38], owner: "مسئول درمانگاه" },
  { domain: "درمانگاه", label: "نوبت‌های لغوشده", value: "۹", sub: "امروز", level: "info", trend: [12, 11, 10, 9, 9], owner: "پذیرش درمانگاه" },
  { domain: "پاراکلینیک", label: "تأخیر جواب آزمایش", value: "۳", sub: "نمونه‌های اورژانسی", level: "warning", trend: [1, 1, 2, 3, 3], owner: "مسئول آزمایشگاه" },
  { domain: "پاراکلینیک", label: "صف تصویربرداری", value: "۷", sub: "بیماران بستری", level: "info", trend: [10, 9, 8, 7, 7], owner: "مسئول تصویربرداری" },
  { domain: "نیروی انسانی", label: "کسری پرستار شیفت", value: "۲", sub: "شیفت شب", level: "warning", trend: [0, 1, 1, 2, 2], owner: "مدیر پرستاری" },
  { domain: "نیروی انسانی", label: "اضافه‌کار خارج از حد مجاز", value: "۴", sub: "پرسنل", level: "info", trend: [6, 5, 5, 4, 4], owner: "منابع انسانی" },
];

// ───────────────────────── KPI deep-dive ───────────────────────────────────
export interface UniKPI {
  name: string;
  value: number | null;
}

export const UNIVERSITY_KPIS: UniKPI[] = [
  { name: "تراز مالی", value: 68 },
  { name: "تراز گلوبال", value: 40 },
  { name: "راندمان اتاق عمل", value: 66 },
  { name: "درصد اشغال تخت", value: 49 },
  { name: "نمره ایمنی بیمار", value: 43 },
  { name: "راندمان درمانگاه", value: 47 },
  { name: "درصد درآمد غیرعملیاتی", value: 43 },
  { name: "نمره اعتباربخشی", value: 43 },
  { name: "متوسط مدت بستری", value: 58 },
  { name: "راندمان تصویربرداری", value: 60 },
  { name: "درصد رضایت بیمار", value: 72 },
  { name: "درصد ثبت الکترونیک پرونده", value: 55 },
];

export const HOSPITALS_FOR_KPI = [
  { name: "هفتم تیر", value: 40 },
  { name: "هاشمی‌نژاد", value: 59 },
  { name: "رسول اکرم", value: 45 },
  { name: "فیروزگر", value: 41 },
  { name: "شهید اکبرآبادی", value: 61 },
  { name: "شفا یحیائیان", value: 81 },
  { name: "امام حسین", value: 81 },
];

export const DEPARTMENTS_FOR_KPI = [
  { name: "NICU", value: 78 },
  { name: "CCU", value: 71 },
  { name: "ارتوپدی ۱", value: 64 },
  { name: "ارتوپدی ۲", value: 58 },
  { name: "داخلی", value: 52 },
  { name: "اتاق عمل", value: 66 },
  { name: "اورژانس", value: 47 },
  { name: "جراحی", value: 69 },
  { name: "عفونی", value: 43 },
];

export const KPI_UNIVERSITY_AVG = 56;

// ───────────────────────── Documents page ──────────────────────────────────
export interface KpiDef {
  name: string;
  range: string;
  weight: string;
  owner: string;
}

export interface DocItem {
  id: string;
  name: string;
  type: string;
  count: string;
  updated: string;
  kpis: KpiDef[];
}

export const DOCUMENTS: DocItem[] = [
  {
    id: "or-kpi",
    name: "تعریف شاخص‌های اتاق عمل.pdf",
    type: "PDF",
    count: "۱۲ شاخص",
    updated: "۱۰ خرداد ۱۴۰۴",
    kpis: [
      { name: "راندمان اتاق عمل", range: "۷۰–۱۰۰", weight: "بالا", owner: "مدیر اتاق عمل" },
      { name: "میانگین ساعت شروع اولین عمل", range: "۷:۳۰–۸:۳۰", weight: "بالا", owner: "سوپروایزر اتاق عمل" },
      { name: "درصد لغو عمل", range: "۰–۵٪", weight: "متوسط", owner: "مدیر اتاق عمل" },
      { name: "تأخیر پزشک بیش از نیم ساعت", range: "۰–۲ مورد", weight: "متوسط", owner: "سوپروایزر اتاق عمل" },
    ],
  },
  {
    id: "perf-std",
    name: "استانداردهای عملکرد بیمارستان.docx",
    type: "DOCX",
    count: "۸ شاخص",
    updated: "۸ خرداد ۱۴۰۴",
    kpis: [
      { name: "ضریب اشغال تخت", range: "۷۰–۸۵٪", weight: "بالا", owner: "مدیر پرستاری" },
      { name: "متوسط مدت بستری", range: "۳–۴ روز", weight: "بالا", owner: "مدیر پرستاری" },
      { name: "درصد عفونت بیمارستانی", range: "۰–۲٪", weight: "بالا", owner: "کنترل عفونت" },
    ],
  },
  {
    id: "efficiency",
    name: "راهکارهای ارتقای راندمان.pdf",
    type: "PDF",
    count: "۱۵ راهکار",
    updated: "۵ خرداد ۱۴۰۴",
    kpis: [
      { name: "برگزاری جلسات با گروه‌های جراحی", range: "—", weight: "اقدام", owner: "ریاست بیمارستان" },
      { name: "کاهش میانگین ساعت شروع اولین عمل", range: "—", weight: "اقدام", owner: "مدیر اتاق عمل" },
      { name: "بهینه‌سازی برنامه‌ریزی اتاق عمل", range: "—", weight: "اقدام", owner: "سوپروایزر اتاق عمل" },
    ],
  },
  {
    id: "safety",
    name: "شاخص‌های ایمنی و رضایت بیمار.xlsx",
    type: "XLSX",
    count: "۹ شاخص",
    updated: "۲ خرداد ۱۴۰۴",
    kpis: [
      { name: "نمره رضایت بیمار", range: "۸۰–۱۰۰", weight: "بالا", owner: "واحد بهبود کیفیت" },
      { name: "نمره ایمنی بیمار", range: "۷۰–۱۰۰", weight: "بالا", owner: "واحد بهبود کیفیت" },
      { name: "تعیین تکلیف زیر ۶ ساعت اورژانس", range: "۸۰–۱۰۰٪", weight: "متوسط", owner: "سرپرستار اورژانس" },
    ],
  },
];

export const DOC_KPI_TOTAL = "۲۴";

// ───────────────────────── Data-lake health (Home overview) ─────────────────
export interface DataLakeStat {
  title: string;
  value: string;
  unit: string;
  spark: number[];
  statusColor: string;
}

export const DATA_LAKE_STATS: DataLakeStat[] = [
  { title: "حجم کل داده", value: "۲٫۴", unit: "ترابایت", spark: [1.6, 1.8, 1.9, 2.1, 2.3, 2.4], statusColor: "#2DD4BF" },
  { title: "تعداد کل رکوردها", value: "۱۸٫۶", unit: "میلیون", spark: [12, 14, 15, 16, 17.5, 18.6], statusColor: "#3B82F6" },
  { title: "منابع داده متصل", value: "۷", unit: "از ۸", spark: [5, 6, 6, 7, 7, 7], statusColor: "#84CC16" },
  { title: "میانگین تأخیر همگام‌سازی", value: "۱٫۲", unit: "ثانیه", spark: [2.4, 2.0, 1.8, 1.5, 1.3, 1.2], statusColor: "#22C55E" },
];

/** Overall data-quality score (donut, percent). */
export const DATA_LAKE_QUALITY = 94;

/** Millions of records per connected source (horizontal bar). */
export const DATA_LAKE_BY_SOURCE = [
  { label: "HIS بستری", value: 8.2 },
  { label: "سامانه مالی", value: 3.1 },
  { label: "آزمایشگاه", value: 2.4 },
  { label: "تصویربرداری", value: 1.9 },
  { label: "داروخانه", value: 1.6 },
  { label: "پذیرش", value: 1.4 },
];

export type SourceStatus = "healthy" | "syncing" | "delayed" | "offline";

export interface DataSource {
  name: string;
  status: SourceStatus;
  lastSync: string;
  records: string;
}

export const DATA_LAKE_SOURCES: DataSource[] = [
  { name: "HIS بستری و اتاق عمل", status: "healthy", lastSync: "۳۰ ثانیه پیش", records: "۸٫۲ م" },
  { name: "سامانهٔ مالی (HUMS)", status: "healthy", lastSync: "۱ دقیقه پیش", records: "۳٫۱ م" },
  { name: "سامانهٔ آزمایشگاه (LIS)", status: "syncing", lastSync: "در حال همگام‌سازی", records: "۲٫۴ م" },
  { name: "سامانهٔ تصویربرداری (PACS)", status: "healthy", lastSync: "۲ دقیقه پیش", records: "۱٫۹ م" },
  { name: "سامانهٔ داروخانه", status: "healthy", lastSync: "۴۵ ثانیه پیش", records: "۱٫۶ م" },
  { name: "سامانهٔ پذیرش و ترخیص", status: "delayed", lastSync: "۱۴ دقیقه پیش", records: "۱٫۴ م" },
  { name: "سامانهٔ منابع انسانی", status: "healthy", lastSync: "۵ دقیقه پیش", records: "۰٫۹ م" },
  { name: "سامانهٔ انبار و تجهیزات", status: "offline", lastSync: "اتصال برقرار نشد", records: "—" },
];

export const SOURCE_STATUS_META: Record<SourceStatus, { color: string; label: string }> = {
  healthy: { color: "#22C55E", label: "سالم" },
  syncing: { color: "#3B82F6", label: "در حال همگام‌سازی" },
  delayed: { color: "#F59E0B", label: "تأخیر" },
  offline: { color: "#EF4444", label: "قطع" },
};

/** Daily ingestion trend over 6 months (line). */
export const DATA_LAKE_INGESTION = {
  type: "line" as const,
  title: "روند ورود دادهٔ روزانه (۶ ماه)",
  unit: "هزار رکورد/روز",
  area: true,
  delta: { value: "+۲۲٪ نسبت به دوره قبل", positive: true },
  series: [
    {
      name: "رکورد ورودی",
      color: "#2DD4BF",
      points: [
        { label: "آذر", value: 142 },
        { label: "دی", value: 151 },
        { label: "بهمن", value: 149 },
        { label: "اسفند", value: 163 },
        { label: "فروردین", value: 168 },
        { label: "اردیبهشت", value: 174 },
      ],
    },
  ],
};
