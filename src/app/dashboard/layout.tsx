export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F4F0] dark:bg-black transition-colors duration-300">
      {children}
    </div>
  );
}