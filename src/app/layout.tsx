import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { LanguageProvider } from "@/context/LanguageContext";
import QueryProvider from "@/providers/query-provider";
import AstryxProvider from "@/providers/astryx-provider";
import AgentationLoader from "@/components/common/AgentationLoader";
import AppLayoutShell from "@/components/layout/AppLayoutShell";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

// ➤ 1. MOBILE VIEWPORT CONFIG (Prevents iOS zoom on inputs)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// ➤ 2. ROBUST SEO METADATA
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://eazlypost.com'),
  title: {
    template: '%s | Eazlypost Africa',
    default: 'Eazlypost - The Digital Engine for African Creators',
  },
  description: 'Manage Facebook, Instagram, and TikTok with local AI tools. Optimized for connectivity in Cameroon, Nigeria, and Ivory Coast.',
  keywords: ['Social Media Manager', 'Cameroon Tech', 'Eazlypost', 'Marketing AI', 'Douala', 'Lagos'],
  authors: [{ name: 'Eazlypost Team' }],
  creator: 'Eazlypost Inc.',
  icons: {
    icon: '/applogo.png',
    shortcut: '/applogo.png',
    apple: '/applogo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://eazlypost.com',
    siteName: 'Eazlypost Africa',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eazlypost - Automate Social Media in Africa',
    description: 'AI-powered scheduling for African creators.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.variable} font-sans antialiased bg-white text-black transition-colors duration-300 overflow-x-hidden overflow-y-visible w-full`}>
        <Script src="https://cdn.lordicon.com/lordicon.js" strategy="afterInteractive" />
        
        <QueryProvider>
          <LanguageProvider>
          <AstryxProvider>
            {/* Layout */}
            <AppLayoutShell>{children}</AppLayoutShell>
            <AgentationLoader />

          </AstryxProvider>
          </LanguageProvider>
        </QueryProvider>

      </body>
    </html>
  );
}