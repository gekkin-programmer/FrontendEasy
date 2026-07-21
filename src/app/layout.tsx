import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { Toaster } from "sonner"; // ➤ IMPORTANT: For toasts to work
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { LanguageProvider } from "@/context/LanguageContext";
import QueryProvider from "@/providers/query-provider";
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
  metadataBase: new URL('https://eazypost.cm'),
  title: {
    template: '%s | EazyPost Africa',
    default: 'EazyPost - The Digital Engine for African Creators',
  },
  description: 'Manage Facebook, Instagram, and TikTok with local AI tools. Optimized for connectivity in Cameroon, Nigeria, and Ivory Coast.',
  keywords: ['Social Media Manager', 'Cameroon Tech', 'EazyPost', 'Marketing AI', 'Douala', 'Lagos'],
  authors: [{ name: 'EazyPost Team' }],
  creator: 'EazyPost Inc.',
  icons: {
    icon: '/applogo.png',
    shortcut: '/applogo.png',
    apple: '/applogo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://eazypost.cm',
    siteName: 'EazyPost Africa',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EazyPost - Automate Social Media in Africa',
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
      <body className={`${rubik.variable} font-sans antialiased bg-white text-black transition-colors duration-300 overflow-x-hidden w-full`}>
        <Script src="https://cdn.lordicon.com/lordicon.js" strategy="afterInteractive" />
        
        <QueryProvider>
          <LanguageProvider>
            {/* 🚀 NEUBRUTALIST GLOBAL TOASTER */}
            <Toaster 
              position="bottom-right" 
              expand={false}
              richColors 
              closeButton 
              toastOptions={{
                style: {
                  borderRadius: '0px',
                  border: '3px solid black',
                  fontFamily: 'var(--font-rubik)',
                  fontSize: '12px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                },
                className: "dark:!border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] !bg-white dark:!bg-zinc-900 !text-black dark:!text-white",
              }}
            /> 
            
            {/* Layout */}
            <AppLayoutShell>{children}</AppLayoutShell>
            <AgentationLoader />

          </LanguageProvider>
        </QueryProvider>

      </body>
    </html>
  );
}