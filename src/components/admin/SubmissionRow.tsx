'use client';

import { useState, useTransition, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { approveSubmission, rejectSubmission, checkSlugUnique } from '@/app/actions/adminActions';
import { ImageDropzone } from '@/components/ui/ImageDropzone';

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

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
const parseArr = (s: string | null): string[] => { try { return JSON.parse(s || '[]'); } catch { return []; } };
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function SubmissionRow({
  submission,
  availablePlatforms = [],
  availableToolTypes = [],
}: {
  submission: Submission;
  availablePlatforms?: string[];
  availableToolTypes?: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields — admin finalises the listing here.
  const [name, setName] = useState(submission.name);
  const [slug, setSlug] = useState(submission.slug || slugify(submission.name));
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [description, setDescription] = useState(submission.description || '');
  const [metaTitle, setMetaTitle] = useState(submission.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(submission.metaDescription || '');
  const [repoUrl, setRepoUrl] = useState(submission.repoUrl);
  const [websiteUrl, setWebsiteUrl] = useState(submission.websiteUrl || '');
  const [aboutText, setAboutText] = useState(submission.aboutText || '');
  const [heroImageUrl, setHeroImageUrl] = useState(submission.heroImageUrl || '');
  const [galleryLayout, setGalleryLayout] = useState<'16:9' | '9:16'>((submission.galleryLayout as '9:16') === '9:16' ? '9:16' : '16:9');
  const [gallery, setGallery] = useState<string[]>(() => {
    const arr = parseArr(submission.galleryImages);
    return [0, 1, 2, 3].map((i) => arr[i] || '');
  });
  const [author, setAuthor] = useState(submission.author || '');
  const [authorUrl, setAuthorUrl] = useState(submission.authorUrl || '');
  const [license, setLicense] = useState(submission.license || '');
  const [version, setVersion] = useState(submission.version || '');
  const [since, setSince] = useState(submission.since || '');
  const [downloadUrl, setDownloadUrl] = useState(submission.downloadUrl || '');
  const [toolTypes, setToolTypes] = useState<string[]>(submission.toolTypes?.map((t) => t.name) || []);
  const [platforms, setPlatforms] = useState<string[]>(submission.platforms?.map((p) => p.name) || []);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced slug uniqueness check, driven by input (not an effect) so it only
  // runs in response to a real edit or when the modal is opened.
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const validateSlug = (next: string) => {
    setSlug(next);
    if (slugTimer.current) clearTimeout(slugTimer.current);
    if (!next) { setSlugStatus('idle'); return; }
    if (!/^[a-z0-9-]+$/.test(next)) { setSlugStatus('invalid'); return; }
    setSlugStatus('checking');
    slugTimer.current = setTimeout(async () => {
      try {
        const ok = await checkSlugUnique(next, submission.id);
        setSlugStatus(ok ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 400);
  };

  const missing = useMemo(() => {
    const m: string[] = [];
    if (!name.trim()) m.push('name');
    if (!description.trim()) m.push('description');
    if (!heroImageUrl.trim()) m.push('image');
    if (!slug.trim() || slugStatus === 'invalid' || slugStatus === 'taken') m.push('valid slug');
    return m;
  }, [name, description, heroImageUrl, slug, slugStatus]);
  const canPublish = missing.length === 0 && slugStatus !== 'checking' && !isPending;

  const repoShort = submission.repoUrl.replace('https://github.com/', '');
  const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(submission.createdAt));

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveSubmission(submission.id, {
        name, slug, description,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        repoUrl, websiteUrl: websiteUrl || null,
        aboutText: aboutText || null,
        heroImageUrl: heroImageUrl || null,
        galleryImages: JSON.stringify(gallery.filter(Boolean)),
        galleryLayout,
        features: submission.features || null,
        installCommand: submission.installCommand || null,
        downloadAssets: submission.downloadAssets || null,
        downloadUrl: downloadUrl || null,
        author: author || null, authorUrl: authorUrl || null,
        license: license || null, version: version || null, since: since || null,
        platforms, toolTypes,
      });
      if (!res.success) { setError(res.error.message ?? 'Something went wrong.'); return; }
      setDone('approved');
      setTimeout(() => setIsModalOpen(false), 900);
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      try {
        await rejectSubmission(submission.id, reason.trim() || undefined);
        setDone('rejected');
        setTimeout(() => setIsModalOpen(false), 900);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  if (done === 'rejected') {
    return <tr className="pointer-events-none opacity-0 transition-opacity duration-500"><td colSpan={5} /></tr>;
  }
  if (done === 'approved') {
    return (
      <tr className="bg-[#10B981]/5 transition-colors">
        <td colSpan={5} className="px-6 py-4 text-center font-label-sm text-sm text-[#10B981]">
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>Approved and published
          </span>
        </td>
      </tr>
    );
  }

  const toggle = (list: string[], set: (v: string[]) => void, n: string) =>
    set(list.includes(n) ? list.filter((x) => x !== n) : [...list, n]);

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
          <button onClick={() => { setIsModalOpen(true); validateSlug(slug); }} className="flex items-center gap-1.5 rounded-md bg-primary/10 px-4 py-2 font-label-sm text-[12px] text-primary transition-colors hover:bg-primary/20">
            <span className="material-symbols-outlined text-[15px]">tune</span>Review
          </button>
        </td>
      </tr>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="animate-in fade-in zoom-in-95 relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container shadow-2xl duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-outline-variant/10 bg-surface-container/95 px-6 py-4 backdrop-blur">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-on-surface">Review &amp; publish</h2>
                <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                  Submitted by {submission.submittedByEmail ?? 'unknown'} · {dateStr}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.4fr_1fr]">
              {/* Left — identity + taxonomy */}
              <div className="flex flex-col gap-5">
                <Field label="Tool name" required>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                </Field>

                <Field label="URL slug" required hint="The public address: /tools/<slug>">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        value={slug}
                        onChange={(e) => validateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className={`${inputCls} pr-10 ${slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-error focus:border-error' : slugStatus === 'available' ? 'border-[#10B981]/60' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugStatus === 'checking' && <span className="material-symbols-outlined animate-spin text-[16px] text-on-surface-variant">progress_activity</span>}
                        {slugStatus === 'available' && <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>}
                        {(slugStatus === 'taken' || slugStatus === 'invalid') && <span className="material-symbols-outlined text-[16px] text-error">error</span>}
                      </span>
                    </div>
                    <button type="button" onClick={() => validateSlug(slugify(name))} className="shrink-0 rounded-lg border border-outline-variant/30 px-3 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/50 hover:text-on-surface">
                      Generate
                    </button>
                  </div>
                  {slugStatus === 'taken' && <p className="mt-1 text-[11px] text-error">That slug is already taken.</p>}
                  {slugStatus === 'invalid' && <p className="mt-1 text-[11px] text-error">Lowercase letters, numbers and hyphens only.</p>}
                </Field>

                <Field label="Description" required hint="Shown on cards and the hero.">
                  <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} resize-none`} placeholder="Write the one-liner that sells this tool…" />
                </Field>

                <Field label="SEO title" hint={`Browser-tab / Google link text. Blank → “${name || 'Tool name'} — Open-Source Tool”.`}>
                  <input type="text" maxLength={70} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputCls} placeholder={`${name || 'Tool name'} — Open-Source Tool`} />
                  <span className="mt-1 block text-right text-[10px] text-on-surface-variant/60">{metaTitle.length}/70</span>
                </Field>

                <Field label="SEO meta description" hint="Search snippet · ~120–160 chars. Falls back to Description.">
                  <textarea rows={2} maxLength={160} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={`${inputCls} resize-none`} />
                  <span className="mt-1 block text-right text-[10px] text-on-surface-variant/60">{metaDescription.length}/160</span>
                </Field>

                {availableToolTypes.length > 0 && (
                  <Field label="Categories">
                    <PillGroup options={availableToolTypes} selected={toolTypes} onToggle={(n) => toggle(toolTypes, setToolTypes, n)} />
                  </Field>
                )}
                {availablePlatforms.length > 0 && (
                  <Field label="Platforms">
                    <PillGroup options={availablePlatforms} selected={platforms} onToggle={(n) => toggle(platforms, setPlatforms, n)} />
                  </Field>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Author"><input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} /></Field>
                  <Field label="Author URL"><input value={authorUrl} onChange={(e) => setAuthorUrl(e.target.value)} className={inputCls} /></Field>
                  <Field label="License"><input value={license} onChange={(e) => setLicense(e.target.value)} className={inputCls} /></Field>
                  <Field label="Version"><input value={version} onChange={(e) => setVersion(e.target.value)} className={inputCls} /></Field>
                  <Field label="Since (year)"><input value={since} onChange={(e) => setSince(e.target.value)} className={inputCls} /></Field>
                  <Field label="Website URL"><input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className={inputCls} /></Field>
                </div>

                <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="flex items-center gap-1 self-start text-xs font-semibold text-on-surface-variant transition-colors hover:text-on-surface">
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>chevron_right</span>
                  Advanced (about, repo, download)
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/50 p-4">
                    <Field label="Repository URL"><input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className={inputCls} /></Field>
                    <Field label="Download URL (single-link fallback)"><input value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} className={inputCls} /></Field>
                    <Field label="About (markdown body)">
                      <textarea rows={5} value={aboutText} onChange={(e) => setAboutText(e.target.value)} className="w-full resize-y rounded-lg border border-outline-variant/20 bg-[#0d1117] p-3 font-mono-code text-[13px] leading-relaxed text-[#c9d1d9] focus:border-primary/50 focus:outline-none" placeholder="# Overview…" />
                    </Field>
                  </div>
                )}
              </div>

              {/* Right — images (the "check the picture" step) */}
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest/50 p-4">
                  <span className="mb-2 block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">Logo <span className="text-error">*</span></span>
                  <div className="mx-auto w-36">
                    <ImageDropzone value={heroImageUrl} onChange={setHeroImageUrl} aspect="square" fit="contain" filePrefix="logo" hint="Logo" />
                  </div>
                </div>

                <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">Screenshots</span>
                    <div className="flex rounded-lg border border-outline-variant/30 bg-surface-container-low p-0.5">
                      {(['16:9', '9:16'] as const).map((r) => (
                        <button key={r} type="button" onClick={() => setGalleryLayout(r)} className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${galleryLayout === r ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div className={galleryLayout === '16:9' ? 'grid grid-cols-2 gap-2.5' : 'grid grid-cols-4 gap-2.5'}>
                    {gallery.map((img, idx) => (
                      <ImageDropzone key={idx} value={img} onChange={(url) => setGallery((g) => g.map((v, i) => (i === idx ? url : v)))} aspect={galleryLayout === '16:9' ? 'video' : 'portrait'} filePrefix={`gallery-${idx}`} badge={idx + 1} hint="Add" />
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-[11px] leading-relaxed text-on-surface-variant">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-[15px] text-primary">info</span>
                  Confirm the logo looks right before publishing — a thumbnail is required to go live.
                </div>
              </div>
            </div>

            {/* Footer — publish gate */}
            <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-outline-variant/10 bg-surface-container/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[18px] text-[12px]">
                {error ? (
                  <span className="flex items-center gap-1.5 text-error"><span className="material-symbols-outlined text-[15px]">error</span>{error}</span>
                ) : missing.length > 0 ? (
                  <span className="text-on-surface-variant/70">Add <span className="font-semibold text-on-surface-variant">{missing.join(', ')}</span> to publish.</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#10B981]"><span className="material-symbols-outlined text-[15px]">check_circle</span>Ready to publish.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!rejectOpen ? (
                  <button onClick={() => setRejectOpen(true)} disabled={isPending} className="rounded-full border border-error/30 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50">Reject</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="w-40 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-error focus:outline-none" />
                    <button onClick={handleReject} disabled={isPending} className="rounded-full bg-error/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-error disabled:opacity-50">Confirm</button>
                    <button onClick={() => setRejectOpen(false)} className="text-xs text-on-surface-variant hover:text-on-surface">Cancel</button>
                  </div>
                )}
                <button onClick={handleApprove} disabled={!canPublish} className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-2 text-sm font-semibold text-on-primary-container transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100">
                  <span className={`material-symbols-outlined text-[17px] ${isPending ? 'animate-spin' : ''}`}>{isPending ? 'progress_activity' : 'publish'}</span>
                  Publish live
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

const inputCls = 'w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15';

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
        {label}{required && <span className="text-error"> *</span>}
        {hint && <span className="ml-1.5 normal-case tracking-normal text-on-surface-variant/50">— {hint}</span>}
      </span>
      {children}
    </label>
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
