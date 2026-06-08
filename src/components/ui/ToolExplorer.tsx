'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ToolCard } from './ToolCard';
import { CategoryChip } from './CategoryChip';
import { useToolFilter } from './ToolFilterContext';

export interface CardTool {
  id: string;
  name: string;
  stars: string;
  description: string;
  author: string;
  tags: string[];
  icon: string;
  color: string;
  logoUrl?: string | null;
}

// The four filters the homepage exposes. "All Tools" is the reset state.
const CATEGORIES = ['All Tools', 'Android', 'Linux', 'MCP Servers'] as const;

// A tool's `tags` array is the union of its platform + toolType names. We match
// each chip against those tags loosely (case-insensitive, alias-aware) so the
// filter keeps working regardless of small naming differences in the DB
// (e.g. "MCP Server" vs "MCP Servers").
const ALIASES: Record<string, string[]> = {
  Android: ['android'],
  Linux: ['linux'],
  'MCP Servers': ['mcp server', 'mcp servers', 'mcp'],
};

function matchesCategory(tags: string[], category: string): boolean {
  if (category === 'All Tools') return true;
  const wanted = ALIASES[category] ?? [category.toLowerCase()];
  const normalized = tags.map((t) => t.toLowerCase().trim());
  return normalized.some((tag) => wanted.some((w) => tag === w || tag.includes(w)));
}

// Free-text search across tool name, author, and both category types
// (platforms + toolTypes, which are stored together in `tags`).
function matchesQuery(tool: CardTool, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [tool.name, tool.author, ...tool.tags]
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  return haystack.some((field) => field.includes(q));
}

export function ToolExplorer({ tools }: { tools: CardTool[] }) {
  const [active, setActive] = useState<string>('All Tools');
  const { query } = useToolFilter();

  const filtered = useMemo(
    () => tools.filter((tool) => matchesCategory(tool.tags, active) && matchesQuery(tool, query)),
    [tools, active, query]
  );

  return (
    <>
      {/* Category filters — relative z-20 keeps the row above the relatively-
          positioned hero section, which would otherwise paint over (and steal
          clicks from) these chips where the negative margin overlaps it. */}
      <div className="relative z-20 flex flex-wrap justify-center gap-3 px-gutter -mt-12 md:-mt-20">
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            isActive={active === cat}
            onClick={() => setActive(cat)}
          />
        ))}
      </div>

      {/* Tools grid */}
      <section className="px-gutter pb-32 max-w-container-max mx-auto w-full mt-20">
        <div className="flex justify-between items-end mb-stack-md border-b border-outline-variant/20 pb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Tools</h2>
          <Link
            className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors flex items-center gap-1"
            href="/tools"
          >
            VIEW ALL <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.length === 0 ? (
            <div className="col-span-full text-center py-10 text-on-surface-variant">
              No tools found in the database yet.
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((tool) => <ToolCard key={tool.id} {...tool} />)
          ) : (
            <div className="col-span-full text-center py-10 text-on-surface-variant">
              {query.trim()
                ? `No tools match “${query.trim()}”${active !== 'All Tools' ? ` in ${active}` : ''}.`
                : `No tools match the “${active}” filter.`}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
