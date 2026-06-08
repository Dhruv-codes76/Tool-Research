'use client';

import React from 'react';
import { SearchBar } from './SearchBar';
import { useToolFilter } from './ToolFilterContext';

/**
 * The homepage hero search box, wired to the shared ToolFilter context so the
 * <ToolExplorer /> grid below filters live as the user types.
 */
export function HeroSearchBar() {
  const { query, setQuery } = useToolFilter();
  return <SearchBar value={query} onSearch={setQuery} />;
}
