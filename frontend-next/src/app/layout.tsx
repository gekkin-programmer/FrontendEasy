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
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${jetbrainsMono.variable} antialiased`}>
          
          <LanguageProvider>
            <EasyAI />
          </LanguageProvider>
            {/* 2. Add EasyAI here so it overlays on top of everything */}
            <EasyAI />
            
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
