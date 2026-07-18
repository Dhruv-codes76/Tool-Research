'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateMySubmission } from '@/app/actions/userActions';
import { ImageDropzone } from '@/components/ui/ImageDropzone';

export type EditableSubmission = {
  id: string;
  name: string;
  repoUrl: string;
  description: string;
  heroImageUrl: string | null;
  galleryImages: string; // JSON string of string[]
  galleryLayout: string;
  toolTypes: string[];
  platforms: string[];
};

const parseArr = (s: string): string[] => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };

export function EditSubmissionModal({
  submission,
  availablePlatforms,
  availableToolTypes,
  onClose,
}: {
  submission: EditableSubmission;
  availablePlatforms: string[];
  availableToolTypes: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [description, setDescription] = useState(submission.description || '');
  const [heroImageUrl, setHeroImageUrl] = useState(submission.heroImageUrl || '');
  const [galleryLayout, setGalleryLayout] = useState<'16:9' | '9:16'>(submission.galleryLayout === '9:16' ? '9:16' : '16:9');
  const [gallery, setGallery] = useState<string[]>(() => {
    const arr = parseArr(submission.galleryImages);
    return [0, 1, 2, 3].map((i) => arr[i] || '');
  });
  const [toolTypes, setToolTypes] = useState<string[]>(submission.toolTypes);
  const [platforms, setPlatforms] = useState<string[]>(submission.platforms);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isSaving) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isSaving]);

  const toggle = (list: string[], set: (v: string[]) => void, n: string) =>
    set(list.includes(n) ? list.filter((x) => x !== n) : [...list, n]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await updateMySubmission(submission.id, {
        description: description.trim(),
        heroImageUrl: heroImageUrl || undefined,
        galleryImages: JSON.stringify(gallery.filter(Boolean)),
        galleryLayout,
        toolTypes,
        platforms,
      });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const repoShort = submission.repoUrl.replace('https://github.com/', '');

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && !isSaving && onClose()}>
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-outline-variant/10 bg-surface-container/95 px-6 py-4 backdrop-blur">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-on-surface">Edit your submission</h2>
            <p className="mt-0.5 truncate text-xs text-on-surface-variant">{submission.name} · {repoShort}</p>
          </div>
          <button onClick={() => !isSaving && onClose()} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="Close">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 overflow-y-auto p-6">
          <p className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-[11px] leading-relaxed text-on-surface-variant">
            <span className="material-symbols-outlined mt-0.5 shrink-0 text-[15px] text-primary">info</span>
            You can refine these details while your tool is awaiting review. The name and stats come from GitHub; our editors finalise the rest before publishing.
          </p>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One or two lines on what it does. Leave it blank and our editors will write one."
              className="w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm leading-relaxed text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[9rem_1fr]">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Logo</span>
              <ImageDropzone value={heroImageUrl} onChange={setHeroImageUrl} aspect="square" fit="contain" filePrefix="logo" hint="Logo" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Screenshots</span>
                <div className="flex rounded-lg border border-outline-variant/30 bg-surface-container-low p-0.5">
                  {(['16:9', '9:16'] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setGalleryLayout(r)} className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors ${galleryLayout === r ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className={galleryLayout === '16:9' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-3'}>
                {gallery.map((img, idx) => (
                  <ImageDropzone key={idx} value={img} onChange={(url) => setGallery((g) => g.map((v, i) => (i === idx ? url : v)))} aspect={galleryLayout === '16:9' ? 'video' : 'portrait'} filePrefix={`gallery-${idx}`} badge={idx + 1} hint="Add" />
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          {(availableToolTypes.length > 0 || availablePlatforms.length > 0) && (
            <div className="flex flex-col gap-4">
              {availableToolTypes.length > 0 && (
                <div>
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/70">Type</span>
                  <PillGroup options={availableToolTypes} selected={toolTypes} onToggle={(n) => toggle(toolTypes, setToolTypes, n)} />
                </div>
              )}
              {availablePlatforms.length > 0 && (
                <div>
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/70">Platform</span>
                  <PillGroup options={availablePlatforms} selected={platforms} onToggle={(n) => toggle(platforms, setPlatforms, n)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-outline-variant/10 bg-surface-container/95 px-6 py-4 backdrop-blur">
          <div className="min-h-[18px] text-[12px]">
            {error && <span className="flex items-center gap-1.5 text-error"><span className="material-symbols-outlined text-[15px]">error</span>{error}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => !isSaving && onClose()} disabled={isSaving} className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:border-outline-variant/70 hover:text-on-surface disabled:opacity-50">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-2 text-sm font-semibold text-on-primary-container transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
              <span className={`material-symbols-outlined text-[17px] ${isSaving ? 'animate-spin' : ''}`}>{isSaving ? 'progress_activity' : 'save'}</span>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PillGroup({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (n: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((name) => {
        const on = selected.includes(name);
        return (
          <button key={name} type="button" onClick={() => onToggle(name)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${on ? 'border-primary-container bg-primary-container text-on-primary-container' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 hover:text-on-surface'}`}>
            {on && <span className="material-symbols-outlined text-[14px]">check</span>}{name}
          </button>
        );
      })}
    </div>
  );
}
