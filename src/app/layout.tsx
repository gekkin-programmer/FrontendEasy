import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Preloader from "../components/Preloader";
import { LanguageProvider } from "../context/LanguageContext";
import EasyAI from "../components/easypost/EasyAI";
import Footer from "../components/Footer"; 

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyPost - Dominer le marketing digital en Afrique",
  description: "Social Media Scheduler pour les communautés africaines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <LanguageProvider>
          <Preloader />
          <Navbar />
          
          <main className="min-h-screen">
            {children}
          </main>

          <EasyAI />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}