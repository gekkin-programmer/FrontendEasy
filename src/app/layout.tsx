import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { Toaster } from "sonner"; // ➤ IMPORTANT: For toasts to work
import Script from "next/script";
import "./globals.css";
import Navbar from "../components/Navbar";
import { LanguageProvider } from "../context/LanguageContext";
import Footer from "../components/Footer";
import QueryProvider from "@/src/providers/query-provider";
import AgentationLoader from "../components/AgentationLoader";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
  weight: ["400", "500", "700", "800"],
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
  metadataBase: new URL('https://easyposttio.vercel.app'), 
  title: {
    template: '%s | EasyPost Africa',
    default: 'EasyPost - The Digital Engine for African Creators',
  },
  description: 'Manage Facebook, Instagram, and TikTok with local AI tools. Optimized for connectivity in Cameroon, Nigeria, and Ivory Coast.',
  keywords: ['Social Media Manager', 'Cameroon Tech', 'EasyPost', 'Marketing AI', 'Douala', 'Lagos'],
  authors: [{ name: 'EasyPost Team' }],
  creator: 'EasyPost Inc.',
  icons: {
    icon: '/applogo.png', 
    shortcut: '/applogo.png',
    apple: '/applogo.png', // Crucial for iPhone home screen saves
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://easypost.cm',
    siteName: 'EasyPost Africa',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyPost - Automate Social Media in Africa',
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
      <body className={`${rubik.variable} font-sans antialiased bg-[#F4F4F0] text-black dark:bg-black dark:text-white transition-colors duration-300`}>
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
            <main className="min-h-screen pt-16 md:pt-1">
              {children}
            </main>

            <AgentationLoader />

          </LanguageProvider>
        </QueryProvider>

      </body>
    </html>
  );
}