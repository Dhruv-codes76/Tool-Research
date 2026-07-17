'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { submitToolRequest, fetchPublicGitHubMetadata } from '@/app/actions/toolActions';
import { ImageDropzone } from '@/components/ui/ImageDropzone';

type GitHubMeta = {
  name: string;
  description: string;
  stars: number;
  forks: number;
  license: string;
  heroImageUrl: string;
  author: string;
  authorUrl: string;
  since: string;
  websiteUrl: string;
  version: string;
  topics: string[];
};

const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));

const reveal = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

export function SubmitToolForm({
  availablePlatforms = [],
  availableToolTypes = [],
}: {
  availablePlatforms?: string[];
  availableToolTypes?: string[];
}) {
  const [repoUrl, setRepoUrl] = useState('');
  const [meta, setMeta] = useState<GitHubMeta | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [gallery, setGallery] = useState<string[]>(['', '', '', '']);
  const [galleryLayout, setGalleryLayout] = useState<'16:9' | '9:16'>('16:9');
  const [toolTypes, setToolTypes] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!repoUrl.trim()) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await fetchPublicGitHubMetadata(repoUrl.trim());
      setMeta(data);
      // Seed the logo with the GitHub owner avatar; the submitter can replace it.
      if (data.heroImageUrl && !heroImageUrl) setHeroImageUrl(data.heroImageUrl);
      // Pre-select any taxonomy that matches repo topics — purely a convenience.
      const topics: string[] = Array.isArray(data.topics) ? data.topics.map((t: string) => t.toLowerCase()) : [];
      setToolTypes((prev) => Array.from(new Set([
        ...prev,
        ...availableToolTypes.filter((t) => topics.some((tp) => t.toLowerCase().includes(tp) || tp.includes(t.toLowerCase()))),
      ])));
      setPlatforms((prev) => Array.from(new Set([
        ...prev,
        ...availablePlatforms.filter((p) => topics.includes(p.toLowerCase()) || (topics.includes('mac') && p.toLowerCase() === 'macos')),
      ])));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not read that repository. Check the URL.');
      setMeta(null);
    } finally {
      setIsFetching(false);
    }
  };

  const toggle = (list: string[], set: (v: string[]) => void, name: string) =>
    set(list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);

  const handleSubmit = async () => {
    if (!meta) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitToolRequest({
        repoUrl: repoUrl.trim(),
        name: meta.name,
        description: description.trim() || undefined,
        websiteUrl: meta.websiteUrl || undefined,
        author: meta.author || undefined,
        authorUrl: meta.authorUrl || undefined,
        license: meta.license || undefined,
        version: meta.version || undefined,
        since: meta.since || undefined,
        heroImageUrl: heroImageUrl || undefined,
        galleryImages: JSON.stringify(gallery.filter(Boolean)),
        galleryLayout,
        toolTypes,
        platforms,
      });

      if (!res.success) {
        setSubmitError(res.error.message || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(meta.name);
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Success screen ------------------------------------------------------
  if (submitted) {
    return (
      <motion.div {...reveal} className="glass-panel rounded-2xl border border-outline-variant/20 p-8 text-center md:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 ring-1 ring-primary/25">
          <span className="material-symbols-outlined text-[34px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            task_alt
          </span>
        </div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-white">Submitted for review</h2>
        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-on-surface-variant">
          Thanks — <span className="font-semibold text-on-surface">{submitted}</span> is now in our review queue. Our editors will
          polish the details and publish it. You can track its status in your dashboard.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-2.5 text-sm font-semibold text-on-primary-container transition-transform hover:scale-[1.03]"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            View my submissions
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmitted(null); setMeta(null); setRepoUrl(''); setDescription('');
              setHeroImageUrl(''); setGallery(['', '', '', '']); setToolTypes([]); setPlatforms([]);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 px-6 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-outline-variant/70 hover:text-on-surface"
          >
            Submit another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* STEP 1 — GitHub source ------------------------------------------- */}
      <section className="glass-panel rounded-2xl border border-outline-variant/20 p-6 md:p-7">
        <div className="mb-4 flex items-center gap-2.5">
          <StepDot n={1} done={!!meta} />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Repository</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <GithubMark />
            </span>
            <input
              type="url"
              inputMode="url"
              placeholder="github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => { setRepoUrl(e.target.value); setFetchError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-3 pl-12 pr-4 text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="button"
            onClick={handleFetch}
            disabled={isFetching || !repoUrl.trim()}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary-container transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <span className={`material-symbols-outlined text-[18px] ${isFetching ? 'animate-spin' : ''}`}>
              {isFetching ? 'progress_activity' : 'auto_awesome'}
            </span>
            {isFetching ? 'Fetching…' : meta ? 'Re-fetch' : 'Fetch details'}
          </button>
        </div>

        {!meta && !fetchError && (
          <p className="mt-3 text-xs text-on-surface-variant/70">
            Paste a public GitHub URL — we pull the name, stars, license and more automatically.
          </p>
        )}
        {fetchError && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-error">
            <span className="material-symbols-outlined text-[15px]">error</span>
            {fetchError}
          </p>
        )}
      </section>

      {/* Everything below reveals only after a successful fetch. */}
      <AnimatePresence>
        {meta && (
          <motion.div key="details" {...reveal} className="flex flex-col gap-6">
            {/* Fetched preview card */}
            <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface-container-lowest p-6">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-container">
                  {heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroImageUrl} alt={`${meta.name} logo`} className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <span className="material-symbols-outlined text-primary/70">deployed_code</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-white">{meta.name}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <span className="material-symbols-outlined text-[12px]">verified</span> from GitHub
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-yellow-400">star</span>{fmt(meta.stars)}</span>
                    <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">fork_right</span>{fmt(meta.forks)}</span>
                    {meta.license && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">balance</span>{meta.license}</span>}
                    {meta.author && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span>{meta.author}</span>}
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 2 — Optional description */}
            <section className="glass-panel rounded-2xl border border-outline-variant/20 p-6 md:p-7">
              <div className="mb-3 flex items-center gap-2.5">
                <StepDot n={2} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Description</h2>
                <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-on-surface-variant/60">Optional</span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One or two lines on what it does. Leave it blank and our editors will write one."
                className="w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm leading-relaxed text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </section>

            {/* STEP 3 — Images */}
            <section className="glass-panel rounded-2xl border border-outline-variant/20 p-6 md:p-7">
              <div className="mb-4 flex items-center gap-2.5">
                <StepDot n={3} />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Images</h2>
                <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-on-surface-variant/60">Optional</span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-[9rem_1fr]">
                {/* Logo */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Logo</span>
                  <ImageDropzone
                    value={heroImageUrl}
                    onChange={setHeroImageUrl}
                    aspect="square"
                    fit="contain"
                    filePrefix="logo"
                    hint="Logo"
                  />
                </div>

                {/* Gallery */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Screenshots</span>
                    <div className="flex rounded-lg border border-outline-variant/30 bg-surface-container-low p-0.5">
                      {(['16:9', '9:16'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setGalleryLayout(r)}
                          className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors ${galleryLayout === r ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={galleryLayout === '16:9' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-3'}>
                    {gallery.map((img, idx) => (
                      <ImageDropzone
                        key={idx}
                        value={img}
                        onChange={(url) => setGallery((g) => g.map((v, i) => (i === idx ? url : v)))}
                        aspect={galleryLayout === '16:9' ? 'video' : 'portrait'}
                        filePrefix={`gallery-${idx}`}
                        badge={idx + 1}
                        hint="Add"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 4 — Categories */}
            {(availableToolTypes.length > 0 || availablePlatforms.length > 0) && (
              <section className="glass-panel rounded-2xl border border-outline-variant/20 p-6 md:p-7">
                <div className="mb-4 flex items-center gap-2.5">
                  <StepDot n={4} />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Categories</h2>
                  <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-on-surface-variant/60">Optional</span>
                </div>

                {availableToolTypes.length > 0 && (
                  <div className="mb-4">
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
              </section>
            )}

            {/* Submit */}
            <div className="flex flex-col gap-3">
              {submitError && (
                <p className="flex items-center gap-1.5 text-sm text-error">
                  <span className="material-symbols-outlined text-[16px]">error</span>{submitError}
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container py-3.5 text-[15px] font-semibold text-on-primary-container shadow-lg shadow-primary-container/20 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                <span className={`material-symbols-outlined text-[19px] ${isSubmitting ? 'animate-spin' : ''}`}>
                  {isSubmitting ? 'progress_activity' : 'send'}
                </span>
                {isSubmitting ? 'Submitting…' : 'Submit for review'}
              </button>
              <p className="text-center text-[11px] text-on-surface-variant/60">
                A human reviews every submission before it goes live.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- small local pieces --------------------------------------------------- */

function StepDot({ n, done }: { n: number; done?: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
        done ? 'bg-primary text-on-primary' : 'bg-primary/15 text-primary'
      }`}
    >
      {done ? '✓' : n}
    </span>
  );
}

function PillGroup({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (n: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((name) => {
        const on = selected.includes(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onToggle(name)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              on
                ? 'border-primary-container bg-primary-container text-on-primary-container'
                : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
            }`}
          >
            {on && <span className="material-symbols-outlined text-[14px]">check</span>}
            {name}
          </button>
        );
      })}
    </div>
  );
}

const GithubMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.19a11.1 11.1 0 0 1 5.82 0c2.22-1.5 3.2-1.19 3.2-1.19.63 1.59.23 2.76.11 3.05.74.81 1.19 1.85 1.19 3.11 0 4.43-2.7 5.4-5.28 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
