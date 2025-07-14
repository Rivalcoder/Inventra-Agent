


'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getSettings } from '@/lib/data';
import { sendEmailNotification, formatLowStockEmail, formatSalesReportEmail } from '@/lib/utils/email';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'low_stock' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  productId?: string;
}

interface LowStockState {
  productId: string;
  stock: number;
  lastNotified: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  clearLowStockNotifications: () => void;
  clearOldNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Maximum age for notifications in hours
const MAX_NOTIFICATION_AGE = 24; // 24 hours

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lowStockState, setLowStockState] = useState<Record<string, LowStockState>>({});
  const [settings, setSettings] = useState<any>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const allSettings = await getSettings();
        const settingsObj = allSettings.reduce((acc: any, setting) => {
          acc[setting.setting_key] = setting.value;
          return acc;
        }, {});
        setSettings(settingsObj);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Load notifications and low stock state from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    const savedLowStockState = localStorage.getItem('lowStockState');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      // Convert string timestamps back to Date objects
      const notificationsWithDates = parsedNotifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(notificationsWithDates);
    }
    if (savedLowStockState) {
      setLowStockState(JSON.parse(savedLowStockState));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save low stock state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lowStockState', JSON.stringify(lowStockState));
  }, [lowStockState]);

  // Clear old notifications on page load/refresh
  useEffect(() => {
    clearOldNotifications();
  }, []);

  const clearOldNotifications = () => {
    const now = new Date();
    setNotifications(prev => 
      prev.filter(notification => {
        const notificationDate = new Date(notification.timestamp);
        const hoursDiff = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff < MAX_NOTIFICATION_AGE;
      })
    );
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // For low stock notifications, check if we need to send a new notification
    if (notification.type === 'low_stock' && notification.productId) {
      const currentState = lowStockState[notification.productId];
      const currentTime = new Date().toISOString();
      
      // Extract stock level from the message
      const stockMatch = notification.message.match(/\((\d+) units remaining/);
      const currentStock = stockMatch ? parseInt(stockMatch[1]) : 0;

      // Only send notification if:
      // 1. We haven't sent one before for this product, or
      // 2. The stock level has changed since the last notification
      if (currentState && 
          currentState.stock === currentStock && 
          new Date(currentState.lastNotified).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
        return; // Skip if we've notified about this stock level in the last 24 hours
      }

      // Update low stock state
      setLowStockState(prev => ({
        ...prev,
        [notification.productId!]: {
          productId: notification.productId!,
          stock: currentStock,
          lastNotified: currentTime
        }
      }));
    }

    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Handle email notifications
    if (settings?.email_notifications === true) {
      if (notification.type === 'low_stock' && settings?.low_stock_alerts === true) {
        const emailContent = formatLowStockEmail(notification);
        try {
          await sendEmailNotification(emailContent);
        } catch (error) {
          console.error('Error sending email notification:', error);
        }
      } else if (notification.type === 'sales_report' && settings?.sales_reports === true) {
        const emailContent = formatSalesReportEmail(notification);
        try {
          await sendEmailNotification(emailContent);
        } catch (error) {
          console.error('Error sending email notification:', error);
        }
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearLowStockNotifications = () => {
    setLowStockState({});
    localStorage.removeItem('lowStockState');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
        clearLowStockNotifications,
        clearOldNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationDropdown() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex flex-col items-start p-4 cursor-pointer',
                  !notification.read && 'bg-muted/50'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{notification.title}</span>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 