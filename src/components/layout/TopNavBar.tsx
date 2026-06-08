'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { logAuthEvent } from '@/app/actions/auditActions';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

const TopNavBar = () => {
  const [session, setSession] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close the account dropdown on outside-click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    // Capture identity while the session is still valid, then sign out.
    const { data: { session: current } } = await supabase.auth.getSession();
    await logAuthEvent('auth.logout', current?.access_token).catch(() => {});
    await supabase.auth.signOut();
    setConfirmOpen(false);
    setMenuOpen(false);
    setLoggingOut(false);
    router.push('/login');
  };

  // Google-style identity: prefer the chosen display name, fall back to email.
  const email: string = session?.user?.email ?? '';
  const fullName: string = session?.user?.user_metadata?.full_name ?? '';
  const displayName = fullName || email || 'Account';
  const initial = (fullName || email || '?').trim().charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
      <div className="flex justify-between items-center max-w-container-max mx-auto px-gutter h-16">
        <div className="font-sans text-2xl font-black tracking-tighter leading-none text-white">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-v2.png" alt="Logo" width={32} height={30} className="object-contain" />
            <span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ai</span>toolresearch
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-stack-md font-body-base text-body-base">
          <Link
            href="/"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/tools"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
          >
            Tools
          </Link>
          <Link
            href="/blog"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200"
          >
            About
          </Link>
        </div>

        <div className="flex items-center">
          {session ? (
            // Logged in — avatar button that opens the account menu.
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="hover-lift flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-on-primary font-semibold text-sm select-none ring-1 ring-white/10"
              >
                {initial}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="glass-panel animate-pop-in absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 origin-top-right"
                >
                  {/* Identity header */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                    <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary text-on-primary font-semibold text-sm select-none">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                      {email && (
                        <p className="text-xs text-on-surface-variant truncate">{email}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        setConfirmOpen(true);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors duration-150"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Logged out — Google-style profile icon that routes to login.
            <Link
              href="/login"
              aria-label="Login"
              className="hover-lift flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-on-surface ring-1 ring-white/10"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Logout confirmation modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up"
            onClick={() => !loggingOut && setConfirmOpen(false)}
          />
          {/* Dialog */}
          <div className="glass-panel animate-pop-in relative w-full max-w-sm rounded-3xl p-6 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-error/15 text-error shrink-0">
                <LogOut size={20} />
              </span>
              <h2 id="logout-title" className="text-lg font-bold text-on-surface">
                Sign out?
              </h2>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              You&rsquo;ll be returned to the login screen. Any unsaved work in open forms will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loggingOut}
                className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="hover-lift px-5 py-2 rounded-xl text-sm font-semibold text-on-primary bg-gradient-to-br from-primary to-secondary ring-1 ring-white/10 disabled:opacity-60"
              >
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavBar;
