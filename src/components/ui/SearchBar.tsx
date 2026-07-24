'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  /** Controlled value. When provided, the component reflects this value. */
  value?: string;
  /** Called with the current text on every change (live search). */
  onSearch?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search the best open-source tools...",
  value,
  onSearch,
}) => {
  const [internal, setInternal] = useState('');
  const current = value !== undefined ? value : internal;

  const update = (next: string) => {
    if (value === undefined) setInternal(next);
    onSearch?.(next);
  };

  const hasText = current.trim().length > 0;

  return (
    // Mirrors the "Frequently Searched" bar: dark surface, hairline border that
    // lights primary on hover/focus, and the shared liquid glow behind it.
    <div className="w-full max-w-2xl relative group">
      {/* Flowing liquid light glow behind the bar */}
      <div
        aria-hidden
        className="glow-flow pointer-events-none absolute -inset-0.5 rounded-full opacity-80"
      />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="relative z-10 flex items-center bg-[#1a1a1a] border border-outline-variant/20 rounded-full px-5 py-3 md:px-6 md:py-4 transition-colors duration-300 group-hover:border-primary/50 focus-within:border-primary/60 md:shadow-[0_0_55px_-8px_rgba(79,70,229,0.55)] md:group-hover:shadow-[0_0_65px_-8px_rgba(79,70,229,0.7)]"
      >
        <span className="material-symbols-outlined text-on-surface-variant mr-4 text-[22px] shrink-0">
          search
        </span>
        <input
          className="w-full bg-transparent border-none text-on-surface font-body-base focus:ring-0 placeholder-on-surface-variant/50 outline-none"
          placeholder={placeholder}
          type="text"
          value={current}
          onChange={(e) => update(e.target.value)}
        />

        {/* Clear — appears only when there's a query, so the resting state stays clean. */}
        {hasText && (
          <button
            type="button"
            onClick={() => update('')}
            aria-label="Clear search"
            className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-outline-variant/20 active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}

        {/* Minimal circular submit — replaces the old filled "SEARCH" pill. */}
        <button
          type="submit"
          aria-label="Search"
          className="ml-2 w-9 h-9 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-white hover:bg-primary/20 active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </form>
    </div>
  );
};
