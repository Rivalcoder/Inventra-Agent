'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Settings, Edit } from 'lucide-react';
import { DatabaseConfig, DatabaseType } from '@/lib/types/database';
import { Label } from '@/components/ui/label';

interface DatabaseViewProps {
  config: DatabaseConfig;
  onEdit?: () => void;
}

export function DatabaseViewComponent({ config, onEdit }: DatabaseViewProps) {
  const getDatabaseIcon = (type: DatabaseType) => {
    switch (type) {
      case 'mysql':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'mongodb':
        return <Database className="h-4 w-4 text-green-600" />;
      case 'postgresql':
        return <Database className="h-4 w-4 text-purple-600" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getDatabaseColor = (type: DatabaseType) => {
    switch (type) {
      case 'mysql':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'mongodb':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'postgresql':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getDatabaseName = (type: DatabaseType) => {
    switch (type) {
      case 'mysql':
        return 'MySQL';
      case 'mongodb':
        return 'MongoDB';
      case 'postgresql':
        return 'PostgreSQL';
      default:
        return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Database Configuration
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Your current database connection settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database Type */}
        <div className="flex items-center gap-3">
          {getDatabaseIcon(config.type)}
          <div>
            <h3 className="font-medium">{getDatabaseName(config.type)}</h3>
            <p className="text-sm text-gray-500">Database Type</p>
          </div>
          <Badge variant="secondary" className={getDatabaseColor(config.type)}>
            {config.type.toUpperCase()}
          </Badge>
        </div>

        {/* Connection Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Host</Label>
            <p className="text-sm text-gray-600">{config.host}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Port</Label>
            <p className="text-sm text-gray-600">{config.port}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Database</Label>
            <p className="text-sm text-gray-600">{config.database}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Username</Label>
            <p className="text-sm text-gray-600">{config.username || 'Not set'}</p>
          </div>
        </div>

        {/* Advanced Options */}
        {config.options && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Options
            </Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">SSL:</span>
                <span className="ml-2">{config.options.ssl ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="text-gray-500">Connection Limit:</span>
                <span className="ml-2">{config.options.connectionLimit || 10}</span>
              </div>
              {config.options.charset && (
                <div>
                  <span className="text-gray-500">Character Set:</span>
                  <span className="ml-2">{config.options.charset}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600">Connected</span>
        </div>
      </CardContent>
    </Card>
  );
}
