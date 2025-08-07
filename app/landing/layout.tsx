import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/lib/context/notification-context';
import { CurrencyProvider } from '@/lib/context/currency-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InventSmart AI - Smart Inventory Management',
  description: 'Transform your business with AI-powered inventory and sales management',
};

export default function LandingLayout({
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
              {children}
              <Toaster />
            </NotificationProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 