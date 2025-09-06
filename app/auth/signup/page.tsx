'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, 
  ArrowLeft,
  Eye,
  EyeOff,
  Database,
  Server,
  Globe,
  Lock,
  User,
  Mail,
  Key,
  CheckCircle,
  AlertCircle,
  Cloud,
  Settings,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { airtableService } from '@/lib/services/airtable';
import { configService } from '@/lib/services/config';
import { DatabaseConfigComponent } from '@/components/auth/database-config';
import { DatabaseConfig as DBConfig } from '@/lib/types/database';

// Local authentication service (same as in signin)
class LocalAuthService {
  private users: any[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.users = JSON.parse(localStorage.getItem('local_users') || '[]');
    } else {
      this.users = [];
    }
  }

  async createUser(userData: any): Promise<boolean> {
    try {
      const existingUser = this.users.find(u => u.email === userData.email);
      if (existingUser) {
        return false;
      }

      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      this.users.push(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('local_users', JSON.stringify(this.users));
      }
      return true;
    } catch (error) {
      console.error('Error creating local user:', error);
      return false;
    }
  }

  async verifyUser(email: string, password: string): Promise<any | null> {
    try {
      const user = this.users.find(u => u.email === email && u.password === password);
      
      if (user) {
        user.lastLogin = new Date().toISOString();
        const updatedUsers = this.users.map(u => 
          u.email === email ? user : u
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('local_users', JSON.stringify(updatedUsers));
        }
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error verifying local user:', error);
      return null;
    }
  }
}

// Instantiate only on the client
let localAuthService: LocalAuthService | null = null;





export default function SignUpPage() {
  const router = useRouter();
  const localService = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!localAuthService) localAuthService = new LocalAuthService();
    return localAuthService;
  }, []);
  const [step, setStep] = useState(2);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authMode, setAuthMode] = useState<'airtable' | 'local'>('local');
  const [isClient, setIsClient] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cloudTestLoading, setCloudTestLoading] = useState(false);
  const [cloudTestMessage, setCloudTestMessage] = useState('');
  const [cloudTestSuccess, setCloudTestSuccess] = useState<boolean | null>(null);
  const [databaseConfig, setDatabaseConfig] = useState<DBConfig>({
    type: 'mysql',
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
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Initialize client-side state and auth mode
  useEffect(() => {
    setIsClient(true);
    const savedAuthMode = configService.getAuthMode();
    const savedDemoMode = configService.isDemoMode();
    setAuthMode(savedAuthMode);
    setIsDemoMode(savedDemoMode);
  }, []);

  // Update auth mode when it changes
  useEffect(() => {
    if (isClient) {
      configService.setAuthMode(authMode);
    }
  }, [authMode, isClient]);

  // Online/offline detection
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set DB defaults based on mode (Local -> MySQL, Cloud -> MongoDB)
  useEffect(() => {
    if (authMode === 'airtable') {
      setDatabaseConfig({
        type: 'mongodb',
        host: 'cluster0.mongodb.net',
        port: 27017,
        username: 'admin',
        password: '',
        database: 'ai_inventory',
        options: {
          ssl: true,
          connectionLimit: 50,
          charset: 'utf8',
        },
      } as DBConfig);
    } else {
      setDatabaseConfig({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'ai_inventory',
        options: {
          ssl: false,
          connectionLimit: 10,
          charset: 'utf8mb4',
        },
      } as DBConfig);
    }
  }, [authMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDatabaseConfigChange = (config: DBConfig) => {
    setDatabaseConfig(config);
  };

  const handleTestConnection = async (config: DBConfig): Promise<boolean> => {
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

  const validateStep1 = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    // For cloud (online) flow, DB panel is auto-filled; no validation needed
    if (authMode === 'airtable') return true;
    if (!databaseConfig.host || !databaseConfig.database) {
      setError('Please configure your database settings');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSignUp();
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password, // In real app, hash this
        databaseType: databaseConfig.type,
        databaseConfig: {
          type: databaseConfig.type,
          host: databaseConfig.host,
          port: databaseConfig.port.toString(),
          username: databaseConfig.username,
          password: databaseConfig.password,
          database: databaseConfig.database,
          ssl: databaseConfig.options?.ssl?.toString() || 'false',
          connectionLimit: databaseConfig.options?.connectionLimit?.toString() || '10',
          charset: databaseConfig.options?.charset || 'utf8mb4'
        },
        createdAt: new Date().toISOString()
      };

      let success = false;

      if (authMode === 'airtable') {
        // Create user in Airtable
        success = await airtableService.createUser(userData);
      } else {
        // Create user in local storage
        if (!localService) throw new Error('Local service unavailable on server');
        success = await localService.createUser(userData);
      }

      if (success) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        
        // Store authentication state with mode information
        if (typeof window !== 'undefined') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('authMode', authMode);
          localStorage.setItem('databaseConfig', JSON.stringify(databaseConfig));
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError('Failed to create account. Email might already be registered.');
      }

    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-7xl"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/landing')}
              className="absolute top-6 left-6 text-white hover:text-emerald-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                InventSmart AI
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-gray-400">Set up your AI-powered inventory management system</p>

            {/* Mode Toggle Below Subtitle */}
            <div className="mt-4 flex items-center justify-center">
              {isClient ? (
                <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'airtable' | 'local')}>
                  <TabsList className="grid grid-cols-2 bg-white/10 rounded-full p-1 w-fit">
                    <TabsTrigger value="airtable" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm">
                      <Cloud className="w-4 h-4" />
                      Cloud
                    </TabsTrigger>
                    <TabsTrigger value="local" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4" />
                      Local
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              ) : (
                <div className="grid grid-cols-2 bg-white/10 rounded-full p-1 w-fit">
                  <div className="rounded-full px-4 py-2 flex items-center gap-2 text-sm bg-emerald-500 text-white">
                    <Database className="w-4 h-4" />
                    Local
                  </div>
                  <div className="rounded-full px-4 py-2 flex items-center gap-2 text-sm text-white">
                    <Cloud className="w-4 h-4" />
                    Cloud
                  </div>
                </div>
              )}
            </div>
          </div>

          <progress
            className="progress w-full h-2 mb-5 rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-[#3b4049] [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[#10b981] [&::-moz-progress-bar]:bg-[#10b981]"
            value={step - 1}
            max="2"
          ></progress>
          {/* Progress Steps */}
          {/* <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <span className="text-white text-sm font-semibold">1</span>
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-600'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <span className="text-white text-sm font-semibold">2</span>
              </div>
            </div>
          </div> */}

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Main Content - Left Right Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Database Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Database Configuration (Step 2) */}
              {step === 2 && isClient && authMode === 'local' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-[calc(100vh-250px)] overflow-y-auto rounded-lg"
                >
                  <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 w-full h-fit">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Local Database (MySQL)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DatabaseConfigComponent
                        onConfigChange={handleDatabaseConfigChange}
                        onTestConnection={handleTestConnection}
                        initialConfig={databaseConfig}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 2 && isClient && authMode === 'airtable' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-[calc(100vh-250px)] overflow-y-auto rounded-lg"
                >
                  <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 w-full h-fit">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center">
                        <Cloud className="w-5 h-5 mr-2" />
                        Cloud Database (MongoDB)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1 sm:col-span-2">
                          <div className="text-white font-medium mb-2">Cloud Database</div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-300">MongoDB (recommended)</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-white">Cluster</Label>
                          <div className="mt-2 text-gray-300">cluster0.mongodb.net</div>
                        </div>
                        <div>
                          <Label className="text-white">Database Name</Label>
                          <div className="mt-2 text-gray-300">ai_inventory</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">We auto-configured recommended MongoDB settings for cloud. Use Test Connection to verify access.</div>
                      <div className="flex items-center gap-3">
                        <Button onClick={async () => { setCloudTestMessage(''); setCloudTestSuccess(null); setCloudTestLoading(true); const ok = await handleTestConnection(databaseConfig); setCloudTestSuccess(ok); setCloudTestMessage(ok ? 'Connection successful.' : 'Connection failed. Check credentials or network.'); setCloudTestLoading(false); }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-11 font-semibold">
                          {cloudTestLoading ? 'Testing...' : 'Test Connection'}
                        </Button>
                        {cloudTestSuccess !== null && (
                          <span className={cloudTestSuccess ? 'text-emerald-400' : 'text-red-400'}>{cloudTestMessage}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Right Side - Account Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 h-fit">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <User className="w-6 h-6 mr-3" />
                    Account Information - {isClient ? (authMode === 'airtable' ? 'Cloud Mode' : 'Local Mode') : 'Local Mode'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400 h-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400 h-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    {step === 2 && (
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-white/20 text-white hover:bg-white/10 h-12"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      className={`bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-12 text-lg font-semibold ${step === 2 ? 'flex-1' : 'w-full'}`}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : step === 1 ? 'Next Step' : 'Create Account'}
                      {step === 1 && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 