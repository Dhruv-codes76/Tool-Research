'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveSubmission, rejectSubmission } from '@/app/actions/adminActions';

type Submission = {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  submittedByEmail: string | null;
  createdAt: Date;
};

export function SubmissionRow({ submission }: { submission: Submission }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const repoShort = submission.repoUrl.replace('https://github.com/', '');
  const dateStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(submission.createdAt));

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await approveSubmission(submission.id);
        setDone('approved');
        // Give the user a moment to see the success state before navigating
        setTimeout(() => router.push(result.editUrl), 900);
      } catch (err: any) {
        setError(err.message ?? 'Something went wrong.');
      }
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      try {
        await rejectSubmission(submission.id, reason.trim() || undefined);
        setDone('rejected');
      } catch (err: any) {
        setError(err.message ?? 'Something went wrong.');
      }
    });
  }

  // Once actioned, fade the row out gracefully
  if (done === 'rejected') {
    return (
      <tr className="opacity-0 transition-opacity duration-500 pointer-events-none">
        <td colSpan={5} />
      </tr>
    );
  }

  if (done === 'approved') {
    return (
      <tr className="bg-[#10B981]/5 transition-colors">
        <td colSpan={5} className="px-6 py-4 text-center font-label-sm text-sm text-[#10B981]">
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Approved — opening editor…
          </span>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="hover:bg-surface-container-high/30 transition-colors align-top">
        {/* Tool info */}
        <td className="px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-label-sm text-sm text-on-surface">{submission.name}</span>
            <a
              href={submission.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body-base text-[11px] text-primary hover:underline truncate max-w-[220px]"
            >
              {repoShort}
            </a>
          </div>
        </td>

        {/* Description */}
        <td className="px-6 py-4 max-w-xs">
          <p className="font-body-base text-[12px] text-on-surface-variant line-clamp-2">
            {submission.description || <span className="italic opacity-50">No description</span>}
          </p>
        </td>

        {/* Submitted by */}
        <td className="px-6 py-4">
          <span className="font-body-base text-[12px] text-on-surface-variant">
            {submission.submittedByEmail ?? <span className="italic opacity-50">Unknown</span>}
          </span>
        </td>

        {/* Date */}
        <td className="px-6 py-4">
          <span className="font-label-sm text-[11px] text-on-surface-variant">{dateStr}</span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {/* Approve */}
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors font-label-sm text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && !rejectOpen ? (
                <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
              )}
              Approve
            </button>

            {/* Reject toggle */}
            <button
              onClick={() => setRejectOpen((v) => !v)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-error/10 text-error hover:bg-error/20 transition-colors font-label-sm text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[15px]">cancel</span>
              Reject
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[11px] text-error font-body-base">{error}</p>
          )}
        </td>
      </tr>

      {/* Inline reject panel — expands below the row */}
      {rejectOpen && (
        <tr className="bg-surface-container-lowest border-b border-outline-variant/10">
          <td colSpan={5} className="px-6 py-4">
            <div className="flex flex-col gap-3 max-w-xl">
              <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider">
                Rejection reason <span className="normal-case opacity-60">(optional)</span>
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Not open-source, duplicate entry, repo archived…"
                rows={3}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 font-body-base text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-error text-white hover:bg-error/80 transition-colors font-label-sm text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && rejectOpen ? (
                    <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[15px]">cancel</span>
                  )}
                  Confirm Rejection
                </button>
                <button
                  onClick={() => { setRejectOpen(false); setReason(''); }}
                  className="font-label-sm text-[12px] text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
