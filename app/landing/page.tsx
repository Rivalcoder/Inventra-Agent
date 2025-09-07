'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  ArrowRight,
  Github,
  Globe,
  Cpu,
  Smartphone,
  Cloud,
  Lock,
  Sparkles,
  Rocket,
  Play,
  Download,
  Brain,
  ShieldCheck,
  Zap as Lightning,
  Target as Aim
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DemoVideo from '@/components/landing/demo-video';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number}>>([]);
  const [quickQuery, setQuickQuery] = useState('');
  const router = useRouter();

  const features = [
    {
      icon: Package,
      title: "Smart Inventory Management",
      description: "Track stock levels, set alerts, and manage products with AI-powered insights",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Sales Analytics",
      description: "Monitor sales trends, revenue growth, and customer behavior patterns",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Reporting",
      description: "Generate comprehensive reports and visualize data with interactive charts",
      color: "from-slate-500 to-gray-500"
    },
    {
      icon: Zap,
      title: "AI-Powered Queries",
      description: "Ask questions in natural language and get intelligent insights about your business",
      color: "from-orange-500 to-red-500"
    }
  ];

  const showcases = [
    {
      title: "Real-time Dashboard",
      description: "Live updates and instant notifications",
      icon: Cpu,
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Mobile Responsive",
      description: "Works perfectly on all devices",
      icon: Smartphone,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Cloud Sync",
      description: "Access your data anywhere, anytime",
      icon: Cloud,
      color: "from-slate-500 to-gray-500"
    },
    {
      title: "Secure & Private",
      description: "Enterprise-grade security",
      icon: Lock,
      color: "from-red-500 to-orange-500"
    }
  ];

  const exampleQueries = [
    'What are my top 5 selling products this week?',
    'Which items are low on stock today?',
    'Show revenue by month for this year',
    'Predict next month sales for product A',
  ];

  const infoCards = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations and predictions based on your data patterns",
      color: "from-slate-500 to-gray-500"
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols to protect your sensitive data",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Lightning,
      title: "Lightning Fast",
      description: "Optimized performance with real-time updates and instant data processing",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Aim,
      title: "Precision Analytics",
      description: "Accurate forecasting and trend analysis with advanced machine learning",
      color: "from-blue-500 to-indigo-500"
    }
  ];

  useEffect(() => {
    // Set visible immediately to avoid loading delay
    setIsVisible(true);
    
    // Generate particles with random positions
    const particleData = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(particleData);
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenSource = () => {
    window.open('https://github.com/your-repo/inventory-ai', '_blank');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleDemo = () => {
    // Redirect to signin page with demo mode
    router.push('/auth/signin?demo=true');
  };

  const handleQuickAsk = () => {
    const q = quickQuery.trim();
    const query = q || exampleQueries[0];
    router.push(`/query?ask=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center p-6"
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              InventSmart AI
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center space-x-4"
          >
            <Button variant="ghost" className="text-white hover:text-emerald-400" asChild>
              <Link href="/docs">Docs</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/signin')}
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto text-center mt-16">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mb-16"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-500/30 mb-6"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
                <span className="text-emerald-400 text-sm font-medium">AI-Powered Inventory Management</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent leading-tight">
                Smart Inventory
                <br />
                <span className="text-5xl md:text-7xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Transform your business with <span className="text-emerald-400 font-semibold">AI-powered</span> inventory and sales management. 
                <br />Track, analyze, and optimize your operations with intelligent insights.
              </p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button 
                  onClick={handleSignUp}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button 
                  onClick={handleOpenSource}
                  size="lg"
                  variant="outline"
                  className="border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Github className="mr-2 w-5 h-5" />
                  Open Source
                  <Download className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>

              {/* Demo Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8"
              >
                <Button 
                  onClick={handleDemo}
                  variant="ghost"
                  className="text-gray-400 hover:text-emerald-400 group"
                >
                  <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Features Ribbons - No cards */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-24"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative"
                >
                  <div className="relative overflow-visible">
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-white/30 to-white/0 rounded-full opacity-60" />
                    <div className="relative pl-24 pr-8 py-6 rounded-2xl">
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/10 group-hover:scale-105 transition-transform`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-1 text-white tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <div className={`mt-4 h-[3px] w-24 bg-gradient-to-r ${feature.color} rounded-full opacity-70 group-hover:w-32 transition-all`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Animated Separator */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8 }}
              className="relative mb-16"
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <motion.div
                initial={{ x: '-10%' }}
                animate={{ x: '110%' }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1 left-0 w-24 h-2 bg-gradient-to-r from-emerald-400/0 via-emerald-400/70 to-emerald-400/0 rounded-full"
              />
            </motion.div>

            

            {/* Showcases Section - Icon blocks, no containers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mb-24"
            >
              <h2 className="text-4xl font-bold text-white mb-12">Why Choose InventSmart AI?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {showcases.map((showcase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="text-center group"
                  >
                    <div className={`w-20 h-20 bg-gradient-to-r ${showcase.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <showcase.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1 text-white">
                      {showcase.title}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      {showcase.description}
                    </p>
                    <div className="mt-4 h-px w-16 mx-auto bg-white/10" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Animated Split */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8 }}
              className="relative mb-16"
            >
              <svg className="w-full h-8" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <path d="M0,4 C20,2 40,6 60,4 C80,2 90,5 100,4" stroke="url(#grad)" strokeWidth="1" fill="none" />
              </svg>
              <motion.div
                initial={{ x: '10%' }}
                animate={{ x: ['10%', '90%', '10%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1 left-0 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              />
            </motion.div>

            {/* Advanced Features - Zigzag timeline, no cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="mb-28"
            >
              <h2 className="text-4xl font-bold text-white mb-12">Advanced Features</h2>
              <div className="relative max-w-5xl mx-auto">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
                <div className="space-y-10">
                  {infoCards.map((card, index) => {
                    const isLeft = index % 2 === 0;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                        className={`relative flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`w-full md:w-1/2 ${isLeft ? 'pr-8' : 'pl-8'}`}>
                          <div className={`flex items-start gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-lg ring-4 ring-white/10`}>
                              <card.icon className="w-7 h-7 text-white" />
                            </div>
                            <div className={`${isLeft ? 'text-left' : 'text-right'}`}>
                              <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                              <p className="text-gray-300 text-sm leading-relaxed">{card.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-1/2 top-3 -translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Quick AI Query - Useful interactive section (moved above CTA) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16"
            >
              <div className="text-center mb-6">
                <span className="text-sm uppercase tracking-widest text-gray-400">Ask a quick question</span>
                <h3 className="mt-2 text-2xl md:text-3xl font-semibold text-white">Get instant insights with AI</h3>
              </div>
              <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="relative flex-1">
                  <Input
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    placeholder="e.g. What are my top 5 selling products this week?"
                    className="bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-400 pr-10"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAsk(); }}
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                </div>
                <Button onClick={handleQuickAsk} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                  Ask AI
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              <div className="max-w-3xl mx-auto mt-4 flex flex-wrap gap-2 justify-center">
                {exampleQueries.map((ex, i) => (
                  <Button key={i} variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/10"
                    onClick={() => setQuickQuery(ex)}
                  >
                    {ex}
                  </Button>
                ))}
              </div>
              <div className="max-w-3xl mx-auto mt-6">
                <div className="h-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                  <motion.div
                    initial={{ x: '-20%' }}
                    animate={{ x: '120%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute top:0 left-0 h-full w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                  <div className="p-4 space-y-2">
                    <div className="w-2/3 h-3 bg-white/10 rounded" />
                    <div className="w-1/2 h-3 bg-white/10 rounded" />
                    <div className="w-5/6 h-3 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of businesses using AI-powered inventory management to boost efficiency and profits
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    onClick={handleSignUp}
                    size="lg"
                    variant="secondary"
                    className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={handleOpenSource}
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Github className="mr-2 w-5 h-5" />
                    View on GitHub
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="text-center py-8 text-gray-400"
        >
          <div className="flex justify-center items-center space-x-6 mb-4">
            <span className="text-sm">© 2024 InventSmart AI</span>
            <span className="text-sm">•</span>
            <span className="text-sm">Privacy Policy</span>
            <span className="text-sm">•</span>
            <span className="text-sm">Terms of Service</span>
          </div>
          <div className="flex justify-center items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-emerald-400">
              <Github className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-emerald-400">
              <Globe className="w-4 h-4" />
            </Button>
          </div>
        </motion.footer>
      </div>

      {/* Demo Video Modal */}
      <DemoVideo isOpen={showDemo} onClose={() => setShowDemo(false)} />

      {/* Floating Animation Elements */}
      <AnimatePresence>
        {isVisible && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="fixed top-20 left-10 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="fixed top-40 right-20 w-6 h-6 bg-teal-400 rounded-full animate-pulse"
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="fixed bottom-40 left-20 w-3 h-3 bg-slate-400 rounded-full animate-pulse"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 