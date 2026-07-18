import React from "react";
import Link from "next/link";
import { getPendingChanges } from "@/app/actions/adminActions";
import { ReviewClient, type ChangeVM } from "@/components/admin/ReviewClient";

// Auth + DB read on every request — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const changes = await getPendingChanges();

  const items: ChangeVM[] = changes.map((c) => ({
    id: c.id,
    field: c.field,
    oldValue: c.oldValue,
    newValue: c.newValue,
    detectedAt: c.detectedAt.toISOString(),
    toolId: c.toolId,
    toolName: c.tool?.name ?? "Unknown tool",
    repoUrl: c.tool?.repoUrl ?? "",
  }));

  const deletedCount = items.filter((i) => i.field === "__repo_deleted__").length;

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-on-surface">Review</span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold text-on-surface tracking-tight mb-1">
            Changes to Review
          </h1>
          <p className="font-body-base text-sm text-on-surface-variant">
            Upstream changes the refresh cron flagged for a human decision. Stars, forks, issues,
            version and license are applied automatically — only major changes land here.
          </p>
        </div>

        <Link
          href="/admin/tools"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60 transition-colors font-label-sm text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">build</span>
          All Tools
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px] text-primary">rule</span>
          </div>
          <div>
            <p className="font-display-lg text-3xl text-on-surface font-bold">{items.length}</p>
            <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mt-0.5">
              Pending review
            </p>
          </div>
        </div>

        {deletedCount > 0 && (
          <div className="glass-panel p-6 rounded-xl flex items-center gap-4 border border-error/30">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px] text-error">warning</span>
            </div>
            <div>
              <p className="font-display-lg text-3xl text-on-surface font-bold">{deletedCount}</p>
              <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mt-0.5">
                Repo deleted / private
              </p>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
            task_alt
          </span>
          <p className="font-body-base text-sm text-on-surface-variant">
            Nothing to review — every tracked repo is in sync.
          </p>
        </div>
      ) : (
        <ReviewClient changes={items} />
      )}
    </div>
  );
}
