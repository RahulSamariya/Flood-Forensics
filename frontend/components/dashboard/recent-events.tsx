"use client";

export function RecentEvents() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Recent Events & Recommendations</h2>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Event history and AI recommendations populate after Phase 2–4.
        </p>
      </div>
    </div>
  );
}
