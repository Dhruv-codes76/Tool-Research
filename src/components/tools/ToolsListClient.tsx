'use client';

import React, { useMemo, useState } from 'react';
import { ToolCard } from '@/components/ui/ToolCard';
import { ToolSearchFilterBar } from '@/components/tools/ToolSearchFilterBar';

interface ToolItem {
  id: string;
  name: string;
  stars: string;
  description: string;
  author: string;
  tags: string[];
  icon: string;
  color: string;
  logoUrl?: string | null;
  slug: string;
}

interface ToolsListClientProps {
  initialTools: ToolItem[];
  allPlatforms: string[];
  allTypes: string[];
}

// 4 cards per row × 4 rows = 16 tools per page.
const PAGE_SIZE = 16;

/**
 * Build a compact page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 12].
 * Always shows first/last and a window around the current page.
 */
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');

  pages.push(total);
  return pages;
}

export const ToolsListClient: React.FC<ToolsListClientProps> = ({
  initialTools,
  allPlatforms,
  allTypes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);

  // Filter tools dynamically on the client for instant, reactive responsiveness.
  // Search spans tool name, author, and both category types (stored in `tags`);
  // the two filters narrow by platform and tool type independently.
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialTools.filter((tool) => {
      const matchesSearch =
        !q ||
        [tool.name, tool.author, ...tool.tags]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q));

      const matchesPlatform = selectedPlatform === 'All' || tool.tags.includes(selectedPlatform);
      const matchesType = selectedType === 'All' || tool.tags.includes(selectedType);

      return matchesSearch && matchesPlatform && matchesType;
    });
  }, [initialTools, searchQuery, selectedPlatform, selectedType]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));

  // Snap back to the first page whenever the search/filter changes — done during
  // render (React's recommended pattern) rather than in an effect to avoid an
  // extra render pass. https://react.dev/learn/you-might-not-need-an-effect
  const filterKey = `${searchQuery}|${selectedPlatform}|${selectedType}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  // Guard against a stale page index if the result set shrank.
  const currentPage = Math.min(page, totalPages);
  const pageTools = filteredTools.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <>
      {/* Unified search + filter bar */}
      <div className="mb-16">
        <ToolSearchFilterBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          platforms={allPlatforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          types={allTypes}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      {/* Tools Grid — 4 per row */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pageTools.map((tool: any) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl bg-surface-container border border-outline-variant/30">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">search_off</span>
          <h3 className="font-headline-sm text-on-surface mb-2">No matching tools found</h3>
          <p className="text-on-surface-variant font-body-base max-w-md mx-auto">
            Try adjusting your search query or selecting a different category to discover open-source excellence.
          </p>
        </div>
      )}

      {/* Pagination — only when results span more than one page */}
      {totalPages > 1 && (
        <nav className="mt-20 flex justify-center" aria-label="Pagination">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover-lift hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            {buildPageList(currentPage, totalPages).map((p, i) =>
              p === 'ellipsis' ? (
                <span
                  key={`e${i}`}
                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant/50 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-label-sm border hover-lift ${
                    p === currentPage
                      ? 'bg-primary-container text-on-primary-container border-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover-lift hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};
