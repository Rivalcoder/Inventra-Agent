"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Bell, Lock, Globe, Database } from "lucide-react";
import { getSettings, createSetting, updateSetting } from "@/lib/data";
import { getApiBase } from "@/lib/utils";
import type { Settings as SettingsType } from "@/lib/types";
import JSZip from "jszip";

interface SettingsData {
  companyName: string;
  currency: string;
  lowStockAlerts: boolean;
  autoBackup: boolean;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  emailNotifications: boolean;
  salesReports: boolean;
  twoFactorAuth: boolean;
  theme: string;
  language: string;
  backupLocation: string;
  dataRetention: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    companyName: "",
    currency: "inr",
    lowStockAlerts: false,
    autoBackup: false,
    fullName: "",
    email: "",
    phone: "",
    role: "",
    emailNotifications: false,
    salesReports: false,
    twoFactorAuth: false,
    theme: theme || "system",
    language: "en",
    backupLocation: "",
    dataRetention: "30"
  });

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const allSettings = await getSettings();
        if (allSettings.length === 0) {
          console.log('No settings found, creating initial settings...');
          await handleSave();
        } else {
          console.log('Loading existing settings...');
          await loadSettings();
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
        toast.error("Failed to initialize settings");
      }
    };

    initializeSettings();
  }, []);

  useEffect(() => {
    setSettings(prev => ({ ...prev, theme: theme || "system" }));
  }, [theme]);

  const loadSettings = async () => {
    try {
      console.log('Loading settings...');
      const allSettings = await getSettings();
      console.log('Received settings:', allSettings);
      
      const settingsData: Partial<SettingsData> = {};
      
      allSettings.forEach(setting => {
        console.log('Processing setting:', setting);
        const value = setting.type === 'boolean' ? setting.value === 'true' : setting.value;
        switch(setting.setting_key) {
          case 'company_name': settingsData.companyName = value as string; break;
          case 'currency': settingsData.currency = value as string; break;
          case 'low_stock_alerts': settingsData.lowStockAlerts = value as boolean; break;
          case 'auto_backup': settingsData.autoBackup = value as boolean; break;
          case 'full_name': settingsData.fullName = value as string; break;
          case 'email': settingsData.email = value as string; break;
          case 'phone': settingsData.phone = value as string; break;
          case 'role': settingsData.role = value as string; break;
          case 'email_notifications': settingsData.emailNotifications = value as boolean; break;
          case 'sales_reports': settingsData.salesReports = value as boolean; break;
          case 'two_factor_auth': settingsData.twoFactorAuth = value as boolean; break;
          case 'theme': 
            settingsData.theme = value as string;
            setTheme(value as string);
            break;
          case 'language': settingsData.language = value as string; break;
          case 'backup_location': settingsData.backupLocation = value as string; break;
          case 'data_retention': settingsData.dataRetention = value as string; break;
        }
      });

      console.log('Processed settings data:', settingsData);
      setSettings(prev => ({ ...prev, ...settingsData }));
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error("Failed to load settings");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving settings:', settings);
      const settingsToSave: Omit<SettingsType, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { setting_key: 'company_name', value: settings.companyName, type: 'string' as const, description: 'Company name', isEncrypted: false },
        { setting_key: 'currency', value: settings.currency, type: 'string' as const, description: 'Default currency', isEncrypted: false },
        { setting_key: 'low_stock_alerts', value: settings.lowStockAlerts.toString(), type: 'boolean' as const, description: 'Enable low stock alerts', isEncrypted: false },
        { setting_key: 'auto_backup', value: settings.autoBackup.toString(), type: 'boolean' as const, description: 'Enable auto backup', isEncrypted: false },
        { setting_key: 'full_name', value: settings.fullName, type: 'string' as const, description: 'User full name', isEncrypted: false },
        { setting_key: 'email', value: settings.email, type: 'string' as const, description: 'User email', isEncrypted: false },
        { setting_key: 'phone', value: settings.phone, type: 'string' as const, description: 'User phone number', isEncrypted: false },
        { setting_key: 'role', value: settings.role, type: 'string' as const, description: 'User role', isEncrypted: false },
        { setting_key: 'email_notifications', value: settings.emailNotifications.toString(), type: 'boolean' as const, description: 'Enable email notifications', isEncrypted: false },
        { setting_key: 'sales_reports', value: settings.salesReports.toString(), type: 'boolean' as const, description: 'Enable sales reports', isEncrypted: false },
        { setting_key: 'two_factor_auth', value: settings.twoFactorAuth.toString(), type: 'boolean' as const, description: 'Enable two-factor authentication', isEncrypted: false },
        { setting_key: 'theme', value: settings.theme, type: 'string' as const, description: 'Application theme', isEncrypted: false },
        { setting_key: 'language', value: settings.language, type: 'string' as const, description: 'Application language', isEncrypted: false },
        { setting_key: 'backup_location', value: settings.backupLocation, type: 'string' as const, description: 'Backup location path', isEncrypted: false },
        { setting_key: 'data_retention', value: settings.dataRetention, type: 'string' as const, description: 'Data retention period in days', isEncrypted: false }
      ];

      // First, try to create all settings
      for (const setting of settingsToSave) {
        try {
          console.log('Creating/Updating setting:', setting);
          await createSetting(setting);
        } catch (error) {
          console.log('Setting already exists, updating:', setting);
          await updateSetting(setting);
        }
      }

      // Reload settings after saving
      await loadSettings();
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof SettingsData, value: string | boolean) => {
    if (key === 'theme') {
      setTheme(value as string);
    }
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportDatabase = async () => {
    try {
      // Fetch data from the API
      const response = await fetch(`${getApiBase()}/api/db?action=export-database`);
      if (!response.ok) {
        throw new Error('Failed to export database');
      }
      const data = await response.json();
      
      // Convert data to CSV format
      const productsCSV = convertToCSV(data.products, [
        'id', 'name', 'description', 'price', 'quantity', 'category', 'createdAt', 'updatedAt'
      ]);
      const salesCSV = convertToCSV(data.sales, [
        'id', 'product_id', 'quantity', 'total_price', 'sale_date', 'createdAt', 'updatedAt'
      ]);

      // Create a zip file
      const zip = new JSZip();
      zip.file('inventory.csv', productsCSV);
      zip.file('sales.csv', salesCSV);

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Database exported successfully");
    } catch (error) {
      console.error('Error exporting database:', error);
      toast.error("Failed to export database");
    }
  };

  const convertToCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const rows = data.map(item => 
      headers.map(header => {
        const value = item[header];
        // Handle values that might contain commas
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    return [headerRow, ...rows].join('\n');
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      return;
    }

    // Ask user what type of data they're importing
    const importType = window.prompt('What type of data are you importing? (inventory/sales)');
    if (!importType || !['inventory', 'sales'].includes(importType.toLowerCase())) {
      toast.error("Please specify either 'inventory' or 'sales'");
      return;
    }

    if (!window.confirm(`Are you sure you want to import ${importType} data? This will replace existing ${importType} data.`)) {
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvData = e.target?.result as string;
          const rows = csvData.split('\n');
          const headers = rows[0].split(',').map(h => h.trim());
          const data = rows.slice(1).map(row => {
            const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {} as any);
          });

          const response = await fetch(`${getApiBase()}/api/db?action=import-${importType}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
          });

          if (!response.ok) {
            throw new Error(`Failed to import ${importType} data`);
          }

          // Reload settings after import
          await loadSettings();
          toast.success(`${importType} data imported successfully`);
        } catch (error) {
          console.error(`Error importing ${importType} data:`, error);
          toast.error(`Failed to import ${importType} data`);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error("Failed to read import file");
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear the entire database? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/api/db?action=import-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: [],
          sales: [],
          settings: []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear database');
      }

      // Reload settings after clearing
      await loadSettings();
      toast.success("Database cleared successfully");
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error("Failed to clear database");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input 
                  id="company-name" 
                  placeholder="Enter your company name"
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select 
                  value={settings.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="usd">US Dollar ($)</SelectItem>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                    <SelectItem value="gbp">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable notifications for low stock items
                  </p>
                </div>
                <Switch 
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) => handleInputChange('lowStockAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your data daily
                  </p>
                </div>
                <Switch 
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name"
                  value={settings.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter your phone number"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  placeholder="Enter your role"
                  value={settings.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when items are running low
                  </p>
                </div>
                <Switch 
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) => handleInputChange('lowStockAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sales Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily sales reports
                  </p>
                </div>
                <Switch 
                  checked={settings.salesReports}
                  onCheckedChange={(checked) => handleInputChange('salesReports', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch 
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={settings.theme}
                  onValueChange={(value) => handleInputChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={settings.language}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Settings</CardTitle>
              <CardDescription>
                Manage your data backup and storage settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your data daily
                  </p>
                </div>
                <Switch 
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Backup Location</Label>
                <Input 
                  placeholder="Enter backup location"
                  value={settings.backupLocation}
                  onChange={(e) => handleInputChange('backupLocation', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Specify the directory where backups will be stored
                </p>
              </div>
              <div className="space-y-2">
                <Label>Data Retention Period (days)</Label>
                <Input 
                  type="number"
                  min="1"
                  max="365"
                  placeholder="Enter retention period"
                  value={settings.dataRetention}
                  onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Number of days to keep backup data before automatic deletion
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export Database</Label>
                  <p className="text-sm text-muted-foreground">
                    Export all database data (products, sales, settings)
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleExportDatabase}
                >
                  Export Database
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Import Database</Label>
                  <p className="text-sm text-muted-foreground">
                    Import database from CSV file
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleImportDatabase}
                    className="hidden"
                    id="import-database"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('import-database')?.click()}
                  >
                    Import Database
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Clear Database</Label>
                  <p className="text-sm text-muted-foreground">
                    Clear all data from the database
                  </p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={handleClearDatabase}
                >
                  Clear Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
} 