import React from 'react';

const AVATAR_COLORS = [
  'bg-indigo-500/20 text-indigo-200 ring-indigo-400/30',
  'bg-sky-500/20 text-sky-200 ring-sky-400/30',
  'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30',
  'bg-amber-500/20 text-amber-100 ring-amber-400/30',
  'bg-pink-500/20 text-pink-200 ring-pink-400/30',
  'bg-purple-500/20 text-purple-200 ring-purple-400/30',
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * "Uploaded by …" trust attribution shown on a tool page.
 * - Platform admins are credited generically as "Platform Admin" with a Verified
 *   trust badge — the platform vouches for the listing, not an individual.
 * - Community submissions credit the submitter by name (never their email).
 *
 * `role` is the uploader's User.role ("ADMIN" | "USER").
 */
export function UploadedBy({ name, role }: { name: string | null; role: string | null }) {
  const isAdmin = role === 'ADMIN';

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/60 p-4"
      style={{ boxShadow: '0 0 24px rgba(62, 166, 255, 0.06)' }}
    >
      {isAdmin ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 ring-1 ring-primary/30">
          <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
        </span>
      ) : (
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ring-1 ${colorFor(name || 'community')}`}>
          {(name || 'C').trim().charAt(0)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/70">Uploaded by</p>
        {isAdmin ? (
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-on-surface">
            Platform Admin
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              Verified
            </span>
          </p>
        ) : (
          <p className="truncate text-sm font-bold text-on-surface">{name?.trim() || 'A community member'}</p>
        )}
      </div>
    </div>
  );
}
