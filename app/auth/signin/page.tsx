'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, 
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Database,
  Cloud,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { airtableService } from '@/lib/services/airtable';
import { configService } from '@/lib/services/config';
import { DatabaseConfig } from '@/lib/types/database';
import { Badge } from '@/components/ui/badge';

// Local authentication service
class LocalAuthService {
  private users: any[] = [];

  constructor() {
    // Load users from localStorage (client only)
    if (typeof window !== 'undefined') {
      this.users = JSON.parse(localStorage.getItem('local_users') || '[]');
    } else {
      this.users = [];
    }
    
    // Add demo users if they don't exist
    const demoUsers = [
      {
        id: 'demo-user-1',
        email: 'demo@local.com',
        password: 'demo123',
        name: 'Demo User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
    ];
    
    // Check if demo users exist, if not add them
    demoUsers.forEach(demoUser => {
      const existingUser = this.users.find(u => u.email === demoUser.email);
      if (!existingUser) {
        this.users.push(demoUser);
      }
    });
    
    // Save updated users list (client only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('local_users', JSON.stringify(this.users));
    }
  }

  async createUser(userData: any): Promise<boolean> {
    try {
      // Check if user already exists
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
        // Update last login
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

  async getUserByEmail(email: string): Promise<any | null> {
    return this.users.find(u => u.email === email) || null;
  }
}

let localAuthService: LocalAuthService | null = null;

export default function SignInPage() {
  const router = useRouter();
  const localService = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (!localAuthService) localAuthService = new LocalAuthService();
    return localAuthService;
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authMode, setAuthMode] = useState<'airtable' | 'local'>('local');
  const [isClient, setIsClient] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [createAccountData, setCreateAccountData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [onlineDbType, setOnlineDbType] = useState<'mysql' | 'mongodb'>('mysql');

  // Handle demo mode from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('demo') === 'true';
    
    if (isDemo) {
      // Set demo credentials and auto-sign in
      const demoCredentials = authMode === 'airtable' 
        ? { email: 'demo@airtable.com', password: 'demo123' }
        : { email: 'demo@local.com', password: 'demo123' };
      
      setFormData(demoCredentials);
      setLoading(true);
      
      // Auto-sign in after a short delay
      setTimeout(() => {
        handleSignIn();
      }, 1000);
    }
  }, [authMode]);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);

    try {
      let userData = null;

      if (authMode === 'airtable') {
        // Use Airtable service
        userData = await airtableService.verifyUser(formData.email, formData.password);
      } else {
        // Use local authentication
        if (!localService) throw new Error('Local service unavailable on server');
        userData = await localService.verifyUser(formData.email, formData.password);
      }

      if (userData) {
        // Load database configuration from user data or localStorage
        let databaseConfig: DatabaseConfig | null = null;
        
        if (userData.databaseConfig) {
          databaseConfig = userData.databaseConfig;
        } else {
          // Try to load from localStorage (for existing users)
          const storedConfig = localStorage.getItem('databaseConfig');
          if (storedConfig) {
            databaseConfig = JSON.parse(storedConfig);
          }
        }

        // Set the database configuration if available
        if (databaseConfig) {
          // Store in localStorage for client-side access
          if (typeof window !== 'undefined') {
            localStorage.setItem('databaseConfig', JSON.stringify(databaseConfig));
          }
        }

        setSuccess('Sign in successful! Redirecting to dashboard...');
        
        // Store authentication state with mode information
        if (typeof window !== 'undefined') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('authMode', authMode);
        }
        
        // Store database configuration
        if (databaseConfig) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('databaseConfig', JSON.stringify(databaseConfig));
          }
        }
        
        // For demo mode, also set demo flag
        if (formData.email.includes('demo')) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('isDemoMode', 'true');
          }
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError('Invalid email or password. Please try again.');
      }

    } catch (err) {
      console.error('Sign in error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setLoading(true);
    
    // Demo credentials based on auth mode
    const demoCredentials = authMode === 'airtable' 
      ? { email: 'demo@airtable.com', password: 'demo123' }
      : { email: 'demo@local.com', password: 'demo123' };

    setFormData(demoCredentials);
    
    setTimeout(() => {
      handleSignIn();
    }, 500);
  };

  const handleCreateOfflineAccount = async () => {
    setError('');
    if (!createAccountData.name || !createAccountData.email || !createAccountData.password) {
      setError('Please fill in all Create Account fields');
      return;
    }
    if (!localService) {
      setError('Local service not available');
      return;
    }
    const created = await localService.createUser({
      name: createAccountData.name,
      email: createAccountData.email,
      password: createAccountData.password,
      role: 'user',
      databaseConfig: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'ai_inventory',
        user: 'root'
      } as unknown as DatabaseConfig
    });
    if (!created) {
      setError('User already exists. Try signing in.');
      return;
    }
    setSuccess('Account created locally. You can now sign in.');
  };

  const handleCreateOnlineAccount = async () => {
    setError('');
    if (!isOnline) {
      setError('You are offline. Connect to the internet to create an online account.');
      return;
    }
    if (!createAccountData.name || !createAccountData.email || !createAccountData.password) {
      setError('Please fill in all Create Online Account fields');
      return;
    }
    // Placeholder: In real app, call backend/signup for cloud provider
    setSuccess(`Online account request submitted with ${onlineDbType.toUpperCase()} defaults.`);
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
          className="w-full max-w-6xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/landing')}
              className="absolute top-6 left-6 text-white hover:text-emerald-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                InventSmart AI
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your AI-powered inventory management system</p>
          </div>

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
            {/* Left Side - Authentication Mode Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 h-full">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <Settings className="w-6 h-6 mr-3" />
                    Choose Authentication Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   {isClient ? (
                     <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'airtable' | 'local')}>
                       <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-6">
                         <TabsTrigger 
                           value="airtable" 
                           className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                         >
                           <Cloud className="w-4 h-4 mr-2" />
                           Cloud
                         </TabsTrigger>
                         <TabsTrigger 
                           value="local" 
                           className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                         >
                           <Database className="w-4 h-4 mr-2" />
                           Local
                         </TabsTrigger>
                       </TabsList>
                       
                       <TabsContent value="airtable" className="space-y-4">
                         <div className="flex items-start space-x-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                           <Cloud className="w-8 h-8 text-emerald-400 mt-1" />
                           <div>
                             <h3 className="font-semibold text-white text-lg">Cloud Authentication</h3>
                             <p className="text-gray-300 text-sm mt-1">Secure cloud-based authentication using Airtable</p>
                           </div>
                         </div>
                         
                         <div className="space-y-3 text-sm text-gray-300">
                           <div className="flex items-center space-x-2">
                             <Shield className="w-4 h-4 text-emerald-400" />
                             <span>Data stored securely in the cloud</span>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Zap className="w-4 h-4 text-emerald-400" />
                             <span>Cross-device synchronization</span>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Cloud className="w-4 h-4 text-emerald-400" />
                             <span>Requires internet connection</span>
                           </div>
                         </div>
                         
                         {isDemoMode && (
                           <Button 
                             onClick={handleDemoSignIn}
                             variant="outline" 
                             size="sm" 
                             className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                           >
                             Try Demo (demo@airtable.com)
                           </Button>
                         )}
                       </TabsContent>
                       
                       <TabsContent value="local" className="space-y-4">
                         <div className="flex items-start space-x-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                           <Database className="w-8 h-8 text-emerald-400 mt-1" />
                           <div>
                             <h3 className="font-semibold text-white text-lg">Local Authentication</h3>
                             <p className="text-gray-300 text-sm mt-1">Privacy-focused local authentication system</p>
                           </div>
                         </div>
                         
                         <div className="space-y-3 text-sm text-gray-300">
                           <div className="flex items-center space-x-2">
                             <Shield className="w-4 h-4 text-emerald-400" />
                             <span>Data stored locally in your browser</span>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Zap className="w-4 h-4 text-emerald-400" />
                             <span>Works offline</span>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Database className="w-4 h-4 text-emerald-400" />
                             <span>No external dependencies</span>
                           </div>
                         </div>
                         
                         {isDemoMode && (
                           <Button 
                             onClick={handleDemoSignIn}
                             variant="outline" 
                             size="sm" 
                             className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                           >
                             Try Demo (demo@local.com)
                           </Button>
                         )}
                       </TabsContent>
                     </Tabs>
                   ) : (
                     <div className="grid w-full grid-cols-2 bg-white/10 mb-6 rounded-md p-1">
                       <div className="bg-emerald-500 text-white rounded-sm px-3 py-2 flex items-center justify-center">
                         <Database className="w-4 h-4 mr-2" />
                         Local
                       </div>
                       <div className="text-white rounded-sm px-3 py-2 flex items-center justify-center">
                         <Cloud className="w-4 h-4 mr-2" />
                         Cloud
                       </div>
                     </div>
                   )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Side - Sign In Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 h-full">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <Lock className="w-6 h-6 mr-3" />
                    Sign In - {authMode === 'airtable' ? 'Cloud Mode' : 'Local Mode'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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

                  <Button
                    onClick={handleSignIn}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-12 text-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-gray-400 text-sm">
                      Don't have an account?{' '}
                      <Button
                        variant="link"
                        onClick={() => router.push('/auth/signup')}
                        className="text-emerald-400 hover:text-emerald-300 p-0 h-auto font-semibold"
                      >
                        Sign up here
                      </Button>
                    </p>
                  </div>

                  {/* Database Info Panel */}
                  <div className="mt-2 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-medium">Database Configuration</span>
                      </div>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">Recommended</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-300"><span className="text-gray-400">Type:</span> MySQL</div>
                      <div className="text-gray-300"><span className="text-gray-400">Host:</span> localhost:3306</div>
                      <div className="text-gray-300"><span className="text-gray-400">Database:</span> ai_inventory</div>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">MySQL is recommended for most use cases. It's widely supported and has excellent performance.</p>
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