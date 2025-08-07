'use client';

import { useState, useEffect } from 'react';
import { DatabaseViewComponent } from '@/components/auth/database-view';
import { DatabaseConfigComponent } from '@/components/auth/database-config';
import { DatabaseConfig } from '@/lib/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Settings, Save, X } from 'lucide-react';

export default function DatabaseSettingsPage() {
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDatabaseConfig();
  }, []);

  const loadDatabaseConfig = () => {
    try {
      const stored = localStorage.getItem('databaseConfig');
      if (stored) {
        const config = JSON.parse(stored);
        setDatabaseConfig(config);
      }
    } catch (error) {
      console.error('Error loading database config:', error);
      setError('Failed to load database configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (config: DatabaseConfig) => {
    setDatabaseConfig(config);
  };

  const handleTestConnection = async (config: DatabaseConfig): Promise<boolean> => {
    try {
      const response = await fetch('/api/db/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-db-config': JSON.stringify(config),
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!databaseConfig) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Test the connection first
      const isConnected = await handleTestConnection(databaseConfig);
      
      if (!isConnected) {
        setError('Cannot save configuration. Please test the connection first.');
        return;
      }

      // Save to localStorage
      localStorage.setItem('databaseConfig', JSON.stringify(databaseConfig));

      setSuccess('Database configuration saved successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to save database configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDatabaseConfig(); // Reload the original config
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Database className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading database configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Settings</h1>
          <p className="text-gray-600">Manage your database connection configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Save className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Database Configuration */}
      {databaseConfig && !isEditing ? (
        <DatabaseViewComponent
          config={databaseConfig}
          onEdit={() => setIsEditing(true)}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {databaseConfig ? 'Edit Database Configuration' : 'Configure Database'}
            </CardTitle>
            <CardDescription>
              {databaseConfig 
                ? 'Update your database connection settings'
                : 'Set up your database connection for the first time'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseConfigComponent
              onConfigChange={handleConfigChange}
              onTestConnection={handleTestConnection}
              initialConfig={databaseConfig || undefined}
            />
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                disabled={saving || !databaseConfig}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Database className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
              
              {databaseConfig && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card>
        <CardHeader>
          <CardTitle>Database Configuration Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Supported Databases</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong>MySQL:</strong> Popular relational database with ACID compliance</li>
              <li><strong>MongoDB:</strong> NoSQL database with flexible document storage</li>
              <li><strong>PostgreSQL:</strong> Advanced open-source database with JSON support</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Local Development</h4>
            <p className="text-sm text-gray-600">
              For local development, you can use:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• MySQL: XAMPP, WAMP, or Docker</li>
              <li>• MongoDB: MongoDB Community Server or Docker</li>
              <li>• PostgreSQL: PostgreSQL installer or Docker</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Security Note</h4>
            <p className="text-sm text-gray-600">
              Database credentials are stored locally in your browser. For production use, 
              consider using environment variables and secure credential management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
