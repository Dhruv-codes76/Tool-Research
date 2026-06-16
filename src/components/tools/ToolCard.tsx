import React from 'react';
import { Share, Star, GitFork, History, Download, Grip } from 'lucide-react';

export interface ToolCardProps {
  category?: string;
  title?: string;
  description?: string;
  stars?: string;
  forks?: string;
  version?: string;
  logoUrl?: string;
  onShare?: () => void;
  onViewRepo?: () => void;
  onDownload?: () => void;
}

export function ToolCard({
  category = 'BROWSER',
  title = 'Brave',
  description = 'Brave browser for Android, iOS, Linux, macOS, Windows.',
  stars = '22.8k',
  forks = '3.1k',
  version = 'v1.91.171',
  logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Brave_icon_lionface.png',
  onShare,
  onViewRepo,
  onDownload,
}: ToolCardProps) {
  return (
    <div className="relative w-full max-w-[420px] rounded-[32px] bg-[#161113] p-8 border border-white/5 overflow-hidden font-sans shadow-2xl">
      {/* Subtle top-left background glow */}
      <div className="absolute -top-24 -left-12 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="px-4 py-1.5 rounded-full bg-[#1c132b] border border-indigo-500/20">
          <span className="text-indigo-400 text-xs font-bold tracking-wider uppercase">
            {category}
          </span>
        </div>
        <button
          onClick={onShare}
          className="w-14 h-14 rounded-full bg-[#3b3538] flex items-center justify-center border border-white/10 hover:bg-[#463f43] transition-colors"
          aria-label="Share"
        >
          <Share className="w-5 h-5 text-zinc-200" strokeWidth={2.5} />
        </button>
      </div>

      {/* Title & Icon */}
      <div className="relative flex items-center gap-5 mt-8">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center">
          {/* Using a standard img tag for the logo */}
          <img src={logoUrl} alt={`${title} logo`} className="w-full h-full object-contain" />
        </div>
        <h2 className="text-white text-[42px] font-bold tracking-tight leading-none">
          {title}
        </h2>
      </div>

      {/* Description */}
      <p className="relative mt-5 text-[19px] text-zinc-300 font-medium leading-[1.4] tracking-tight pr-4">
        {description}
      </p>

      {/* Stats Pill */}
      <div className="relative mt-8 flex items-center gap-6 px-6 py-4 rounded-full border border-white/10 bg-[#0a0809] w-fit shadow-inner">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-bold text-[17px] tracking-wide">
            {stars} Stars
          </span>
        </div>
        <div className="w-px h-5 bg-white/15" />
        <div className="flex items-center gap-3">
          <GitFork className="w-6 h-6 text-zinc-300" strokeWidth={2.5} />
          <span className="text-white font-bold text-[17px] tracking-wide">
            {forks} Forks
          </span>
        </div>
      </div>

      {/* Version */}
      <div className="relative mt-6 flex items-center gap-3">
        <History className="w-6 h-6 text-zinc-300" strokeWidth={2} />
        <span className="text-zinc-400 text-[17px] font-medium tracking-wide">
          Version: <span className="text-white font-bold">{version}</span>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="relative mt-10 flex items-center gap-4">
        <button
          onClick={onViewRepo}
          className="flex-1 flex items-center justify-between h-[68px] pl-7 pr-2.5 rounded-full bg-[#40393c] hover:bg-[#4d4548] transition-all group border border-white/5"
        >
          <span className="text-white font-bold text-[17px] tracking-wide">
            view repo
          </span>
          <div className="w-12 h-12 rounded-full bg-[#f49cf4] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Grip className="w-6 h-6 text-[#40393c]" strokeWidth={2.5} />
          </div>
        </button>

        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-between h-[68px] pl-7 pr-2.5 rounded-full bg-[#40393c] hover:bg-[#4d4548] transition-all group border border-white/5"
        >
          <span className="text-white font-bold text-[17px] tracking-wide">
            download
          </span>
          <div className="w-12 h-12 rounded-full bg-[#201836] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Download className="w-5 h-5 text-indigo-400" strokeWidth={3} />
          </div>
        </button>
      </div>
    </div>
  );
}
