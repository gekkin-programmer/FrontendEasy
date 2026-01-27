import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner"; // ➤ IMPORTANT: For toasts to work
import "./globals.css";
import Navbar from "../components/Navbar";
import Preloader from "../components/Preloader";
import { LanguageProvider } from "../context/LanguageContext";
import Footer from "../components/Footer"; 
import QueryProvider from "@/src/providers/query-provider"; 

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "700", "800"], // Only load weights you use to save bandwidth
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
    <html lang="fr" suppressHydrationWarning> 
      <body className={`${jetbrainsMono.variable} font-mono antialiased bg-[#F4F4F0] text-black dark:bg-black dark:text-white`}>
        
        <QueryProvider>
          <LanguageProvider>
            {/* System Components */}
            <Preloader />
            <Toaster position="top-center" richColors closeButton /> 
            
            {/* Layout */}
            
            <main className="min-h-screen pt-16 md:pt-1"> 
              {children}
            </main>

          </LanguageProvider>
        </QueryProvider>

      </body>
    </html>
  );
}