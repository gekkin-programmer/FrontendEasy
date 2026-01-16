import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Preloader from "../components/Preloader";
import { LanguageProvider } from "../context/LanguageContext";
// import EasyAI from "../components/easypost/EasyAI"; // Commented out if not used globally yet
import Footer from "../components/Footer"; 

// 🟢 1. IMPORT THE PROVIDER
import QueryProvider from "@/src/providers/query-provider"; 

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyPost - Dominer le marketing digital en Afrique",
  description: "Social Media Scheduler pour les communautés africaines",
    icons: {
    icon: '/applogo.png', 
    //different sizes if needed:
    // icon: [
    //   { url: '/icon.png' },
    //   { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
    // ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {/* 🟢 2. WRAP EVERYTHING IN QUERY PROVIDER */}
        <QueryProvider>
          <LanguageProvider>
            <Preloader />
            <Navbar />
            
            <main className="min-h-screen">
              {children}
            </main>

            <Footer />
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}