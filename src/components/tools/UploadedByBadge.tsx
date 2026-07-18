import React from 'react';

/**
 * Compact "Uploaded by …" trust marker for the hero card.
 *
 * A small icon sits inline in the hero; hovering it reveals a glass popover
 * crediting the uploader:
 * - Platform admins are credited generically as "Platform Admin" — the platform's
 *   own listing, no Verified stamp.
 * - Community submissions (any non-admin uploader) credit the submitter by name
 *   (never their email) and carry a Verified stamp — a vetted community listing.
 *
 * Pure CSS hover (group-hover) — no client JS. The popover is non-interactive.
 *
 * `role` is the uploader's User.role ("ADMIN" | "USER").
 */
export function UploadedByBadge({ name, role }: { name: string | null; role: string | null }) {
  const isAdmin = role === 'ADMIN';
  const isVerified = !isAdmin;
  const displayName = isAdmin ? 'Platform Admin' : name?.trim() || 'A community member';

  return (
    <div className="group relative inline-flex shrink-0">
      <span
        aria-label={`Uploaded by ${displayName}`}
        tabIndex={0}
        className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isVerified
            ? 'bg-primary/15 ring-1 ring-primary/40 text-primary'
            : 'bg-white/10 ring-1 ring-white/20 text-white/80'
        }`}
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isVerified ? 'verified' : 'shield_person'}
        </span>
      </span>

      {/* Hover popover — opens downward, stays inside the hero card */}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-max min-w-[11rem] origin-top-left translate-y-1 scale-95 rounded-2xl border border-white/15 bg-[#14161a]/90 p-3.5 opacity-0 shadow-2xl backdrop-blur-2xl transition-all duration-150 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100"
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">Uploaded by</p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm font-bold text-white">
          {displayName}
          {isVerified && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
              <span
                className="material-symbols-outlined text-[11px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              Verified
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
