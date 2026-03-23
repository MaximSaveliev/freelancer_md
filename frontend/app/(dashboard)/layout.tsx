import { DashboardNavbar } from '@/components/dashboard-navbar';
import { Footer } from '@/components/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background-dark">
      <DashboardNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
