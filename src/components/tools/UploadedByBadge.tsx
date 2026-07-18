import React from 'react';

/**
 * Compact "Uploaded by …" trust marker for the hero card.
 *
 * At rest it is just the round `verified` badge icon. On hover (or keyboard
 * focus) a label slides out of the icon to the right — a pill that grows from
 * behind the badge and reveals the attribution inline, with zero layout shift.
 * - Platform admins are credited generically as "Platform Admin".
 * - Community submissions (any non-admin uploader) credit the submitter by name
 *   (never their email) and carry a Verified stamp — a vetted community listing.
 *
 * Pure CSS (group-hover / group-focus-within) — no client JS.
 *
 * `role` is the uploader's User.role ("ADMIN" | "USER").
 */
export function UploadedByBadge({ name, role }: { name: string | null; role: string | null }) {
  const isAdmin = role === 'ADMIN';
  const isVerified = !isAdmin;
  const displayName = isAdmin ? 'Platform Admin' : name?.trim() || 'A community member';

  return (
    <div
      tabIndex={0}
      aria-label={`Uploaded by ${displayName}`}
      className="group relative inline-flex h-8 shrink-0 items-center outline-none"
    >
      {/* Label — slides out of the icon to the right on hover/focus */}
      <div className="pointer-events-none absolute left-0 top-1/2 z-0 flex h-8 max-w-[2rem] -translate-y-1/2 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-[#14161a]/95 pl-10 pr-0 opacity-0 ring-1 ring-white/15 backdrop-blur-xl transition-all duration-300 ease-out group-hover:max-w-[24rem] group-hover:pr-4 group-hover:opacity-100 group-focus-within:max-w-[24rem] group-focus-within:pr-4 group-focus-within:opacity-100">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/45">Uploaded by</span>
        <span className="text-xs font-bold text-white">{displayName}</span>
        {isVerified && (
          <span className="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
            Verified
          </span>
        )}
      </div>

      {/* Verified badge — always visible, sits on top of the sliding label */}
      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40 transition-colors group-hover:bg-primary/25">
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified
        </span>
      </span>
    </div>
  );
}
