import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "critical" | "high" | "medium" | "low";
  hint?: string;
}

const variantStyles = {
  default: "border-border",
  critical: "border-severity-critical/40",
  high: "border-severity-high/40",
  medium: "border-severity-medium/40",
  low: "border-severity-low/40",
};

const iconStyles = {
  default: "text-primary",
  critical: "text-severity-critical",
  high: "text-severity-high",
  medium: "text-severity-medium",
  low: "text-severity-low",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  hint,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        variantStyles[variant],
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <Icon className={cn("h-5 w-5 shrink-0", iconStyles[variant])} />
      </div>
    </div>
  );
}
