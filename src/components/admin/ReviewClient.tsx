"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  applyChange,
  rejectChange,
  archiveToolFromChange,
  publishDownloadCuration,
} from "@/app/actions/adminActions";

export type ChangeVM = {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string;
  status: string; // PENDING | APPROVED | REJECTED
  detectedAt: string;
  resolvedAt: string | null;
  toolId: string;
  toolName: string;
  toolSlug: string | null;
  repoUrl: string;
};

// Field → how the card presents and which actions it offers.
//  - "alert"  : no column to write; offer Archive (hide tool) / Dismiss.
//  - others   : one-click Apply the fetched value, plus Edit + Dismiss.
type Kind = "field" | "image" | "assets" | "alert";

const FIELD_META: Record<string, { label: string; kind: Kind; critical?: boolean }> = {
  __repo_deleted__: { label: "Repository deleted or made private", kind: "alert", critical: true },
  archived: { label: "Repository archived upstream", kind: "alert" },
  heroImageUrl: { label: "Owner icon / avatar changed", kind: "image" },
  repoUrl: { label: "Repository renamed / transferred", kind: "field" },
  name: { label: "Display name changed upstream", kind: "field" },
  downloadAssets: { label: "Download assets changed", kind: "assets" },
};

function metaFor(field: string) {
  return FIELD_META[field] ?? { label: field, kind: "field" as Kind };
}

function assetCount(json: string): number {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

// Status → chip presentation for resolved records.
const STATUS_META: Record<string, { label: string; cls: string; icon: string }> = {
  PENDING: { label: "Pending", cls: "bg-primary/15 text-primary", icon: "schedule" },
  APPROVED: { label: "Applied", cls: "bg-[#10B981]/15 text-[#10B981]", icon: "check_circle" },
  REJECTED: { label: "Dismissed", cls: "bg-surface-container text-on-surface-variant", icon: "block" },
};

type FilterValue = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "PENDING", label: "Pending review" },
  { value: "REJECTED", label: "Dismissed" },
  { value: "APPROVED", label: "Applied" },
  { value: "ALL", label: "All records" },
];

// ---------------------------------------------------------------------------
// Diff renderer — shared by the card summary and the modal body.
// ---------------------------------------------------------------------------
function ChangeDiff({ change }: { change: ChangeVM }) {
  const meta = metaFor(change.field);

  if (meta.kind === "image") {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={change.oldValue ?? ""} alt="current" className="w-16 h-16 rounded-lg object-cover border border-outline-variant/20" />
          <span className="font-body-base text-[10px] text-on-surface-variant">current</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
        <div className="flex flex-col items-center gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={change.newValue} alt="proposed" className="w-16 h-16 rounded-lg object-cover border border-primary/40" />
          <span className="font-body-base text-[10px] text-primary">proposed</span>
        </div>
      </div>
    );
  }

  if (meta.kind === "alert") {
    return (
      <p className="font-body-base text-[13px] text-on-surface-variant leading-relaxed">
        {change.field === "__repo_deleted__"
          ? "The GitHub API returned 404 for this repository — it was deleted or made private. The tool is still live on the site; decide whether to hide it."
          : "This repository is now archived (read-only) upstream. Decide whether to hide the tool or keep it listed."}
      </p>
    );
  }

  if (meta.kind === "assets") {
    return (
      <p className="font-body-base text-[13px] text-on-surface-variant">
        {assetCount(change.newValue)} download asset{assetCount(change.newValue) !== 1 ? "s" : ""} proposed
        {change.oldValue ? ` (was ${assetCount(change.oldValue)})` : ""}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 font-mono-code text-[12px]">
      <div className="flex gap-2">
        <span className="text-on-surface-variant shrink-0 w-16">current</span>
        <span className="text-error/90 break-all line-through decoration-error/40">{change.oldValue || "—"}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-on-surface-variant shrink-0 w-16">proposed</span>
        <span className="text-[#10B981] break-all">{change.newValue}</span>
      </div>
    </div>
  );
}

// One-line summary of what is changing, for the collapsed card row.
function summaryLine(change: ChangeVM): string {
  const meta = metaFor(change.field);
  if (meta.kind === "assets") {
    const n = assetCount(change.newValue);
    return `${n} download asset${n !== 1 ? "s" : ""} proposed${change.oldValue ? ` (was ${assetCount(change.oldValue)})` : ""}.`;
  }
  if (meta.kind === "image") return "Owner icon / avatar changed upstream.";
  if (meta.kind === "alert") return meta.label + ".";
  return `${change.oldValue || "—"} → ${change.newValue}`;
}

// ---------------------------------------------------------------------------
// Review modal — full detail + the decision buttons.
// ---------------------------------------------------------------------------
function ReviewModal({
  change,
  onClose,
  onResolved,
}: {
  change: ChangeVM;
  onClose: () => void;
  onResolved: () => void;
}) {
  const meta = metaFor(change.field);
  const [isPending, startTransition] = useTransition();
  const isOpenForAction = change.status === "PENDING";
  const status = STATUS_META[change.status] ?? STATUS_META.PENDING;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isPending]);

  const run = (fn: () => Promise<void>, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    startTransition(async () => {
      try {
        await fn();
        onResolved();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Action failed.");
      }
    });
  };

  const editHref = `/admin/tools/${change.toolId}/edit`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !isPending && onClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="glass-panel w-full max-w-lg rounded-2xl border border-outline-variant/20 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={editHref}
              className="font-display-lg text-xl font-bold text-on-surface hover:text-primary transition-colors truncate block"
            >
              {change.toolName}
            </Link>
            <p className="font-body-base text-[11px] text-on-surface-variant mt-0.5 truncate">
              {change.repoUrl.replace("https://github.com/", "")}
            </p>
          </div>
          <button
            onClick={() => !isPending && onClose()}
            className="shrink-0 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* What changed */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-label-sm uppercase tracking-wider leading-none ${
              meta.critical
                ? "bg-error/15 text-error"
                : meta.kind === "alert"
                  ? "bg-[#FBBF24]/15 text-[#FBBF24]"
                  : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {meta.label}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm uppercase tracking-wider leading-none ${status.cls}`}>
            <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
            {status.label}
          </span>
        </div>

        <div className="rounded-xl border border-outline-variant/15 bg-surface-container/40 p-4">
          <ChangeDiff change={change} />
        </div>

        {/* Actions */}
        {isOpenForAction ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {meta.kind === "alert" ? (
              <>
                <button
                  disabled={isPending}
                  onClick={() =>
                    run(
                      () => archiveToolFromChange(change.id),
                      `Hide "${change.toolName}" from the public directory? It becomes recoverable (soft-delete), not permanently deleted.`,
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-error/15 text-error hover:bg-error/25 transition-colors font-label-sm text-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                  Archive (hide tool)
                </button>
                <button
                  disabled={isPending}
                  onClick={() => run(() => rejectChange(change.id))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-sm text-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Dismiss (keep live)
                </button>
              </>
            ) : (
              <>
                <button
                  disabled={isPending}
                  onClick={() =>
                    run(() =>
                      meta.kind === "assets"
                        ? publishDownloadCuration(change.id, change.newValue)
                        : applyChange(change.id),
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-sm text-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPending ? "hourglass_empty" : "done"}
                  </span>
                  Accept
                </button>
                <Link
                  href={editHref}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60 transition-colors font-label-sm text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit manually
                </Link>
                <button
                  disabled={isPending}
                  onClick={() => run(() => rejectChange(change.id))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-sm text-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Dismiss
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="font-body-base text-xs text-on-surface-variant pt-1">
            This change was already resolved
            {change.resolvedAt ? ` on ${new Date(change.resolvedAt).toLocaleDateString()}` : ""}.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Collapsed card — tool name, what changed, and a single "Check" button.
// ---------------------------------------------------------------------------
function ChangeCard({ change, onCheck }: { change: ChangeVM; onCheck: () => void }) {
  const meta = metaFor(change.field);
  const status = STATUS_META[change.status] ?? STATUS_META.PENDING;
  const isPending = change.status === "PENDING";

  const accent = meta.critical
    ? "border-error/40"
    : meta.kind === "alert" && isPending
      ? "border-[#FBBF24]/40"
      : "border-outline-variant/20";

  return (
    <div className={`glass-panel rounded-xl p-5 border ${accent} flex items-center justify-between gap-4 ${!isPending ? "opacity-70" : ""}`}>
      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-sm text-sm text-on-surface truncate">{change.toolName}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-label-sm uppercase tracking-wider leading-none ${
              meta.critical
                ? "bg-error/15 text-error"
                : meta.kind === "alert"
                  ? "bg-[#FBBF24]/15 text-[#FBBF24]"
                  : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {meta.label}
          </span>
          {!isPending && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm uppercase tracking-wider leading-none ${status.cls}`}>
              <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
              {status.label}
            </span>
          )}
        </div>
        <p className="font-body-base text-[12px] text-on-surface-variant truncate">
          {summaryLine(change)}
        </p>
      </div>

      <button
        onClick={onCheck}
        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-sm text-xs"
      >
        <span className="material-symbols-outlined text-[16px]">
          {isPending ? "fact_check" : "visibility"}
        </span>
        {isPending ? "Check" : "View"}
      </button>
    </div>
  );
}

export function ReviewClient({ changes }: { changes: ChangeVM[] }) {
  const [filter, setFilter] = useState<FilterValue>("PENDING");
  const [activeId, setActiveId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0, ALL: changes.length };
    for (const ch of changes) c[ch.status] = (c[ch.status] ?? 0) + 1;
    return c;
  }, [changes]);

  const visible = useMemo(
    () => (filter === "ALL" ? changes : changes.filter((c) => c.status === filter)),
    [changes, filter],
  );

  const active = activeId ? changes.find((c) => c.id === activeId) ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter dropdown */}
      <div className="flex items-center justify-end">
        <label className="flex items-center gap-2 font-label-sm text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">filter_list</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterValue)}
            className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface font-label-sm text-xs focus:outline-none focus:border-primary/60 transition-colors"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label} ({counts[f.value] ?? 0})
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
            task_alt
          </span>
          <p className="font-body-base text-sm text-on-surface-variant">
            {filter === "PENDING"
              ? "Nothing to review — every tracked repo is in sync."
              : "No records match this filter."}
          </p>
        </div>
      ) : (
        visible.map((change) => (
          <ChangeCard key={change.id} change={change} onCheck={() => setActiveId(change.id)} />
        ))
      )}

      <AnimatePresence>
        {active && (
          <ReviewModal
            key={active.id}
            change={active}
            onClose={() => setActiveId(null)}
            onResolved={() => setActiveId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
