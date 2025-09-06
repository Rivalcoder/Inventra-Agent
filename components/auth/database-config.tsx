'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { DatabaseConfig, DatabaseType } from '@/lib/types/database';

interface DatabaseConfigProps {
  onConfigChange: (config: DatabaseConfig) => void;
  onTestConnection: (config: DatabaseConfig) => Promise<boolean>;
  initialConfig?: DatabaseConfig;
}

const defaultPorts = {
  mysql: 3306,
  mongodb: 27017,
  postgresql: 5432
};

const defaultConfigs = {
  mysql: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'ai_inventory',
    options: {
      ssl: false,
      connectionLimit: 10,
      charset: 'utf8mb4'
    }
  },
  mongodb: {
    host: 'localhost',
    port: 27017,
    username: '',
    password: '',
    database: 'ai_inventory',
    options: {
      ssl: false,
      connectionLimit: 10
    }
  },
  postgresql: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'ai_inventory',
    options: {
      ssl: false,
      connectionLimit: 10
    }
  }
};

export function DatabaseConfigComponent({ onConfigChange, onTestConnection, initialConfig }: DatabaseConfigProps) {
  const [selectedType, setSelectedType] = useState<DatabaseType>(initialConfig?.type || 'mysql');
  const [config, setConfig] = useState<DatabaseConfig>(initialConfig || {
    type: 'mysql',
    ...defaultConfigs.mysql
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTypeChange = (type: DatabaseType) => {
    setSelectedType(type);
    const newConfig: DatabaseConfig = {
      type,
      ...defaultConfigs[type]
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
    setTestResult(null);
  };

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...config };
    
    if (field.startsWith('options.')) {
      const optionField = field.replace('options.', '');
      newConfig.options = {
        ...newConfig.options,
        [optionField]: value
      };
    } else {
      (newConfig as any)[field] = value;
    }
    
    setConfig(newConfig);
    onConfigChange(newConfig);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const success = await onTestConnection(config);
      setTestResult({
        success,
        message: success ? 'Connection successful!' : 'Connection failed. Please check your settings.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

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

  return (
    <Card className="w-full h-fit bg-transparent border-none shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Database className="h-5 w-5" />
          Database Configuration
        </CardTitle>
        <CardDescription className="text-gray-300">
          Configure your database connection settings. Choose from MySQL, MongoDB, or PostgreSQL.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Database Type Selection */}
        <div className="space-y-3">
          <Label className="text-white">Database Type</Label>
          <div className="grid grid-cols-3 gap-3">
            {(['mysql', 'mongodb', 'postgresql'] as DatabaseType[]).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  selectedType === type 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                onClick={() => handleTypeChange(type)}
              >
                {getDatabaseIcon(type)}
                <span className="font-medium capitalize">{type}</span>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                  {type === 'mysql' && 'Popular'}
                  {type === 'mongodb' && 'NoSQL'}
                  {type === 'postgresql' && 'Advanced'}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Connection Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host" className="text-white">Host</Label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => handleConfigChange('host', e.target.value)}
                placeholder="localhost"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port" className="text-white">Port</Label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                placeholder={defaultPorts[selectedType].toString()}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={config.username}
                onChange={(e) => handleConfigChange('username', e.target.value)}
                placeholder={selectedType === 'mongodb' ? 'Optional' : 'root'}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={config.password}
                onChange={(e) => handleConfigChange('password', e.target.value)}
                placeholder="Enter password"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="database" className="text-white">Database Name</Label>
            <Input
              id="database"
              value={config.database}
              onChange={(e) => handleConfigChange('database', e.target.value)}
              placeholder="ai_inventory"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-0 h-auto text-white hover:text-gray-300"
          >
            <Server className="h-4 w-4 mr-2" />
            Advanced Options
          </Button>
          
          {showAdvanced && (
            <div className="space-y-4 p-4 border border-white/20 rounded-lg bg-white/5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ssl" className="text-white">Enable SSL</Label>
                <Switch
                  id="ssl"
                  checked={config.options?.ssl || false}
                  onCheckedChange={(checked) => handleConfigChange('options.ssl', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="connectionLimit" className="text-white">Connection Limit</Label>
                <Input
                  id="connectionLimit"
                  type="number"
                  value={config.options?.connectionLimit || 10}
                  onChange={(e) => handleConfigChange('options.connectionLimit', parseInt(e.target.value))}
                  min="1"
                  max="50"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>

              {selectedType === 'mysql' && (
                <div className="space-y-2">
                  <Label htmlFor="charset" className="text-white">Character Set</Label>
                  <Select
                    value={config.options?.charset || 'utf8mb4'}
                    onValueChange={(value) => handleConfigChange('options.charset', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utf8mb4">UTF-8 (utf8mb4)</SelectItem>
                      <SelectItem value="utf8">UTF-8 (utf8)</SelectItem>
                      <SelectItem value="latin1">Latin-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Connection */}
        <div className="space-y-3">
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>

          {testResult && (
            <Alert className={testResult.success ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/10'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription className={testResult.success ? 'text-emerald-300' : 'text-red-300'}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Database Info */}
        <div className="p-4 border border-white/20 rounded-lg bg-white/5">
          <h4 className="font-medium text-white mb-2">Database Information</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong>Type:</strong> {selectedType.toUpperCase()}</p>
            <p><strong>Host:</strong> {config.host}:{config.port}</p>
            <p><strong>Database:</strong> {config.database}</p>
            {selectedType === 'mysql' && (
              <p className="text-xs mt-2 text-gray-400">
                MySQL is recommended for most use cases. It's widely supported and has excellent performance.
              </p>
            )}
            {selectedType === 'mongodb' && (
              <p className="text-xs mt-2 text-gray-400">
                MongoDB is great for flexible document storage. No authentication required for local development.
              </p>
            )}
            {selectedType === 'postgresql' && (
              <p className="text-xs mt-2 text-gray-400">
                PostgreSQL offers advanced features and ACID compliance. Great for complex applications.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
