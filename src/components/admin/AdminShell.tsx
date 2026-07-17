'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AdminShellUser = {
  name: string | null;
  email: string | null;
  isPrimaryAdmin: boolean;
};

type NavItem = {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
  badge?: 'submissions';
  primaryOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', icon: 'bar_chart', label: 'Analytics', exact: true },
  { href: '/admin/tools', icon: 'build', label: 'Tools' },
  { href: '/admin/submissions', icon: 'inbox', label: 'Submissions', badge: 'submissions' },
  { href: '/admin/categories', icon: 'category', label: 'Categories' },
  { href: '/admin/manage-admins', icon: 'admin_panel_settings', label: 'Manage Admins' },
  { href: '/admin/audit-log', icon: 'history', label: 'Audit Log', primaryOnly: true },
  { href: '/admin/blogs', icon: 'article', label: 'Blogs' },
  { href: '/admin/settings', icon: 'settings', label: 'Settings' },
];

/**
 * Client shell for the admin panel. On md+ it renders the static sidebar exactly
 * as before; below md the sidebar becomes a slide-in drawer opened from a mobile
 * top bar, so the admin panel is navigable on a phone (previously the sidebar was
 * `hidden md:flex` with no replacement, leaving mobile users with no navigation).
 *
 * Data (the admin user + pending-submission count) is fetched in the server
 * layout and passed down — this component only owns the open/close UI state.
 */
export function AdminShell({
  user,
  submissionCount,
  children,
}: {
  user: AdminShellUser;
  submissionCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = NAV_ITEMS.filter((item) => !item.primaryOnly || user.isPrimaryAdmin);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile backdrop — click to dismiss the drawer */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar: static on md+, slide-in drawer on mobile.
          Animate only `transform` (compositor-friendly, per DESIGN.md §6). */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-outline-variant/20 bg-surface-container-lowest flex flex-col transition-transform duration-300 ease-out will-change-transform md:static md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <span className="font-display-lg text-lg font-bold tracking-tight text-on-surface">Obsidian</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="md:hidden p-1 -mr-1 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-surface-container text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-label-sm text-sm">{item.label}</span>
                  {item.badge === 'submissions' && submissionCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-primary text-on-primary rounded-full text-[10px] font-bold leading-none">
                      {submissionCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-sm font-bold shrink-0">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-xs text-on-surface truncate">{user.name || 'Admin User'}</p>
              <p className="font-body-base text-[11px] text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Mobile top bar (hidden on md+, where the sidebar is always visible) */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            className="p-1 -ml-1 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <span className="font-display-lg text-base font-bold tracking-tight text-on-surface">Obsidian</span>
          {submissionCount > 0 && (
            <span className="ml-auto px-2 py-0.5 bg-primary text-on-primary rounded-full text-[10px] font-bold leading-none">
              {submissionCount} pending
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>

        {/* Footer */}
        <footer className="py-4 px-4 sm:px-8 md:px-12 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center text-[11px] text-on-surface-variant font-body-base shrink-0">
          <p>© 2026 Obsidian. Curated Excellence.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-on-surface">Mission</Link>
            <Link href="#" className="hover:text-on-surface">GitHub</Link>
            <Link href="#" className="hover:text-on-surface">Twitter</Link>
            <Link href="#" className="hover:text-on-surface">Privacy</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
