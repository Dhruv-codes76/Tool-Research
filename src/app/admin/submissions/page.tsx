import React from 'react';
import Link from 'next/link';
import { getPendingSubmissions } from '@/app/actions/adminActions';
import { SubmissionRow } from '@/components/admin/SubmissionRow';

export default async function SubmissionsPage() {
  const submissions = await getPendingSubmissions();

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-on-surface">Submissions</span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold text-on-surface tracking-tight mb-1">
            Tool Submissions
          </h1>
          <p className="font-body-base text-sm text-on-surface-variant">
            Review, approve, or reject tools submitted by users.
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

      {/* Summary card */}
      <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px] text-primary">inbox</span>
        </div>
        <div>
          <p className="font-display-lg text-3xl text-on-surface font-bold">
            {submissions.length}
          </p>
          <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mt-0.5">
            Pending Review
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">
                  Tool
                </th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">
                  Description
                </th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">
                  Submitted By
                </th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">
                  Date
                </th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {submissions.map((submission: any) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))}

              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
                        inbox
                      </span>
                      <p className="font-body-base text-sm text-on-surface-variant">
                        No pending submissions — all caught up!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {submissions.length > 0 && (
          <div className="px-6 py-4 border-t border-outline-variant/20">
            <span className="font-body-base text-[11px] text-on-surface-variant">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} awaiting review
            </span>
          </div>
        )}
      </div>

      {/* Workflow note */}
      <div className="glass-panel rounded-xl p-5 border border-outline-variant/20 flex gap-4">
        <span className="material-symbols-outlined text-[20px] text-primary mt-0.5 shrink-0">info</span>
        <div className="flex flex-col gap-1">
          <p className="font-label-sm text-sm text-on-surface">How the review flow works</p>
          <p className="font-body-base text-[12px] text-on-surface-variant leading-relaxed">
            <strong className="text-[#10B981]">Approve</strong> moves the tool to <span className="font-mono-code text-xs">DRAFT</span> and opens the editor so you can enrich its details before publishing live.&nbsp;
            <strong className="text-error">Reject</strong> permanently marks it rejected and notifies the submitter via email (if a reason is provided, it's included).
          </p>
        </div>
      </div>
    </div>
  );
}
