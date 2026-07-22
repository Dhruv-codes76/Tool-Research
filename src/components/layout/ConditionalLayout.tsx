'use client';

import { usePathname } from 'next/navigation';
import TopNavBar from '@/components/layout/TopNavBar';
import BottomNavBar from '@/components/layout/BottomNavBar';
import Footer from '@/components/layout/Footer';

/**
 * Conditionally renders the site shell (navbar, footer) based on the current route.
 * Auth pages (/login, /signup, /forgot-password) get a clean fullscreen canvas
 * without any navigation chrome.
 */
const EXCLUDED_ROUTES = ['/admin', '/studio'];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExcludedPage = EXCLUDED_ROUTES.some((route) => pathname.startsWith(route));

  if (isExcludedPage) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNavBar />
      <main className="flex-1 flex flex-col w-full">{children}</main>
      <BottomNavBar />
      <Footer />
    </>
  );
}
