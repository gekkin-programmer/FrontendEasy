'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldHideFooter = pathname?.startsWith('/legal') || pathname === '/forgot-password' || pathname === '/forgot-password/';

  return (
    <>
      <main className="min-h-screen pt-16 md:pt-1">
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
    </>
  );
}
