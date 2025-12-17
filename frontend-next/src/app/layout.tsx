import "./globals.css";
import Navbar from "../components/Navbar"; 
import Preloader from "../components/Preloader";
import { LanguageProvider } from "../context/LanguageContext";
import { JetBrains_Mono } from "next/font/google";
import ConvexClientProvider from "./ConvexClientProvider"; 
import EasyAI from "@/src/components/easypost/EasyAI"; // <--- 1. Import EasyAI

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono", 
  display: "swap",
});

export const metadata = {
  title: "EasyPost",
  description: "Social Media Scheduler",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {/* Wrap everything in Convex Provider */}
        <ConvexClientProvider>
          
          <Preloader />
          
          <LanguageProvider>
            <Navbar />
            <main>
               {children}
            </main>
            
            {/* 2. Add EasyAI here so it overlays on top of everything */}
            <EasyAI />
            
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
