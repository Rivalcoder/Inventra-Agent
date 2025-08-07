import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import AuthGuard from '@/components/auth/auth-guard';
import DatabaseAuthGuard from '@/components/auth/database-auth-guard';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DatabaseAuthGuard>
        <div className="max-h-screen flex flex-col">
          <Header />
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 pt-14 min-h-0 max-h-screen overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </DatabaseAuthGuard>
    </AuthGuard>
  );
} 