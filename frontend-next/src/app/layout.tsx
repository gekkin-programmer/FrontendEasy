import "./globals.css";
// FIX: Changed 'component' to 'components'
import Navbar from "../components/Navbar"; 
import Preloader from "../components/Preloader";
import { LanguageProvider } from "../context/LanguageContext";
import { JetBrains_Mono } from "next/font/google";

// FIX: Import the provider we made earlier
import ConvexClientProvider from "./ConvexClientProvider"; 

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
        {/* 1. Wrap everything in Convex Provider */}
        <ConvexClientProvider>
          
          <Preloader />
          
          <LanguageProvider>
            <Navbar />
            <main>
               {children}
            </main>
          </LanguageProvider>

        </ConvexClientProvider>
      </body>
    </html>
  );
}
