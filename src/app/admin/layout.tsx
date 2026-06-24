import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

// Admin pages require auth and query the database, so they must render on
// demand — never statically prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdmin();
  if (!user) redirect('/login?next=/admin');

  const [changeCount, submissionCount] = await Promise.all([
    prisma.toolChange.count({ where: { status: 'PENDING' } }),
    prisma.tool.count({ where: { status: 'PENDING' } }),
  ]);
  const totalPending = changeCount + submissionCount;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-outline-variant/20 bg-surface-container-lowest flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <span className="font-display-lg text-lg font-bold tracking-tight text-on-surface">Obsidian</span>
          </Link>
          
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">bar_chart</span>
              <span className="font-label-sm text-sm">Analytics</span>
            </Link>
            
            <Link href="/admin/tools" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">build</span>
              <span className="font-label-sm text-sm">Tools</span>
            </Link>

            <Link href="/admin/submissions" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">inbox</span>
              <span className="font-label-sm text-sm">Submissions</span>
              {submissionCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-primary text-on-primary rounded-full text-[10px] font-bold leading-none">
                  {submissionCount}
                </span>
              )}
            </Link>

            <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">category</span>
              <span className="font-label-sm text-sm">Categories</span>
            </Link>

            <Link href="/admin/manage-admins" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              <span className="font-label-sm text-sm">Manage Admins</span>
            </Link>

            {user.isPrimaryAdmin && (
              <Link href="/admin/audit-log" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]">history</span>
                <span className="font-label-sm text-sm">Audit Log</span>
              </Link>
            )}


            <Link href="/admin/blogs" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">article</span>
              <span className="font-label-sm text-sm">Blogs</span>
            </Link>

            <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="font-label-sm text-sm">Settings</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-sm font-bold">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-label-sm text-xs text-on-surface">{user.name || 'Admin User'}</p>
              <p className="font-body-base text-[11px] text-on-surface-variant">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-4 px-8 md:px-12 border-t border-outline-variant/20 flex justify-between items-center text-[11px] text-on-surface-variant font-body-base">
          <p>© 2026 Obsidian. Curated Excellence.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-on-surface">Mission</Link>
            <Link href="#" className="hover:text-on-surface">GitHub</Link>
            <Link href="#" className="hover:text-on-surface">Twitter</Link>
            <Link href="#" className="hover:text-on-surface">Privacy</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
