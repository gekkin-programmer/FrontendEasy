import "./globals.css";
import Navbar from "../components/Navbar"; 
import Preloader from "../components/Preloader";
import { LanguageProvider } from "../context/LanguageContext";
import { JetBrains_Mono } from "next/font/google";
import EasyAI from "@/src/components/easypost/EasyAI";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono", 
  display: "swap",
});

export const metadata = {
  title: "EasyPost - Dominer le marketing digital en Afrique",
  description: "Social Media Scheduler pour les communautés africaines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${jetbrainsMono.variable} antialiased`}>
          <Preloader />
          
          <LanguageProvider>
            <Navbar />
            <main>
               {children}
            </main>
            
            {/* L'IA reste accessible partout */}
            <EasyAI />
          </LanguageProvider>
      </body>
    </html>
  );
}

