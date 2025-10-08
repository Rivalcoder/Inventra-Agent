"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = "Processing...", 
  className 
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm",
        className
      )}>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-2xl border max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {message}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Please wait while we process your data...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FullPageLoadingProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
}

export function FullPageLoading({ 
  isLoading, 
  message = "Processing...", 
  subMessage = "Please wait while we process your data..." 
}: FullPageLoadingProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-2xl border max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {message}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}