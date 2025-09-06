import { 
  BookOpen, 
  Rocket, 
  Package, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Code, 
  Database,
  Users,
  HelpCircle,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DocsHomePage() {
  const quickStartSteps = [
    {
      step: 1,
      title: "Install Dependencies",
      description: "Install all required packages and dependencies",
      href: "/docs/installation"
    },
    {
      step: 2,
      title: "Configure Environment",
      description: "Set up your database and API credentials",
      href: "/docs/configuration"
    },
    {
      step: 3,
      title: "Run the Application",
      description: "Start the development server and access the app",
      href: "/docs/first-steps"
    }
  ];

  const featureCards = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Complete product management with stock tracking, alerts, and supplier information",
      href: "/docs/features/inventory",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Sales Analytics",
      description: "Track sales performance, revenue trends, and customer insights",
      href: "/docs/features/sales",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Brain,
      title: "AI Query Console",
      description: "Ask natural language questions and get intelligent business insights",
      href: "/docs/features/ai-query",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Generate comprehensive reports with charts and data visualization",
      href: "/docs/features/reports",
      color: "from-orange-500 to-red-500"
    }
  ];

  const guideSections = [
    {
      icon: Users,
      title: "User Guides",
      description: "Step-by-step tutorials for all features",
      href: "/docs/guides",
      count: "6 guides"
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation with examples",
      href: "/docs/api",
      count: "5 endpoints"
    },
    {
      icon: Database,
      title: "Database Setup",
      description: "Database configuration and management",
      href: "/docs/database",
      count: "4 topics"
    },
    {
      icon: HelpCircle,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      href: "/docs/troubleshooting",
      count: "FAQ included"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">InventSmart AI Documentation</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete guide to building and managing your AI-powered inventory and sales management system. 
          From installation to advanced features, everything you need to know.
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Star className="w-3 h-3 mr-1" />
            Latest Version
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Updated Today
          </Badge>
        </div>
      </div>

      {/* Quick Start */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Rocket className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Quick Start</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStartSteps.map((step) => (
            <Card key={step.step} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{step.description}</CardDescription>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={step.href}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Overview */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Core Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureCards.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={feature.href}>
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Documentation Sections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guideSections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{section.count}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={section.href}>
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Benefits */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Why Choose InventSmart AI?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Modern Stack</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built with Next.js 15, React 18, TypeScript, and Tailwind CSS for optimal performance and developer experience.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Enterprise Ready</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Secure, scalable, and production-ready with comprehensive error handling and data validation.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Powered</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Integrated with Google Gemini AI for intelligent insights, natural language queries, and automated analytics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-semibold">Ready to Get Started?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Follow our comprehensive guides to set up your AI-powered inventory management system in minutes.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button asChild size="lg">
            <Link href="/docs/installation">
              <Rocket className="mr-2 h-5 w-5" />
              Start Installation
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/docs/guides">
              <Users className="mr-2 h-5 w-5" />
              View User Guides
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
