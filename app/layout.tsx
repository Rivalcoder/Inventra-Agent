import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { NotificationProvider } from '@/lib/context/notification-context';
import { CurrencyProvider } from '@/lib/context/currency-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InventSmart AI',
  description: 'AI-Powered Inventory and Sales Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6">{children}</main>
              </div>
            </div>
            <Toaster />
          </NotificationProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}