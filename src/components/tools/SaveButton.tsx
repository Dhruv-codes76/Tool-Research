'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSavedTools } from './SavedToolsProvider';

interface SaveButtonProps {
  toolId: string;
  /** `card` = overlay on a tool card; `hero` = matches the detail-page share button. */
  variant?: 'card' | 'hero';
}

/**
 * Wishlist heart. Optimistic toggle via SavedToolsProvider; bounces logged-out
 * users to /login with a return path. Stops click propagation so it never
 * triggers the card's wrapping <Link>.
 */
export function SaveButton({ toolId, variant = 'card' }: SaveButtonProps) {
  const { isSaved, toggle } = useSavedTools();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(toolId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const res = await toggle(toolId);
    setBusy(false);
    if (res === 'auth') {
      router.push(`/login?next=${encodeURIComponent(pathname || '/')}`);
    }
  };

  const base =
    variant === 'hero'
      ? 'w-8 h-8 bg-white/15 backdrop-blur-xl border border-white/25 shadow-xl'
      : 'w-8 h-8 bg-black/35 backdrop-blur-sm border border-white/10 shadow-lg';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save to wishlist'}
      title={saved ? 'Saved — click to remove' : 'Save to wishlist'}
      className={`group inline-flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${base} ${busy ? 'opacity-70' : ''}`}
    >
      <span
        className={`material-symbols-outlined text-[17px] transition-colors ${saved ? 'text-rose-400' : 'text-white/85 group-hover:text-rose-300'}`}
        style={{ fontVariationSettings: `'FILL' ${saved ? 1 : 0}` }}
      >
        favorite
      </span>
    </button>
  );
}
