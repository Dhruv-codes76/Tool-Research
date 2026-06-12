"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const BottomNavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Sync active tab with route changes when navigating externally (e.g., back button)
    if (pathname === '/') {
      setActiveTab('home');
    } else if (pathname?.startsWith('/tools')) {
      // Don't override 'search' tab if we are just navigating within tools
      if (activeTab !== 'search') {
        setActiveTab('tools');
      }
    }
  }, [pathname]);

  const getLinkClasses = (tabName: string) => {
    return activeTab === tabName
      ? "flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-6 py-1.5 scale-95 transition-all duration-300 shadow-md shadow-primary/20"
      : "flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-lg p-2 transition-colors duration-300";
  };

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-2xl md:hidden bg-surface-container/80 dark:bg-surface-container/80 backdrop-blur-2xl border-t border-outline-variant/20 shadow-2xl shadow-black/50">
      <div className="flex justify-around items-center px-2 py-3 font-label-sm text-[10px] tracking-wider uppercase">
        <Link href="/" className={getLinkClasses('home')} onClick={() => setActiveTab('home')}>
          <span className="material-symbols-outlined text-[22px] mb-0.5">home</span>
          <span className="font-bold">Home</span>
        </Link>
        
        <Link href="/tools" className={getLinkClasses('tools')} onClick={() => setActiveTab('tools')}>
          <span className="material-symbols-outlined text-[22px] mb-0.5">grid_view</span>
          <span className="font-bold">Tools</span>
        </Link>
        
        <button 
          onClick={() => {
            setActiveTab('search');
            if (pathname !== '/tools') {
              router.push('/tools');
              setTimeout(() => {
                document.getElementById('tool-search')?.focus();
              }, 200);
            } else {
              document.getElementById('tool-search')?.focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={getLinkClasses('search')}
        >
          <span className="material-symbols-outlined text-[22px] mb-0.5">search</span>
          <span className="font-bold">Search</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavBar;
