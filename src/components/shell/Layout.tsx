import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/** Persistent app shell: right sidebar (RTL) + top bar + scrollable content. */
export function Layout({
  title,
  breadcrumb,
  children,
  noPad,
}: {
  title: string;
  breadcrumb?: string;
  children: ReactNode;
  noPad?: boolean;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} breadcrumb={breadcrumb} />
        <main className={`flex-1 overflow-y-auto ${noPad ? "" : "p-6"}`}>{children}</main>
      </div>
    </div>
  );
}
