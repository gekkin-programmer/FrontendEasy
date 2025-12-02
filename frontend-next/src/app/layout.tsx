import "./globals.css";
import Navbar from "../components/Navbar";
import { LanguageProvider } from "../context/LanguageContext";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono", // This defines the CSS variable name
  display: "swap",
});

export const metadata = {
  title: "Wiggle",
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
        <LanguageProvider>
          <Navbar />
          <main className="pt-16">
             {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
