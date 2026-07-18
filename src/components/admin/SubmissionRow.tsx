'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ToolForm } from '@/components/admin/ToolForm';

type Submission = {
  id: string;
  name: string;
  slug: string | null;
  description: string;
  metaTitle: string | null;
  metaDescription: string | null;
  repoUrl: string;
  websiteUrl: string | null;
  heroImageUrl: string | null;
  galleryImages: string | null;
  galleryLayout: string | null;
  aboutText: string | null;
  features: string | null;
  installCommand: string | null;
  downloadAssets: string | null;
  downloadUrl: string | null;
  license: string | null;
  version: string | null;
  since: string | null;
  author: string | null;
  authorUrl: string | null;
  submittedByEmail: string | null;
  createdAt: Date;
  stars: number;
  forks: number;
  platforms?: { id: string; name: string }[];
  toolTypes?: { id: string; name: string }[];
};

export function SubmissionRow({
  submission,
  availablePlatforms = [],
  availableToolTypes = [],
}: {
  submission: Submission;
  availablePlatforms?: string[];
  availableToolTypes?: string[];
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const repoShort = submission.repoUrl.replace('https://github.com/', '');
  const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(submission.createdAt));

  return (
    <>
      <tr className="align-top transition-colors hover:bg-surface-container-high/30">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-surface-container-low">
              {submission.heroImageUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={submission.heroImageUrl} alt="" className="h-full w-full object-contain p-1" />
                : <span className="material-symbols-outlined text-[16px] text-on-surface-variant/50">deployed_code</span>}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-sm text-on-surface">{submission.name}</span>
              <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer" className="max-w-[200px] truncate font-body-base text-[11px] text-primary hover:underline">{repoShort}</a>
            </div>
          </div>
        </td>
        <td className="max-w-xs px-6 py-4">
          <p className="line-clamp-2 font-body-base text-[12px] text-on-surface-variant">
            {submission.description || <span className="italic opacity-50">No description yet</span>}
          </p>
        </td>
        <td className="px-6 py-4"><span className="font-body-base text-[12px] text-on-surface-variant">{submission.submittedByEmail ?? <span className="italic opacity-50">Unknown</span>}</span></td>
        <td className="px-6 py-4"><span className="font-label-sm text-[11px] text-on-surface-variant">{dateStr}</span></td>
        <td className="px-6 py-4">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 rounded-md bg-primary/10 px-4 py-2 font-label-sm text-[12px] text-primary transition-colors hover:bg-primary/20">
            <span className="material-symbols-outlined text-[15px]">tune</span>Review
          </button>
        </td>
      </tr>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="animate-in fade-in zoom-in-95 relative my-8 w-full max-w-6xl overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <ToolForm
              initialData={submission}
              availablePlatforms={availablePlatforms}
              availableToolTypes={availableToolTypes}
              submission={{ id: submission.id, submittedByEmail: submission.submittedByEmail, createdAt: submission.createdAt }}
              onDone={() => { setIsModalOpen(false); router.refresh(); }}
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
