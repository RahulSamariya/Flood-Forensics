"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2, XCircle } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FieldInspection } from "@/types";

export function FieldVerificationPage() {
  const inspections = useApi(() => api.fieldInspections.list());

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">Field Verification</h1>
        <p className="text-sm text-muted-foreground">
          Before/after inspection analysis with AI verification and human override.
        </p>
      </header>

      {inspections.loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading inspections…
        </div>
      )}
      {inspections.error && (
        <p className="text-sm text-severity-high">{inspections.error}</p>
      )}
      {inspections.data && inspections.data.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No field inspections recorded yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {(inspections.data ?? []).map((inspection) => (
          <InspectionCard
            key={inspection.inspection_id}
            inspection={inspection}
            onChanged={() => void inspections.refetch()}
          />
        ))}
      </div>
    </div>
  );
}

function InspectionCard({
  inspection,
  onChanged,
}: {
  inspection: FieldInspection;
  onChanged: () => void;
}) {
  const [verifying, setVerifying] = useState(false);
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [findings, setFindings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState("");

  const runVerification = async () => {
    setVerifying(true);
    setRunning(true);
    setError(null);
    try {
      const result = await api.agents.fieldVerification(inspection.inspection_id);
      setVerdict(result.verification_status);
      setFindings(result.findings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setRunning(false);
      setVerifying(false);
    }
  };

  const applyOverride = async (status: string) => {
    setOverrideStatus("");
    setError(null);
    try {
      await api.fieldInspections.override(
        inspection.inspection_id,
        status,
      );
      setVerdict(status.replace(/_/g, " ").toUpperCase());
      setFindings(["Human override applied."]);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Override failed");
    }
  };

  const blocked = (inspection.blockage_before ?? 0) > 0;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">
              {inspection.inspection_id}
            </h3>
            <p className="text-xs text-muted-foreground">
              Work {inspection.work_id ?? "—"} · Drain {inspection.drain_id} ·
              Inspector {inspection.inspector_id}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded border px-2 py-0.5 text-[11px] uppercase",
            (verdict ?? inspection.verification_status.replace(/_/g, " "))
              .includes("VERIFIED")
              ? "border-emerald-500/40 text-emerald-400"
              : (verdict ?? inspection.verification_status)
                    .includes("PARTIALLY")
                ? "border-amber-500/40 text-amber-400"
                : "border-severity-critical/40 text-severity-critical",
          )}
        >
          {verdict ??
            inspection.verification_status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3">
          <ImageSlot
            label="Before"
            src={inspection.image_before}
            blocked={blocked}
            blockage={inspection.blockage_before}
          />
          <ImageSlot
            label="After"
            src={inspection.image_after}
            blocked={false}
            blockage={inspection.blockage_after}
          />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
          <Metric label="Blockage before" value={`${inspection.blockage_before ?? "—"}%`} />
          <Metric label="Blockage after" value={`${inspection.blockage_after ?? "—"}%`} />
          <Metric label="Condition before" value={`${inspection.condition_before ?? "—"}/10`} />
          <Metric label="Condition after" value={`${inspection.condition_after ?? "—"}/10`} />
        </div>

        {inspection.notes && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="text-foreground">Notes:</span> {inspection.notes}
          </p>
        )}

        {error && <p className="mt-3 text-xs text-severity-high">{error}</p>}

        {findings.length > 0 && (
          <ul className="mt-3 space-y-1">
            {findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                {findings[0] === f && verdict === "VERIFIED" ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <span className="mt-0.5 text-primary">•</span>
                )}
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => void runVerification()}
            disabled={running}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : verifying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ClipboardCheck className="h-3.5 w-3.5" />
            )}
            Run AI Verification
          </button>

          <div className="ml-auto flex items-center gap-1">
            <select
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-muted-foreground outline-none"
            >
              <option value="">Human override…</option>
              <option value="verified">Verified</option>
              <option value="partially_verified">Partially verified</option>
              <option value="verification_failed">Verification failed</option>
            </select>
            <button
              onClick={() => void applyOverride(overrideStatus)}
              disabled={!overrideStatus}
              className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              {overrideStatus.includes("failed") ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageSlot({
  label,
  src,
  blocked,
  blockage,
}: {
  label: string;
  src?: string | null;
  blocked: boolean;
  blockage?: number | null;
}) {
  const isDemo = src?.startsWith("demo://");
  return (
    <div className="rounded border border-border bg-secondary/30 p-2">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        {blocked && blockage != null && (
          <span className="rounded border border-severity-critical/40 px-1 py-0.5 text-[10px] text-severity-critical">
            {blockage}% blocked
          </span>
        )}
      </div>
      {isDemo || !src ? (
        <div className="flex h-28 flex-col items-center justify-center rounded border border-dashed border-border bg-background text-center">
          <ClipboardCheck className="h-6 w-6 text-muted-foreground/40" />
          <p className="mt-1 text-[11px] text-muted-foreground/60">
            {src ? `Demo image: ${src.replace("demo://", "")}` : "No image"}
          </p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${label} inspection`}
          className="h-28 w-full rounded border border-border object-cover"
        />
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-secondary/40 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm font-medium">{value}</div>
    </div>
  );
}