'use client';

import React, { useState } from 'react';

interface ToolSearchFilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;

  platforms: string[];
  selectedPlatform: string; // 'All' or a platform name
  onPlatformChange: (p: string) => void;

  types: string[];
  selectedType: string; // 'All' or a type name
  onTypeChange: (t: string) => void;
}

type OpenMenu = 'platform' | 'type' | null;

/**
 * Unified search + filter bar for the tools directory. A single glass pill split
 * 2:1:1 — Search (½) | Platform (¼) | Type (¼) — echoing the segmented
 * "search bar" pattern but rendered in the product's dark-luxury glass language.
 */
export const ToolSearchFilterBar: React.FC<ToolSearchFilterBarProps> = ({
  query,
  onQueryChange,
  platforms,
  selectedPlatform,
  onPlatformChange,
  types,
  selectedType,
  onTypeChange,
}) => {
  const [open, setOpen] = useState<OpenMenu>(null);

  const renderFilter = (
    key: 'platform' | 'type',
    label: string,
    allLabel: string,
    options: string[],
    selected: string,
    onChange: (v: string) => void,
  ) => {
    const isOpen = open === key;
    const display = selected === 'All' ? allLabel : selected;

    return (
      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setOpen(isOpen ? null : key)}
          className={`group w-full flex items-center justify-between gap-2 px-5 py-2.5 rounded-full text-left hover-lift ${
            isOpen ? 'bg-on-surface/[0.06]' : 'hover:bg-on-surface/[0.04]'
          }`}
        >
          <span className="flex flex-col min-w-0">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-on-surface-variant">
              {label}
            </span>
            <span className={`text-sm truncate ${selected === 'All' ? 'text-on-surface-variant/60' : 'text-on-surface'}`}>
              {display}
            </span>
          </span>
          <span
            className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {isOpen && (
          <>
            <div
              className="glass-panel absolute left-0 right-0 top-full mt-3 z-[70] rounded-2xl p-1.5 max-h-72 overflow-y-auto shadow-2xl shadow-black/40 origin-top animate-pop-in"
              role="listbox"
            >
              {['All', ...options].map((opt) => {
                const active = selected === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(opt);
                      setOpen(null);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors duration-150 flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-primary-container text-on-primary-container font-medium'
                        : 'text-on-surface hover:bg-on-surface/[0.06]'
                    }`}
                  >
                    <span className="truncate">{opt === 'All' ? allLabel : opt}</span>
                    {active && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </button>
                );
              })}
              {options.length === 0 && (
                <p className="px-4 py-3 text-sm text-on-surface-variant/60">No {label.toLowerCase()}s yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Liquid-blur scrim — dims and blurs the rest of the page so an open
          filter is the only thing in focus. Fades via opacity (compositor-safe)
          and stays click-to-dismiss. The bar + popover sit above it. */}
      <div
        onClick={() => setOpen(null)}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-background/25 backdrop-blur-[3px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Flowing "liquid light" glow behind the bar — sits under the bar (earlier
          in DOM, no z-index) so its blurred, animated brand gradient reads as a
          premium light radiating from the edges. */}
      <div
        aria-hidden
        className="glow-flow pointer-events-none absolute -inset-[3px] rounded-3xl md:rounded-full"
      />

      <div
        className={`glass-panel relative rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row md:items-stretch gap-1 md:gap-0 shadow-[0_0_55px_-8px_rgba(79,70,229,0.55)] transition-shadow duration-300 ${
          open ? 'z-[65]' : 'z-0'
        }`}
      >
        {/* Search — half the bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 rounded-full md:flex-[2] transition-colors duration-200 focus-within:bg-on-surface/[0.04]">
        <span className="material-symbols-outlined text-on-surface-variant text-[22px]">search</span>
        <span className="flex flex-col flex-grow min-w-0">
          <label htmlFor="tool-search" className="text-[11px] uppercase tracking-[0.12em] font-semibold text-on-surface-variant">
            Search
          </label>
          <input
            id="tool-search"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tool name, author, or category…"
            className="w-full bg-transparent outline-none border-none text-sm text-on-surface placeholder-on-surface-variant/40 focus:ring-0 p-0"
          />
        </span>
      </div>

      {/* divider */}
      <div className="hidden md:block w-px self-center h-9 bg-outline-variant/30" />

      {renderFilter('platform', 'Platform', 'All platforms', platforms, selectedPlatform, onPlatformChange)}

      {/* divider */}
      <div className="hidden md:block w-px self-center h-9 bg-outline-variant/30" />

        {renderFilter('type', 'Type', 'All types', types, selectedType, onTypeChange)}
      </div>
    </div>
  );
};
