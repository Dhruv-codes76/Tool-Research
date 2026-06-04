'use client';

import React, { useEffect, useState } from 'react';
import { parseDownloadAssets, osIcon, type DownloadAsset } from '@/lib/install';

interface DownloadButtonProps {
  downloadUrl?: string | null;
  downloadAssets?: string | null; // JSON string of DownloadAsset[]
  repoUrl: string;
}

const pillClass =
  'inline-flex items-center justify-between gap-3 bg-primary text-on-primary pl-4 pr-1 py-1 rounded-full font-mono text-sm hover:scale-[1.02] transition-transform shadow-xl w-fit group';

export const DownloadButton: React.FC<DownloadButtonProps> = ({ downloadUrl, downloadAssets, repoUrl }) => {
  const [open, setOpen] = useState(false);

  // Merge curated assets with the single-link fallback into one option list.
  const options: DownloadAsset[] = parseDownloadAssets(downloadAssets);
  if (downloadUrl && downloadUrl.trim() !== '' && !options.some(o => o.url === downloadUrl)) {
    options.push({ label: 'Direct download', url: downloadUrl });
  }

  const releasesUrl = `${repoUrl.replace(/\/$/, '')}/releases/latest`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (options.length === 0) return null;

  // Single option → direct link, mirrors the original button behavior.
  if (options.length === 1) {
    return (
      <a href={options[0].url} target="_blank" rel="noopener noreferrer" className={pillClass}>
        <span className="tracking-wide lowercase font-bold">download</span>
        <div className="bg-black/20 text-on-primary w-7 h-7 rounded-full flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <span className="material-symbols-outlined text-[16px]">download</span>
        </div>
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={pillClass}>
        <span className="tracking-wide lowercase font-bold">download</span>
        <div className="bg-black/20 text-on-primary w-7 h-7 rounded-full flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-md rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
              <h3 className="font-headline-md text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">download</span>
                Choose your download
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 p-4 max-h-[60vh] overflow-y-auto">
              {options.map((opt, idx) => (
                <a
                  key={idx}
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-high/50 transition-colors group/opt"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    {opt.os ? osIcon(opt.os) : 'download'}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-on-surface truncate">{opt.label}</span>
                    {opt.arch && (
                      <span className="text-[11px] text-on-surface-variant">{opt.arch}</span>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant ml-auto group-hover/opt:text-primary transition-colors">
                    download
                  </span>
                </a>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-outline-variant/20 text-center">
              <p className="text-xs text-on-surface-variant">
                Not sure which to pick?{' '}
                <a
                  href={releasesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline underline-offset-2 inline-flex items-center gap-1"
                >
                  See all releases on GitHub
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
