'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Share control for the tool detail hero. Opens a menu of explicit share
 * destinations (X, WhatsApp, LinkedIn, Facebook, Reddit, Telegram, Email) plus
 * copy-link. On devices with the native share sheet, a "More…" item opens it.
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = text ? `${title} — ${text}` : title;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const tt = encodeURIComponent(shareText);

  const targets: { name: string; href: string; icon: React.ReactNode }[] = [
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, icon: <IconX /> },
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, icon: <IconWhatsApp /> },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <IconLinkedIn /> },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <IconFacebook /> },
    { name: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${t}`, icon: <IconReddit /> },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}`, icon: <IconTelegram /> },
    { name: 'Email', href: `mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n\n${url}`)}`, icon: <IconMail /> },
  ];

  const openTarget = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      /* user cancelled / unsupported */
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Share ${title}`}
        className="inline-flex items-center justify-center w-9 h-9 text-white transition-all hover:scale-110 active:scale-90"
      >
        {/* Instagram-style share: bare outline paper-plane, no circle. */}
        <span
          className="material-symbols-outlined text-[26px] -translate-y-px drop-shadow-sm"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          send
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 z-30 rounded-2xl border border-white/15 bg-[#14161a]/90 backdrop-blur-2xl shadow-2xl p-2 origin-top-right"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.55)' }}
        >
          {targets.map((target: any) => (
            <button
              key={target.name}
              role="menuitem"
              type="button"
              onClick={() => openTarget(target.href)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              <span className="shrink-0 text-white/80">{target.icon}</span>
              <span className="font-medium">{target.name}</span>
            </button>
          ))}

          <div className="my-1.5 h-px bg-white/10" />

          <button
            role="menuitem"
            type="button"
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-white/80">
              {copied ? 'check' : 'link'}
            </span>
            <span className="font-medium">{copied ? 'Link copied!' : 'Copy link'}</span>
          </button>

          {hasNativeShare && (
            <button
              role="menuitem"
              type="button"
              onClick={nativeShare}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-white/80">more_horiz</span>
              <span className="font-medium">More…</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* Brand marks — compact inline SVGs (currentColor where monochrome reads best). */
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);
const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.37-.15-.2-1.19-1.58-1.19-3.02 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.14.12.31.02.51-.09.2-.14.31-.27.48-.14.16-.29.36-.41.49-.14.14-.28.28-.12.56.16.27.71 1.18 1.53 1.91 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.2.68-.79.86-1.07.18-.27.36-.22.61-.13.25.09 1.6.75 1.87.89.27.13.46.2.53.31.07.11.07.64-.17 1.32Z" />
  </svg>
);
const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);
const IconFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07Z" />
  </svg>
);
const IconReddit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 11.78a2.6 2.6 0 0 0-4.4-1.86 12.78 12.78 0 0 0-6.86-2.16l1.17-3.7 3.16.75a1.86 1.86 0 1 0 .2-.93l-3.5-.83a.39.39 0 0 0-.47.27l-1.3 4.1a12.83 12.83 0 0 0-7.02 2.16 2.6 2.6 0 1 0-2.87 4.27 5.1 5.1 0 0 0-.06.8c0 4.06 4.73 7.36 10.56 7.36s10.56-3.3 10.56-7.36c0-.27-.02-.54-.06-.8A2.6 2.6 0 0 0 24 11.78ZM6.33 13.6a1.86 1.86 0 1 1 3.72 0 1.86 1.86 0 0 1-3.72 0Zm10.4 4.92c-1.27 1.27-3.7 1.37-4.42 1.37-.72 0-3.15-.1-4.42-1.37a.48.48 0 0 1 .68-.68c.8.8 2.52.99 3.74.99 1.22 0 2.93-.19 3.74-.99a.48.48 0 1 1 .68.68Zm-.29-3.06a1.86 1.86 0 1 1 0-3.72 1.86 1.86 0 0 1 0 3.72Z" />
  </svg>
);
const IconTelegram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.94 4.3 18.6 19.86c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.4-8.5c.4-.36-.09-.56-.63-.2L5.16 13.18l-5-1.57c-1.08-.34-1.1-1.08.23-1.6l19.55-7.53c.9-.34 1.7.2 1.4 1.82Z" />
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm9 7.13 8-5.13H4l8 5.13Zm0 2.37L4 8.37V18h16V8.37l-8 5.13Z" />
  </svg>
);
