import "./globals.css";
import Navbar from "../components/Navbar";
import { LanguageProvider } from "../context/LanguageContext";

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
      <body className="bg-white dark:bg-gray-900">
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
