'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { approveSubmission, rejectSubmission } from '@/app/actions/adminActions';

type Submission = {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  websiteUrl: string | null;
  heroImageUrl: string | null;
  galleryImages: string | null;
  aboutText: string | null;
  features: string | null;
  installCommand: string | null;
  license: string | null;
  version: string | null;
  since: string | null;
  downloadUrl: string | null;
  submittedByEmail: string | null;
  createdAt: Date;
  stars: number;
  forks: number;
  issues: number;
  author: string | null;
  platforms?: { id: string; name: string }[];
  toolTypes?: { id: string; name: string }[];
};

export function SubmissionRow({ submission }: { submission: Submission }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Editable state
  const [editName, setEditName] = useState(submission.name);
  const [editDescription, setEditDescription] = useState(submission.description || '');
  const [editRepoUrl, setEditRepoUrl] = useState(submission.repoUrl);
  const [editWebsiteUrl, setEditWebsiteUrl] = useState(submission.websiteUrl || '');
  const [editAboutText, setEditAboutText] = useState(submission.aboutText || '');
  const [editHeroImageUrl, setEditHeroImageUrl] = useState(submission.heroImageUrl || '');
  const [editGalleryImages, setEditGalleryImages] = useState(submission.galleryImages || '');
  const [editFeatures, setEditFeatures] = useState(submission.features || '');
  const [editInstallCommand, setEditInstallCommand] = useState(submission.installCommand || '');
  const [editLicense, setEditLicense] = useState(submission.license || '');
  const [editVersion, setEditVersion] = useState(submission.version || '');
  const [editSince, setEditSince] = useState(submission.since || '');
  const [editDownloadUrl, setEditDownloadUrl] = useState(submission.downloadUrl || '');

  useEffect(() => setMounted(true), []);

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
        await approveSubmission(submission.id, {
          name: editName,
          description: editDescription,
          repoUrl: editRepoUrl,
          websiteUrl: editWebsiteUrl || null,
          aboutText: editAboutText || null,
          heroImageUrl: editHeroImageUrl || null,
          galleryImages: editGalleryImages || null,
          features: editFeatures || null,
          installCommand: editInstallCommand || null,
          license: editLicense || null,
          version: editVersion || null,
          since: editSince || null,
          downloadUrl: editDownloadUrl || null,
        });
        setDone('approved');
        setTimeout(() => setIsModalOpen(false), 900);
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
        setTimeout(() => setIsModalOpen(false), 900);
      } catch (err: any) {
        setError(err.message ?? 'Something went wrong.');
      }
    });
  }

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
            Approved and published
          </span>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="hover:bg-surface-container-high/30 transition-colors align-top">
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

        <td className="px-6 py-4 max-w-xs">
          <p className="font-body-base text-[12px] text-on-surface-variant line-clamp-2">
            {submission.description || <span className="italic opacity-50">No description</span>}
          </p>
        </td>

        <td className="px-6 py-4">
          <span className="font-body-base text-[12px] text-on-surface-variant">
            {submission.submittedByEmail ?? <span className="italic opacity-50">Unknown</span>}
          </span>
        </td>

        <td className="px-6 py-4">
          <span className="font-label-sm text-[11px] text-on-surface-variant">{dateStr}</span>
        </td>

        <td className="px-6 py-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-label-sm text-[12px]"
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            Check
          </button>
        </td>
      </tr>

      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-outline-variant/20 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center sticky top-0 bg-surface-container/90 backdrop-blur z-10">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Review Submission</h2>
                <p className="text-xs text-on-surface-variant font-body-base mt-1">Review and edit the tool details before approving or rejecting.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
                
                {/* Core Info */}
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Tool Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Description (Short)</label>
                  <textarea 
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">About Text (Long)</label>
                  <textarea 
                    value={editAboutText}
                    onChange={(e) => setEditAboutText(e.target.value)}
                    rows={4}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  />
                </div>

                {/* Media Links */}
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Hero Image URL</label>
                  <div className="flex gap-4 items-start">
                    <input 
                      type="text" 
                      value={editHeroImageUrl}
                      onChange={(e) => setEditHeroImageUrl(e.target.value)}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    {editHeroImageUrl && (
                      <img src={editHeroImageUrl} alt="Hero" className="w-16 h-16 object-cover rounded-md border border-outline-variant/20" />
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Gallery Images (JSON Array)</label>
                  <textarea 
                    value={editGalleryImages}
                    onChange={(e) => setEditGalleryImages(e.target.value)}
                    rows={2}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Features (JSON Array)</label>
                  <textarea 
                    value={editFeatures}
                    onChange={(e) => setEditFeatures(e.target.value)}
                    rows={2}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs"
                  />
                </div>

                {/* URLs & Details */}
                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Repository URL</label>
                  <input 
                    type="text" 
                    value={editRepoUrl}
                    onChange={(e) => setEditRepoUrl(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Website URL</label>
                  <input 
                    type="text" 
                    value={editWebsiteUrl}
                    onChange={(e) => setEditWebsiteUrl(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Download URL</label>
                  <input 
                    type="text" 
                    value={editDownloadUrl}
                    onChange={(e) => setEditDownloadUrl(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Install Command</label>
                  <input 
                    type="text" 
                    value={editInstallCommand}
                    onChange={(e) => setEditInstallCommand(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">License</label>
                  <input 
                    type="text" 
                    value={editLicense}
                    onChange={(e) => setEditLicense(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block mb-1">Version / Since</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editVersion}
                      onChange={(e) => setEditVersion(e.target.value)}
                      placeholder="Version"
                      className="w-1/2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <input 
                      type="text" 
                      value={editSince}
                      onChange={(e) => setEditSince(e.target.value)}
                      placeholder="Since"
                      className="w-1/2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Readonly contextual data */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Categories / Platforms</label>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {submission.toolTypes?.map((t: any) => t.name).join(', ')} <br/>
                      {submission.platforms?.map((p: any) => p.name).join(', ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Submitter / Author</label>
                    <p className="text-on-surface-variant text-sm mt-1">
                      By: {submission.submittedByEmail || 'Unknown'} <br/>
                      Author: {submission.author || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">GitHub Stats</label>
                    <div className="flex gap-4 mt-1">
                      <span className="flex items-center gap-1 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">star</span> {submission.stars}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">fork_right</span> {submission.forks}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Date Submitted</label>
                    <p className="text-on-surface-variant text-sm mt-1">{dateStr}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant/10 pt-6 flex flex-col gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={isPending}
                    className="flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl bg-[#10B981] text-white hover:bg-[#10B981]/90 transition-colors font-bold disabled:opacity-50"
                  >
                    {isPending && done !== 'rejected' ? (
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectOpen(!rejectOpen)}
                    disabled={isPending}
                    className="flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl bg-error/10 text-error hover:bg-error/20 border border-error/20 transition-colors font-bold disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                    Reject
                  </button>
                </div>

                {rejectOpen && (
                  <div className="flex flex-col gap-3 p-5 bg-error/5 rounded-xl border border-error/20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="font-label-sm text-[12px] text-error uppercase tracking-wider font-bold">
                      Rejection reason <span className="normal-case opacity-70">(optional)</span>
                    </p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Not open-source, duplicate entry, repo archived…"
                      rows={3}
                      className="w-full bg-surface-container border border-error/30 rounded-lg px-4 py-3 font-body-base text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:ring-1 focus:ring-error"
                    />
                    <div className="flex justify-end gap-3 mt-1">
                      <button
                        onClick={() => { setRejectOpen(false); setReason(''); }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-error text-white hover:bg-error/90 transition-colors font-bold disabled:opacity-50"
                      >
                        {isPending && done === 'rejected' ? (
                          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        )}
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-error font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
