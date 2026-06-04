'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { logAuthEvent } from '@/app/actions/auditActions';
import { useRouter } from 'next/navigation';
import { LogOut, LogIn } from 'lucide-react';

const TopNavBar = () => {
  const [session, setSession] = useState<any>(null);
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

  const handleLogout = async () => {
    // Capture identity while the session is still valid, then sign out.
    const { data: { session: current } } = await supabase.auth.getSession();
    await logAuthEvent('auth.logout', current?.access_token).catch(() => {});
    await supabase.auth.signOut();
    router.push('/login');
  };

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

        <div className="flex items-center gap-6 text-primary dark:text-primary">
          {session ? (
            <>
              {/* Profile Settings Icon - Only visible when logged in */}
              <Link href="/profile" aria-label="Account Settings" className="hover:text-primary/80 transition-colors duration-200">
                <span className="material-symbols-outlined text-[28px]">account_circle</span>
              </Link>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                aria-label="Logout" 
                className="flex items-center gap-2 hover:text-primary/80 transition-colors duration-200"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline font-medium text-sm">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Login Button - Only visible when logged out */}
              <Link 
                href="/login" 
                aria-label="Login" 
                className="flex items-center gap-2 hover:text-primary/80 transition-colors duration-200"
              >
                <LogIn size={20} />
                <span className="hidden sm:inline font-medium text-sm">Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
