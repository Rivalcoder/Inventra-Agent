'use client';

import { useState, useEffect } from 'react';
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

// Local authentication service (same as in signin)
class LocalAuthService {
  private users: any[] = [];

  constructor() {
    this.users = JSON.parse(localStorage.getItem('local_users') || '[]');
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
      localStorage.setItem('local_users', JSON.stringify(this.users));
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
        localStorage.setItem('local_users', JSON.stringify(updatedUsers));
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error verifying local user:', error);
      return null;
    }
  }
}

const localAuthService = new LocalAuthService();

interface DatabaseConfig {
  name: string;
  icon: any;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    placeholder: string;
    type: string;
    defaultValue?: string;
  }>;
}

const databaseConfigs: Record<string, DatabaseConfig> = {
  mysql: {
    name: "MySQL",
    icon: Database,
    description: "Popular relational database with ACID compliance",
    fields: [
      { name: "host", label: "Database Host", placeholder: "localhost", type: "text", defaultValue: "localhost" },
      { name: "port", label: "Port", placeholder: "3306", type: "text", defaultValue: "3306" },
      { name: "database", label: "Database Name", placeholder: "inventory_db", type: "text", defaultValue: "inventory_db" },
      { name: "username", label: "Username", placeholder: "root", type: "text", defaultValue: "root" },
      { name: "password", label: "Password", placeholder: "Enter your password", type: "password" }
    ]
  },
  postgresql: {
    name: "PostgreSQL",
    icon: Database,
    description: "Advanced open-source database with JSON support",
    fields: [
      { name: "host", label: "Database Host", placeholder: "localhost", type: "text", defaultValue: "localhost" },
      { name: "port", label: "Port", placeholder: "5432", type: "text", defaultValue: "5432" },
      { name: "database", label: "Database Name", placeholder: "inventory_db", type: "text", defaultValue: "inventory_db" },
      { name: "username", label: "Username", placeholder: "postgres", type: "text", defaultValue: "postgres" },
      { name: "password", label: "Password", placeholder: "Enter your password", type: "password" }
    ]
  },
  mongodb: {
    name: "MongoDB",
    icon: Globe,
    description: "NoSQL database with flexible document storage",
    fields: [
      { name: "uri", label: "MongoDB URI", placeholder: "mongodb://localhost:27017", type: "text", defaultValue: "mongodb://localhost:27017" },
      { name: "database", label: "Database Name", placeholder: "inventory_db", type: "text", defaultValue: "inventory_db" },
      { name: "username", label: "Username", placeholder: "Enter username", type: "text" },
      { name: "password", label: "Password", placeholder: "Enter your password", type: "password" }
    ]
  },
  sqlite: {
    name: "SQLite",
    icon: Database,
    description: "Lightweight, serverless database",
    fields: [
      { name: "database", label: "Database File", placeholder: "inventory.db", type: "text", defaultValue: "inventory.db" }
    ]
  }
};

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authMode, setAuthMode] = useState<'airtable' | 'local'>(configService.getAuthMode());
  const [isDemoMode, setIsDemoMode] = useState(configService.isDemoMode());

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    databaseType: '',
    databaseConfig: {} as Record<string, string>
  });

  // Update auth mode when it changes
  useEffect(() => {
    configService.setAuthMode(authMode);
  }, [authMode]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('db_')) {
      const dbField = field.replace('db_', '');
      setFormData(prev => ({
        ...prev,
        databaseConfig: {
          ...prev.databaseConfig,
          [dbField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleDatabaseSelect = (dbType: string) => {
    setSelectedDatabase(dbType);
    setFormData(prev => ({
      ...prev,
      databaseType: dbType,
      databaseConfig: {}
    }));
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
    if (!selectedDatabase) {
      setError('Please select a database type');
      return false;
    }
    
    const config = databaseConfigs[selectedDatabase];
    for (const field of config.fields) {
      if (!formData.databaseConfig[field.name]) {
        setError(`Please fill in ${field.label}`);
        return false;
      }
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
        databaseType: selectedDatabase,
        databaseConfig: formData.databaseConfig,
        createdAt: new Date().toISOString()
      };

      let success = false;

      if (authMode === 'airtable') {
        // Create user in Airtable
        success = await airtableService.createUser(userData);
      } else {
        // Create user in local storage
        success = await localAuthService.createUser(userData);
      }

      if (success) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        
        // Store authentication state with mode information
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('authMode', authMode);
        
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
            
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-gray-400">Set up your AI-powered inventory management system</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <span className="text-white text-sm font-semibold">1</span>
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-600'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                <span className="text-white text-sm font-semibold">2</span>
              </div>
            </div>
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
            {/* Left Side - Authentication Mode & Database Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Authentication Mode Selector */}
              <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Authentication Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'airtable' | 'local')}>
                    <TabsList className="grid w-full grid-cols-2 bg-white/10">
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
                    
                    <TabsContent value="airtable" className="mt-4">
                      <div className="text-sm text-gray-300 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <span>Cloud-based authentication using Airtable</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span>Data stored securely in the cloud</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Cloud className="w-4 h-4 text-emerald-400" />
                          <span>Requires internet connection</span>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="local" className="mt-4">
                      <div className="text-sm text-gray-300 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <span>Local authentication system</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <span>Data stored locally in your browser</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span>Works offline</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Database Configuration (Step 2) */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Database Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Database Selection */}
                      <div>
                        <Label className="text-white mb-3 block">Select Database Type</Label>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(databaseConfigs).map(([key, config]) => (
                            <div
                              key={key}
                              onClick={() => handleDatabaseSelect(key)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                                selectedDatabase === key
                                  ? 'border-emerald-500 bg-emerald-500/20'
                                  : 'border-white/20 bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <config.icon className="w-5 h-5 text-emerald-400" />
                                <div>
                                  <h3 className="font-semibold text-white text-sm">{config.name}</h3>
                                  <p className="text-xs text-gray-400">{config.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Database Configuration Fields */}
                      {selectedDatabase && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <Label className="text-white text-sm">Database Configuration</Label>
                          {databaseConfigs[selectedDatabase].fields.map((field) => (
                            <div key={field.name}>
                              <Label htmlFor={field.name} className="text-white text-sm">{field.label}</Label>
                              <Input
                                id={field.name}
                                type={field.type}
                                placeholder={field.placeholder}
                                defaultValue={field.defaultValue}
                                onChange={(e) => handleInputChange(`db_${field.name}`, e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 h-10 text-sm"
                              />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Right Side - Account Creation Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 h-full">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <User className="w-6 h-6 mr-3" />
                    Account Information - {authMode === 'airtable' ? 'Cloud Mode' : 'Local Mode'}
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