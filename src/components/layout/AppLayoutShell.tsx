'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLegalRoute = pathname?.startsWith('/legal');

  return (
    <>
      <main className="min-h-screen pt-16 md:pt-1">
        {children}
      </main>
      {!isLegalRoute && <Footer />}
    </>
  );
}
