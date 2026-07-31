"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";

interface ToolTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolTypeModal({ isOpen, onClose }: ToolTypeModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSelect = (sourceType: "OPEN_SOURCE" | "PROPRIETARY") => {
    startTransition(() => {
      router.push(`/admin/tools/new?sourceType=${sourceType}`);
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-high/95 p-6 md:p-8 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-label-sm text-primary uppercase tracking-widest mb-1">
              <span>Admin Curation</span>
              <span>•</span>
              <span>New Listing</span>
            </div>
            <h2 className="font-display-lg text-2xl font-bold text-on-surface tracking-tight">
              Select Tool Source Type
            </h2>
            <p className="font-body-base text-sm text-on-surface-variant mt-1">
              Choose how this tool is hosted and listed in the dictionary.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          {/* Open Source Option */}
          <button
            disabled={isPending}
            onClick={() => handleSelect("OPEN_SOURCE")}
            className="group relative flex flex-col text-left p-6 rounded-xl border border-outline-variant/20 bg-surface-container-low/60 hover:bg-primary-container/10 hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-[22px]">code</span>
              </div>
              <span className="text-[10px] font-label-sm uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                GitHub Sync
              </span>
            </div>
            <h3 className="font-headline-sm text-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
              Open Source Tool
            </h3>
            <p className="font-body-base text-xs leading-relaxed text-on-surface-variant mt-2">
              Public code repository with automated GitHub star/fork counts, release sync, and community metadata.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span>Continue with Open Source</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </button>

          {/* Proprietary / Closed Source Option */}
          <button
            disabled={isPending}
            onClick={() => handleSelect("PROPRIETARY")}
            className="group relative flex flex-col text-left p-6 rounded-xl border border-[#D9A441]/25 bg-surface-container-low/60 hover:bg-[#D9A441]/10 hover:border-[#D9A441]/60 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40 disabled:opacity-50"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#D9A441]/20 flex items-center justify-center text-[#D9A441] group-hover:bg-[#D9A441] group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
              </div>
              <span className="text-[10px] font-label-sm uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30">
                Curator Notice
              </span>
            </div>
            <h3 className="font-headline-sm text-lg font-semibold text-on-surface group-hover:text-[#D9A441] transition-colors">
              Closed Source / Proprietary
            </h3>
            <p className="font-body-base text-xs leading-relaxed text-on-surface-variant mt-2">
              Commercial or closed-source tool listed for quality and utility. Uses official website link and notice badge.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#D9A441]">
              <span>Continue with Proprietary</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-outline-variant/10 text-center">
          <p className="text-[11px] text-on-surface-variant/70">
            You can also toggle between Open Source and Proprietary at any time inside the form editor.
          </p>
        </div>
      </div>
    </div>
  );
}
