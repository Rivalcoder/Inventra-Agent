'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DatabaseAuthGuardProps {
  children: React.ReactNode;
}

export default function DatabaseAuthGuard({ children }: DatabaseAuthGuardProps) {
  const router = useRouter();
  const [hasDatabaseConfig, setHasDatabaseConfig] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDatabaseConfig = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const databaseConfig = localStorage.getItem('databaseConfig');
      
      if (!isAuthenticated) {
        router.push('/landing');
        return;
      }
      
      // Skip database check for database settings page
      if (window.location.pathname === '/settings/database') {
        setHasDatabaseConfig(true);
        return;
      }
      
      if (!databaseConfig) {
        setHasDatabaseConfig(false);
        return;
      }
      
      setHasDatabaseConfig(true);
    };

    checkDatabaseConfig();
  }, [router]);

  // Show loading while checking
  if (hasDatabaseConfig === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Checking database configuration...</p>
        </div>
      </div>
    );
  }

  // If no database config, show setup message
  if (!hasDatabaseConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-4">
                <p className="font-medium">Database Configuration Required</p>
                <p>
                  You need to configure your database connection before accessing the application.
                </p>
                <Button 
                  onClick={() => router.push('/auth/signup')}
                  className="w-full"
                >
                  Configure Database
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If authenticated and has database config, render children
  return <>{children}</>;
}
