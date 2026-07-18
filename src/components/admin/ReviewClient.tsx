"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  detectedAt: string;
  toolId: string;
  toolName: string;
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

function ChangeCard({ change }: { change: ChangeVM }) {
  const meta = metaFor(change.field);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  const run = (label: string, fn: () => Promise<void>, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    startTransition(async () => {
      try {
        await fn();
        setDone(label);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Action failed.");
      }
    });
  };

  const accent = meta.critical
    ? "border-error/40"
    : meta.kind === "alert"
      ? "border-[#FBBF24]/40"
      : "border-outline-variant/20";

  if (done) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-outline-variant/10 flex items-center gap-3 opacity-60">
        <span className="material-symbols-outlined text-[20px] text-[#10B981]">check_circle</span>
        <p className="font-body-base text-sm text-on-surface-variant">
          <span className="text-on-surface">{change.toolName}</span> — {meta.label}: {done}.
        </p>
      </div>
    );
  }

  return (
    <div className={`glass-panel rounded-xl p-5 border ${accent} flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/admin/tools/${change.toolId}/edit`}
              className="font-label-sm text-sm text-on-surface hover:text-primary transition-colors truncate"
            >
              {change.toolName}
            </Link>
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
          </div>
          <p className="font-body-base text-[11px] text-on-surface-variant mt-1 truncate">
            {change.repoUrl.replace("https://github.com/", "")}
          </p>
        </div>
      </div>

      {/* Diff */}
      {meta.kind === "image" ? (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={change.oldValue ?? ""} alt="current" className="w-14 h-14 rounded-lg object-cover border border-outline-variant/20" />
            <span className="font-body-base text-[10px] text-on-surface-variant">current</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
          <div className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={change.newValue} alt="proposed" className="w-14 h-14 rounded-lg object-cover border border-primary/40" />
            <span className="font-body-base text-[10px] text-primary">proposed</span>
          </div>
        </div>
      ) : meta.kind === "alert" ? (
        <p className="font-body-base text-[13px] text-on-surface-variant leading-relaxed">
          {change.field === "__repo_deleted__"
            ? "The GitHub API returned 404 for this repository — it was deleted or made private. The tool is still live on the site; decide whether to hide it."
            : "This repository is now archived (read-only) upstream. Decide whether to hide the tool or keep it listed."}
        </p>
      ) : meta.kind === "assets" ? (
        <p className="font-body-base text-[13px] text-on-surface-variant">
          {assetCount(change.newValue)} download asset{assetCount(change.newValue) !== 1 ? "s" : ""} proposed
          {change.oldValue ? ` (was ${assetCount(change.oldValue)})` : ""}.
        </p>
      ) : (
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
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {meta.kind === "alert" ? (
          <>
            <button
              disabled={isPending}
              onClick={() =>
                run(
                  "archived",
                  () => archiveToolFromChange(change.id),
                  `Hide "${change.toolName}" from the public directory? It becomes recoverable (soft-delete), not permanently deleted.`,
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/15 text-error hover:bg-error/25 transition-colors font-label-sm text-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">visibility_off</span>
              Archive (hide tool)
            </button>
            <button
              disabled={isPending}
              onClick={() => run("kept live", () => rejectChange(change.id))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60 transition-colors font-label-sm text-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Keep live &amp; dismiss
            </button>
          </>
        ) : (
          <>
            <button
              disabled={isPending}
              onClick={() =>
                run("applied", () =>
                  meta.kind === "assets"
                    ? publishDownloadCuration(change.id, change.newValue)
                    : applyChange(change.id),
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-sm text-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPending ? "hourglass_empty" : "done"}
              </span>
              Apply change
            </button>
            <Link
              href={`/admin/tools/${change.toolId}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60 transition-colors font-label-sm text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit manually
            </Link>
            <button
              disabled={isPending}
              onClick={() => run("dismissed", () => rejectChange(change.id))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-sm text-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ReviewClient({ changes }: { changes: ChangeVM[] }) {
  return (
    <div className="flex flex-col gap-4">
      {changes.map((change) => (
        <ChangeCard key={change.id} change={change} />
      ))}
    </div>
  );
}
