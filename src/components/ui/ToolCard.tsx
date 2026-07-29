import React from 'react';
import Link from 'next/link';
import { SaveButton } from '@/components/tools/SaveButton';

interface ToolCardProps {
  id: string;
  slug: string;
  name: string;
  stars: string;
  description: string;
  tags: string[];
  icon: string;
  color: string;
  logoUrl?: string | null;
  /** "OPEN_SOURCE" (default) | "PROPRIETARY" */
  sourceType?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ id, slug, name, stars, description, tags, icon, color, logoUrl, sourceType }) => {
  // A proprietary listing has no repo and therefore no star count. The amber
  // accent + label is the same recognition cue used on the detail page, so the
  // two kinds stay tellable apart without reading a word.
  const isProprietary = sourceType === 'PROPRIETARY';

  return (
    <Link href={`/tools/${slug}`} className="block h-full">
      <div className="relative overflow-hidden bg-surface rounded-2xl border border-outline-variant/30 hover:border-outline-variant/60 p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer flex flex-col h-full min-h-[215px]">
        {/* Wishlist heart — overlay, stops propagation so it doesn't navigate.
            Uses the same bare Instagram-style heart as the detail-page hero. */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <SaveButton toolId={id} variant="hero" />
        </div>
        <div className="flex items-center gap-4 mb-4 pr-6">
          <div className={`w-12 h-12 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden shrink-0 ${color}`}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={`${name} logo`} className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 min-w-0">
              <h3 className="font-headline-md text-headline-md text-on-surface text-lg truncate whitespace-nowrap" title={name}>{name}</h3>
              {/* Verified curation mark — matches the detail-page hero tick. */}
              <span
                role="img"
                aria-label="Verified tool"
                title="Verified — human-curated listing"
                className="material-symbols-outlined shrink-0 !text-[12px] sm:!text-[14px] leading-none"
                style={{ color: '#1D9BF0', fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            {isProprietary ? (
              <div className="flex items-center gap-1 text-[#D9A441] text-xs mt-0.5">
                <span className="font-medium">Proprietary</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-0.5">
                <span className="material-symbols-outlined text-[14px]">star</span>
                <span>{stars}</span>
              </div>
            )}
          </div>
        </div>
        <p 
          className="font-body-base text-body-base text-on-surface-variant flex-grow text-sm"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          title="Click to see more"
        >
          {description}
        </p>
        <div 
          className="mt-8 flex gap-2 overflow-hidden whitespace-nowrap"
          style={{ 
            maskImage: "linear-gradient(to right, black 80%, transparent 100%)", 
            WebkitMaskImage: "-webkit-linear-gradient(left, black 80%, transparent 100%)" 
          }}
        >
          {tags.map((tag) => (
            <span key={tag} className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded shrink-0">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
