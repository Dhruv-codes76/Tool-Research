import React from 'react';
import Link from 'next/link';

const BottomNavBar = () => {
  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-xl md:hidden bg-surface-container/60 dark:bg-surface-container/60 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg shadow-primary/10">
      <div className="flex justify-around items-center px-4 py-3 font-label-sm text-label-sm">
        <Link href="/" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-95 transition-transform">
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </Link>
        <Link href="/tools" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-lg p-2 transition-colors">
          <span className="material-symbols-outlined">grid_view</span>
          <span>Tools</span>
        </Link>
        <Link href="/tools" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-lg p-2 transition-colors">
          <span className="material-symbols-outlined">search</span>
          <span>Search</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavBar;
