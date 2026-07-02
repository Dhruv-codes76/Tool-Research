'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AVATAR_COLORS = [
  'bg-red-500 text-white',
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-yellow-500 text-yellow-950',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-indigo-500 text-white',
  'bg-teal-500 text-white',
];

function getAvatarColor(identifier: string) {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

import { supabase } from '@/lib/supabase';
import { logAuthEvent } from '@/app/actions/auditActions';
import { useRouter } from 'next/navigation';
import { LogOut, User, Info, FileText, Menu, X, LayoutDashboard } from 'lucide-react';
import { type Session } from '@supabase/supabase-js';

const TopNavBar = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const checkRole = async (email: string) => {
    const { data } = await supabase
      .from('User')
      .select('role, isPrimaryAdmin')
      .eq('email', email)
      .single();

    if (data && data.role === 'ADMIN') {
      setIsAdmin(true);
      if (data.isPrimaryAdmin) {
        setIsSuperAdmin(true);
      }
    } else {
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        checkRole(session.user.email);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        checkRole(session.user.email);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
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
  const avatarColorClass = getAvatarColor(email || fullName || 'default');

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

        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 text-on-surface-variant hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {session ? (
            // Logged in — avatar button that opens the account menu.
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`hover-lift flex items-center justify-center w-8 h-8 rounded-full ${avatarColorClass} font-extrabold text-sm select-none ring-1 ring-white/10`}
              >
                {initial}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="animate-pop-in absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 origin-top-right bg-surface border border-outline-variant/30"
                >
                  {/* Identity header */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-outline-variant/20 bg-surface-container-low">
                    <span className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full ${avatarColorClass} font-bold text-base select-none`}>
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                      {email && (
                        <p className="text-xs text-on-surface-variant truncate">{email}</p>
                      )}
                    </div>
                  </div>

                  {/* Role and Status Label */}
                  {isAdmin && (
                    <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between bg-surface">
                       <span className="text-xs tracking-widest text-on-surface-variant font-mono uppercase font-semibold">
                          {isSuperAdmin ? 'Superadmin' : 'Admin'}
                       </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-2">
                    {(isAdmin || isSuperAdmin) && (
                      <div className="border-b border-white/5 mb-2 pb-2">
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-white hover:bg-white/10 transition-all duration-300 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100"
                        >
                          <LayoutDashboard size={18} />
                          Dashboard
                        </Link>
                      </div>
                    )}
                    {/* Mobile Links */}
                    <div className="md:hidden border-b border-white/5 mb-2 pb-2">
                      <Link
                        href="/blog"
                        onClick={() => setMenuOpen(false)}
                        className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-white hover:bg-white/10 transition-all duration-300 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100"
                      >
                        <FileText size={18} />
                        Blog
                      </Link>
                      <Link
                        href="/about"
                        onClick={() => setMenuOpen(false)}
                        className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-white hover:bg-white/10 transition-all duration-300 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100"
                      >
                        <Info size={18} />
                        About
                      </Link>
                    </div>

                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        setConfirmOpen(true);
                      }}
                      className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-white hover:bg-white/10 transition-all duration-300 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100"
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full right-4 mt-2 w-48 rounded-2xl bg-surface border border-outline-variant/30 shadow-2xl shadow-black/60 p-2 flex flex-col animate-pop-in z-50 origin-top-right">
          <Link
            href="/blog"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/10 transition-all duration-300 text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FileText size={18} />
            Blog
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/10 transition-all duration-300 text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Info size={18} />
            About
          </Link>
        </div>
      )}

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
