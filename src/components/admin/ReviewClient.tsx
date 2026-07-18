"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  applyChange,
  rejectChange,
  archiveToolFromChange,
  publishDownloadCuration,
  getToolReviewDetail,
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

// Full current state of the tool, rendered read-only in the review modal so the
// admin sees the whole model — not just the one flagged line.
export type ToolDetailVM = {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  description: string;
  aboutText: string | null;
  repoUrl: string;
  imageUrl: string | null;
  heroImageUrl: string | null;
  stars: number;
  forks: number;
  issues: number;
  author: string | null;
  authorUrl: string | null;
  since: string | null;
  license: string | null;
  version: string | null;
  websiteUrl: string | null;
  downloadUrl: string | null;
  installCommand: string | null;
  downloadAssets: string | null;
  galleryImages: string | null;
  features: string | null;
  platforms: string[];
  toolTypes: string[];
  lastUpdate: string;
  lastFetchedAt: string;
  createdAt: string;
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

// Which read-only detail row a change highlights ("where it is changing").
function detailKeyFor(field: string): string {
  if (field === "__repo_deleted__" || field === "archived") return "status";
  if (field === "heroImageUrl") return "logo";
  return field;
}

function assetCount(json: string | null): number {
  if (!json) return 0;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function assetLabels(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(
      (a: Record<string, string>) => a?.name || a?.label || a?.os || a?.filename || a?.url || "asset",
    );
  } catch {
    return [];
  }
}

function installEntries(json: string | null): [string, string][] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed as Record<string, string>);
    }
  } catch {
    // Non-JSON install commands are stored as a plain string.
    return [["command", json]];
  }
  return [];
}

// Short "how much is changing" descriptor — only where a magnitude is meaningful.
function magnitude(change: ChangeVM): string | null {
  const meta = metaFor(change.field);
  if (meta.kind === "assets") {
    const oldN = assetCount(change.oldValue);
    const newN = assetCount(change.newValue);
    const delta = newN - oldN;
    return `was ${oldN} → ${newN} (${delta >= 0 ? "+" : ""}${delta})`;
  }
  return null;
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
    const oldLabels = assetLabels(change.oldValue);
    const newLabels = assetLabels(change.newValue);
    return (
      <div className="flex flex-col gap-2 font-body-base text-[13px]">
        <p className="text-on-surface-variant">
          {newLabels.length} download asset{newLabels.length !== 1 ? "s" : ""} proposed
          {change.oldValue ? ` (was ${oldLabels.length})` : ""}.
        </p>
        {newLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {newLabels.slice(0, 12).map((l, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-surface-container text-[11px] text-on-surface-variant border border-outline-variant/20 truncate max-w-[180px]">
                {l}
              </span>
            ))}
            {newLabels.length > 12 && (
              <span className="px-2 py-0.5 text-[11px] text-on-surface-variant">+{newLabels.length - 12} more</span>
            )}
          </div>
        )}
      </div>
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
// Read-only "full tool model" — every field the modal shows for context.
// `changingKeys` marks the rows a pending change touches.
// ---------------------------------------------------------------------------
function DetailRow({
  label,
  value,
  changing,
}: {
  label: string;
  value: React.ReactNode;
  changing?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 ${
        changing ? "bg-primary/10 ring-1 ring-primary/30" : "bg-surface-container/40"
      }`}
    >
      <span className="flex items-center gap-1 font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
        {changing && (
          <span className="inline-flex items-center gap-0.5 text-primary">
            <span className="material-symbols-outlined text-[11px]">bolt</span>
            changing
          </span>
        )}
      </span>
      <span className="font-body-base text-[13px] text-on-surface break-words">{value || "—"}</span>
    </div>
  );
}

function ToolModel({ detail, changingKeys }: { detail: ToolDetailVM; changingKeys: Set<string> }) {
  const logo = detail.heroImageUrl || detail.imageUrl;
  const assets = assetLabels(detail.downloadAssets);
  const gallery = assetCount(detail.galleryImages);
  const featureCount = assetCount(detail.features);
  const install = installEntries(detail.installCommand);
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="flex flex-col gap-4">
      {/* Identity */}
      <div className="flex items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={detail.name}
            className={`w-12 h-12 rounded-xl object-contain bg-surface-container p-1 ${
              changingKeys.has("logo") ? "ring-2 ring-primary/50" : "border border-outline-variant/20"
            }`}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">image</span>
          </div>
        )}
        <div className="min-w-0">
          <p className={`font-display-lg text-base font-bold text-on-surface truncate ${changingKeys.has("name") ? "text-primary" : ""}`}>
            {detail.name}
          </p>
          <p className="font-body-base text-[11px] text-on-surface-variant truncate">
            {detail.slug ? `/tools/${detail.slug}` : "no slug"} · {detail.status}
          </p>
        </div>
      </div>

      {/* Tagline + about */}
      {detail.description && (
        <p className="font-body-base text-[13px] text-on-surface-variant leading-relaxed">{detail.description}</p>
      )}
      {detail.aboutText && (
        <p className="font-body-base text-[12px] text-on-surface-variant/80 leading-relaxed line-clamp-3">
          {detail.aboutText}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Stars", value: detail.stars.toLocaleString(), icon: "star" },
          { label: "Forks", value: detail.forks.toLocaleString(), icon: "fork_right" },
          { label: "Issues", value: detail.issues.toLocaleString(), icon: "bug_report" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-surface-container/40 px-3 py-2 flex flex-col gap-0.5">
            <span className="flex items-center gap-1 font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
              <span className="material-symbols-outlined text-[13px]">{s.icon}</span>
              {s.label}
            </span>
            <span className="font-display-lg text-sm font-bold text-on-surface">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <DetailRow label="Repository" value={detail.repoUrl.replace("https://github.com/", "")} changing={changingKeys.has("repoUrl")} />
        <DetailRow label="Author" value={detail.author} />
        <DetailRow label="Since" value={detail.since} />
        <DetailRow label="License" value={detail.license} />
        <DetailRow label="Version" value={detail.version} />
        <DetailRow label="Website" value={detail.websiteUrl?.replace(/^https?:\/\//, "")} />
        <DetailRow label="Download URL" value={detail.downloadUrl?.replace(/^https?:\/\//, "")} />
        <DetailRow label="Last upstream update" value={fmtDate(detail.lastUpdate)} />
      </div>

      {/* Categories */}
      {(detail.platforms.length > 0 || detail.toolTypes.length > 0) && (
        <div className="flex flex-col gap-2">
          {detail.platforms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mr-1">Platforms</span>
              {detail.platforms.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded-full bg-surface-container text-[11px] text-on-surface border border-outline-variant/20">{p}</span>
              ))}
            </div>
          )}
          {detail.toolTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mr-1">Types</span>
              {detail.toolTypes.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-[11px] text-primary border border-primary/20">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media / assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div
          className={`rounded-lg px-3 py-2 ${
            changingKeys.has("downloadAssets") ? "bg-primary/10 ring-1 ring-primary/30" : "bg-surface-container/40"
          }`}
        >
          <span className="flex items-center gap-1 font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
            Download assets ({assets.length})
            {changingKeys.has("downloadAssets") && (
              <span className="inline-flex items-center gap-0.5 text-primary">
                <span className="material-symbols-outlined text-[11px]">bolt</span>changing
              </span>
            )}
          </span>
          {assets.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {assets.slice(0, 6).map((a, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] text-on-surface-variant truncate max-w-[140px]">{a}</span>
              ))}
              {assets.length > 6 && <span className="text-[10px] text-on-surface-variant">+{assets.length - 6}</span>}
            </div>
          ) : (
            <span className="font-body-base text-[13px] text-on-surface">—</span>
          )}
        </div>
        <div className="rounded-lg bg-surface-container/40 px-3 py-2 flex flex-col gap-0.5">
          <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Gallery / Features</span>
          <span className="font-body-base text-[13px] text-on-surface">{gallery} image{gallery !== 1 ? "s" : ""} · {featureCount} feature{featureCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Install */}
      {install.length > 0 && (
        <div className="rounded-lg bg-surface-container/40 px-3 py-2 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">Install</span>
          {install.slice(0, 4).map(([os, cmd]) => (
            <div key={os} className="flex gap-2 font-mono-code text-[11px]">
              <span className="text-on-surface-variant shrink-0 min-w-[64px]">{os}</span>
              <span className="text-on-surface break-all">{cmd}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review modal — full tool model + everything flagged, with the two decisions.
// ---------------------------------------------------------------------------
function ReviewModal({ change, onClose }: { change: ChangeVM; onClose: () => void }) {
  const [detail, setDetail] = useState<ToolDetailVM | null>(null);
  const [changes, setChanges] = useState<ChangeVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // `loading` starts true (initial state) and clears once the first fetch
  // settles; reloads reuse the same fetch without a full-screen spinner.
  const load = useCallback(() => {
    getToolReviewDetail(change.toolId)
      .then((res) => {
        setDetail(res.detail);
        setChanges(res.changes);
        setLoadError(null);
      })
      .catch((e: unknown) => setLoadError(e instanceof Error ? e.message : "Failed to load tool."))
      .finally(() => setLoading(false));
  }, [change.toolId]);

  useEffect(() => {
    load();
  }, [load]);

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
        load(); // soft refresh: modal reflects the resolved change; list revalidates
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Action failed.");
      }
    });
  };

  const editHref = `/admin/tools/${change.toolId}/edit`;

  const pending = changes.filter((c) => c.status === "PENDING");
  const resolved = changes.filter((c) => c.status !== "PENDING");
  const changingKeys = useMemo(() => new Set(pending.map((c) => detailKeyFor(c.field))), [pending]);

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
        className="glass-panel w-full max-w-2xl rounded-2xl border border-outline-variant/20 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
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

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 animate-spin">progress_activity</span>
            <p className="font-body-base text-xs text-on-surface-variant">Loading tool…</p>
          </div>
        ) : loadError || !detail ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-[32px] text-error/60">error</span>
            <p className="font-body-base text-sm text-on-surface-variant">{loadError ?? "Tool not found."}</p>
          </div>
        ) : (
          <>
            {/* ---- What's changing ---- */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-1.5 font-label-sm text-xs uppercase tracking-wider text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">difference</span>
                  What&apos;s changing
                  <span className="text-on-surface-variant">· {pending.length} pending</span>
                </h3>
                {/* Manual-edit path — applies to the whole tool */}
                <Link
                  href={editHref}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60 transition-colors font-label-sm text-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  Edit manually
                </Link>
              </div>

              {pending.length === 0 && (
                <p className="rounded-xl border border-outline-variant/15 bg-surface-container/40 p-4 font-body-base text-[13px] text-on-surface-variant">
                  No pending changes — everything flagged for this tool is resolved.
                </p>
              )}

              {pending.map((c) => {
                const meta = metaFor(c.field);
                const mag = magnitude(c);
                return (
                  <div key={c.id} className="rounded-xl border border-outline-variant/15 bg-surface-container/40 p-4 flex flex-col gap-3">
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
                      {mag && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code bg-primary/10 text-primary leading-none">
                          {mag}
                        </span>
                      )}
                    </div>

                    <ChangeDiff change={c} />

                    {/* The two decisions, together */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {meta.kind === "alert" ? (
                        <>
                          <button
                            disabled={isPending}
                            onClick={() =>
                              run(
                                () => archiveToolFromChange(c.id),
                                `Hide "${c.toolName}" from the public directory? It becomes recoverable (soft-delete), not permanently deleted.`,
                              )
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-error/15 text-error hover:bg-error/25 transition-colors font-label-sm text-xs disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                            Archive (hide tool)
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => run(() => rejectChange(c.id))}
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
                                  ? publishDownloadCuration(c.id, c.newValue)
                                  : applyChange(c.id),
                              )
                            }
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-sm text-xs disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isPending ? "hourglass_empty" : "auto_fix_high"}
                            </span>
                            Automatic edit
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
                            onClick={() => run(() => rejectChange(c.id))}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-sm text-xs disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Resolved history for this tool */}
              {resolved.length > 0 && (
                <details className="rounded-xl border border-outline-variant/15 bg-surface-container/20">
                  <summary className="cursor-pointer select-none px-4 py-2.5 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                    Resolved history ({resolved.length})
                  </summary>
                  <div className="px-4 pb-3 flex flex-col gap-2">
                    {resolved.map((c) => {
                      const status = STATUS_META[c.status] ?? STATUS_META.PENDING;
                      return (
                        <div key={c.id} className="flex items-center gap-2 flex-wrap opacity-80">
                          <span className="font-body-base text-[12px] text-on-surface-variant">{metaFor(c.field).label}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label-sm uppercase tracking-wider leading-none ${status.cls}`}>
                            <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
                            {status.label}
                          </span>
                          {c.resolvedAt && (
                            <span className="font-body-base text-[10px] text-on-surface-variant/70">
                              {new Date(c.resolvedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
            </section>

            {/* ---- Full tool model ---- */}
            <section className="flex flex-col gap-3 border-t border-outline-variant/15 pt-4">
              <h3 className="flex items-center gap-1.5 font-label-sm text-xs uppercase tracking-wider text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">deployed_code</span>
                Full tool details
              </h3>
              <ToolModel detail={detail} changingKeys={changingKeys} />
            </section>
          </>
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
