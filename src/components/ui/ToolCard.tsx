import React from 'react';
import Link from 'next/link';

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
}

export const ToolCard: React.FC<ToolCardProps> = ({ id, slug, name, stars, description, tags, icon, color, logoUrl }) => {
  return (
    <Link href={`/tools/${slug}`} className="block h-full">
      <div className="bg-surface rounded-2xl border border-outline-variant/30 p-6 hover:scale-[1.02] hover:border-outline-variant/60 transition-all duration-300 group cursor-pointer flex flex-col h-full">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden ${color}`}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={`${name} logo`} className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface text-lg">{name}</h3>
            <div className="flex items-center gap-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[14px]">star</span>
              <span>{stars}</span>
            </div>
          </div>
        </div>
        <p className="font-body-base text-body-base text-on-surface-variant flex-grow text-sm">
          {description}
        </p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {tags.map((tag: any) => (
            <span key={tag} className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
