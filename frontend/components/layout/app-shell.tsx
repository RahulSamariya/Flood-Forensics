"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  ClipboardCheck,
  LayoutDashboard,
  Map,
  Repeat,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events/F2026-001", label: "Investigation", icon: Activity },
  { href: "/map", label: "Map", icon: Map },
  { href: "/recurrence", label: "Recurrence", icon: Repeat },
  { href: "/fixes", label: "Fixes", icon: Wrench },
  { href: "/verification", label: "Verification", icon: ClipboardCheck },
  { href: "/agents", label: "Agents", icon: Bot },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">
              Flood Forensics
            </span>
            <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
              Urban Resilience Command Center
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
            DEMO DATA
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Phase 4 — Dashboard
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-48 shrink-0 flex-col border-r border-border bg-card/50 p-2 md:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
