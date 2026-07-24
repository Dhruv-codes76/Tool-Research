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
  // Drives the Instagram-style "pop" — set only on a user tap, so an
  // already-saved tool doesn't animate on load.
  const [bump, setBump] = useState(false);
  const saved = isSaved(toolId);
  const isHero = variant === 'hero';

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    setBump(true);
    const res = await toggle(toolId);
    setBusy(false);
    if (res === 'auth') {
      router.push(`/login?next=${encodeURIComponent(pathname || '/')}`);
    }
  };

  // Hero (detail page) = bare Instagram-style icon, no circle/border. Card =
  // keep the dark glass pill so the heart stays legible over any screenshot.
  const shell = isHero
    ? 'w-9 h-9 hover:scale-110 active:scale-90'
    : 'w-8 h-8 rounded-full bg-black/35 backdrop-blur-sm border border-white/10 shadow-lg hover:scale-110 active:scale-95';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save to wishlist'}
      title={saved ? 'Saved — click to remove' : 'Save to wishlist'}
      className={`group inline-flex items-center justify-center transition-all ${shell} ${busy ? 'opacity-80' : ''}`}
    >
      <span
        onAnimationEnd={() => setBump(false)}
        className={`material-symbols-outlined transition-colors ${isHero ? 'text-[26px] drop-shadow-sm' : 'text-[17px]'} ${bump ? 'animate-heart-pop' : ''} ${
          saved
            ? isHero
              ? 'text-[#ED4956]'
              : 'text-rose-400'
            : isHero
              ? 'text-white group-hover:text-white/80'
              : 'text-white/85 group-hover:text-rose-300'
        }`}
        style={{ fontVariationSettings: `'FILL' ${saved ? 1 : 0}` }}
      >
        favorite
      </span>
    </button>
  );
}
