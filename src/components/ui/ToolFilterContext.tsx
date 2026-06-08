'use client';

import React, { createContext, useContext, useState } from 'react';

interface ToolFilterContextValue {
  query: string;
  setQuery: (q: string) => void;
}

const ToolFilterContext = createContext<ToolFilterContextValue | null>(null);

/**
 * Shares the live search query between the hero <SearchBar /> and the
 * <ToolExplorer /> grid, which live in different parts of the tree. Keeping it
 * in context lets the search box stay visually in the hero while the grid below
 * reacts to it without prop-drilling across the server/client boundary.
 */
export function ToolFilterProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  return (
    <ToolFilterContext.Provider value={{ query, setQuery }}>
      {children}
    </ToolFilterContext.Provider>
  );
}

export function useToolFilter(): ToolFilterContextValue {
  const ctx = useContext(ToolFilterContext);
  if (!ctx) {
    throw new Error('useToolFilter must be used within a ToolFilterProvider');
  }
  return ctx;
}
