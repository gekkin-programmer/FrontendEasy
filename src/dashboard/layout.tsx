import Sidebar from '@/components/easypost/Sidebar';
import MobileNav from '@/components/easypost/MobileNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F4F4F0] dark:bg-black transition-colors duration-300">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-50 border-r-2 border-black dark:border-white">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-0 transition-all duration-300">
        {children}
      </main>

      {/* Mobile Bottom Nav (Hidden on Desktop for better UX) */}
      <MobileNav />
    </div>
  );
}