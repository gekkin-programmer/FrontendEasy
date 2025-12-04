import "./globals.css";
import Navbar from "../components/Navbar";
import { LanguageProvider } from "../context/LanguageContext";
import { JetBrains_Mono } from "next/font/google";
import Preloader from "../components/Preloader";

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
        <Preloader />
        <LanguageProvider>
          <Navbar />
          <main>
             {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
