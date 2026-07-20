"use client";

import { usePathname } from "next/navigation";
import { AppStateProvider } from "@/lib/data/store";
import { SidebarNav, Topbar, ToastStack } from "@/components/shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAgent = pathname.startsWith("/agent");

  return (
    <AppStateProvider>
      {isAgent ? (
        // Agent workspace is full-bleed dark (SPEC §3.5) — no standard chrome.
        <>{children}</>
      ) : (
        <div className="lb-shell">
          <SidebarNav />
          <div className="lb-main">
            <Topbar />
            <main className="lb-page lb-scroll">{children}</main>
          </div>
        </div>
      )}
      <ToastStack />
    </AppStateProvider>
  );
}
