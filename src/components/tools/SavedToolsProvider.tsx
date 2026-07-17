'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getSavedToolIds, toggleSavedTool } from '@/app/actions/userActions';

type ToggleResult = 'saved' | 'removed' | 'auth';

interface SavedToolsValue {
  isSaved: (toolId: string) => boolean;
  toggle: (toolId: string) => Promise<ToggleResult>;
  ready: boolean;
}

const SavedToolsContext = createContext<SavedToolsValue | null>(null);

/**
 * App-wide wishlist state. Fetches the user's saved tool ids once on mount
 * (client-side, so the ISR-cached public pages stay cacheable and per-user
 * state hydrates after paint) and exposes an optimistic toggle.
 */
export function SavedToolsProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    let active = true;
    getSavedToolIds()
      .then((arr) => { if (active) setIds(new Set(arr)); })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const isSaved = useCallback((toolId: string) => ids.has(toolId), [ids]);

  const toggle = useCallback(async (toolId: string): Promise<ToggleResult> => {
    const wasSaved = ids.has(toolId);
    // Optimistic flip.
    setIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(toolId); else next.add(toolId);
      return next;
    });

    const res = await toggleSavedTool(toolId);
    if ('requiresAuth' in res) {
      // Revert; caller redirects to login.
      setIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(toolId); else next.delete(toolId);
        return next;
      });
      return 'auth';
    }

    // Reconcile with server truth.
    setIds((prev) => {
      const next = new Set(prev);
      if (res.saved) next.add(toolId); else next.delete(toolId);
      return next;
    });
    return res.saved ? 'saved' : 'removed';
  }, [ids]);

  return (
    <SavedToolsContext.Provider value={{ isSaved, toggle, ready }}>
      {children}
    </SavedToolsContext.Provider>
  );
}

export function useSavedTools(): SavedToolsValue {
  const ctx = useContext(SavedToolsContext);
  if (!ctx) throw new Error('useSavedTools must be used inside <SavedToolsProvider>');
  return ctx;
}
