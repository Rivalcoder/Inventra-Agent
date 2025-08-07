import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { NotificationProvider } from '@/lib/context/notification-context';
import { CurrencyProvider } from '@/lib/context/currency-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "InventSmart AI - AI-Powered Inventory Management",
  description: "Transform your business with AI-powered inventory and sales management. Track, analyze, and optimize your operations with intelligent insights.",
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
          defaultTheme="dark"
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