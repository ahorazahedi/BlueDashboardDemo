import { useState } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FileType,
  Info,
  Search,
  UploadCloud,
} from "lucide-react";
import { Layout } from "@/components/shell/Layout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { DOCUMENTS } from "@/data/mock";

const TYPE_ICON: Record<string, typeof FileText> = {
  PDF: FileType,
  DOCX: FileText,
  XLSX: FileSpreadsheet,
};

export default function Documents() {
  const [selectedId, setSelectedId] = useState(DOCUMENTS[0].id);
  const [query, setQuery] = useState("");
  const selected = DOCUMENTS.find((d) => d.id === selectedId)!;
  const list = DOCUMENTS.filter((d) => d.name.includes(query.trim()));

  return (
    <Layout title="اسناد و شاخص‌ها" breadcrumb="پایگاه دانش تحلیل‌یار هوشمند">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        {/* RIGHT (RTL start) — list */}
        <div className="space-y-3">
          {/* upload dropzone */}
          <div className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-border bg-surface/40 p-5 text-center transition-colors hover:border-accent/40">
            <UploadCloud className="size-6 text-text-muted" />
            <span className="text-[13px] font-medium text-text-secondary">+ افزودن سند</span>
            <span className="text-[11px] text-text-muted">PDF، DOCX یا XLSX را اینجا رها کن</span>
          </div>

          {/* search */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Search className="size-4 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در اسناد…"
              className="flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>

          {/* docs */}
          {list.map((d) => {
            const Icon = TYPE_ICON[d.type] ?? FileText;
            const active = d.id === selectedId;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-start transition-colors",
                  active
                    ? "border-accent/40 bg-accent-soft"
                    : "border-border bg-surface hover:border-accent/30"
                )}
              >
                <span className={cn("mt-0.5 shrink-0", active ? "text-accent" : "text-text-muted")}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-text-primary">{d.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge>{d.type}</Badge>
                    <Badge>{d.count}</Badge>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">{d.updated}</span>
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="size-3" /> نمایه‌سازی شد
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* LEFT — detail */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-info/30 bg-info/10 px-4 py-2.5 text-[12px] text-info">
            <Info className="size-4 shrink-0" />
            این اسناد به‌صورت خودکار توسط تحلیل‌یار هوشمند استفاده می‌شوند.
          </div>

          <Card>
            <CardHeader title={selected.name} statusColor="#22C55E" />
            <CardBody className="px-0">
              <table className="w-full text-start text-[13px]">
                <thead>
                  <tr className="border-y border-border text-[12px] text-text-secondary">
                    <th className="px-4 py-2 text-start font-medium">شاخص</th>
                    <th className="px-4 py-2 text-start font-medium">رنج استاندارد</th>
                    <th className="px-4 py-2 text-start font-medium">وزن</th>
                    <th className="px-4 py-2 text-start font-medium">مالک شاخص</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.kpis.map((k) => (
                    <tr key={k.name} className="border-b border-border/60 last:border-0 hover:bg-surface-2/50">
                      <td className="px-4 py-2.5 font-medium text-text-primary">{k.name}</td>
                      <td className="px-4 py-2.5 tnum text-text-secondary">{k.range}</td>
                      <td className="px-4 py-2.5">
                        <Badge
                          color={
                            k.weight === "بالا" ? "#EF4444" : k.weight === "متوسط" ? "#F59E0B" : "#2DD4BF"
                          }
                        >
                          {k.weight}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary">{k.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
