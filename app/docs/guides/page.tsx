import { 
  Users, 
  Package, 
  TrendingUp, 
  Brain, 
  BarChart3, 
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UserGuidesPage() {
  const userGuides = [
    {
      title: "Adding Products",
      description: "Learn how to add and manage products in your inventory system",
      icon: Package,
      href: "/docs/guides/adding-products",
      duration: "5 min read",
      difficulty: "Beginner",
      features: [
        "Product information setup",
        "Stock level configuration",
        "Category management",
        "Supplier information"
      ]
    },
    {
      title: "Managing Sales",
      description: "Complete guide to recording and tracking sales transactions",
      icon: TrendingUp,
      href: "/docs/guides/managing-sales",
      duration: "7 min read",
      difficulty: "Beginner",
      features: [
        "Recording sales transactions",
        "Customer management",
        "Sales history tracking",
        "Revenue calculations"
      ]
    },
    {
      title: "Using AI Queries",
      description: "Master the AI Query Console for intelligent business insights",
      icon: Brain,
      href: "/docs/guides/ai-queries",
      duration: "10 min read",
      difficulty: "Intermediate",
      features: [
        "Natural language queries",
        "Data analysis techniques",
        "Business insights",
        "Query optimization"
      ]
    },
    {
      title: "Generating Reports",
      description: "Create comprehensive reports and export data for analysis",
      icon: BarChart3,
      href: "/docs/guides/reports",
      duration: "8 min read",
      difficulty: "Intermediate",
      features: [
        "Sales reports",
        "Inventory reports",
        "Data export options",
        "Custom date ranges"
      ]
    },
    {
      title: "Settings & Configuration",
      description: "Configure your application settings and preferences",
      icon: Settings,
      href: "/docs/guides/settings",
      duration: "6 min read",
      difficulty: "Beginner",
      features: [
        "Company setup",
        "User preferences",
        "Database management",
        "Backup configuration"
      ]
    },
    {
      title: "Dashboard Overview",
      description: "Navigate and customize your main dashboard",
      icon: BarChart3,
      href: "/docs/guides/dashboard",
      duration: "4 min read",
      difficulty: "Beginner",
      features: [
        "Dashboard navigation",
        "Key metrics overview",
        "Quick actions",
        "Widget customization"
      ]
    }
  ];

  const learningPaths = [
    {
      title: "Getting Started Path",
      description: "Perfect for new users who want to learn the basics",
      icon: Play,
      color: "from-green-500 to-emerald-500",
      guides: [
        "Adding Products",
        "Managing Sales",
        "Settings & Configuration",
        "Dashboard Overview"
      ],
      estimatedTime: "25 minutes"
    },
    {
      title: "Advanced Features Path",
      description: "For users ready to explore advanced capabilities",
      icon: Star,
      color: "from-blue-500 to-indigo-500",
      guides: [
        "Using AI Queries",
        "Generating Reports",
        "Advanced Settings"
      ],
      estimatedTime: "30 minutes"
    },
    {
      title: "Complete Mastery Path",
      description: "Comprehensive learning for power users",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
      guides: [
        "All Beginner Guides",
        "All Advanced Guides",
        "Best Practices",
        "Troubleshooting"
      ],
      estimatedTime: "60 minutes"
    }
  ];

  const quickTips = [
    {
      title: "Product Management",
      tip: "Use consistent naming conventions for products to make searching easier",
      icon: Package
    },
    {
      title: "Sales Tracking",
      tip: "Record sales immediately to keep inventory levels accurate",
      icon: TrendingUp
    },
    {
      title: "AI Queries",
      tip: "Be specific with time periods in your queries for better results",
      icon: Brain
    },
    {
      title: "Reports",
      tip: "Export reports regularly for backup and external analysis",
      icon: BarChart3
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">User Guides</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Step-by-step tutorials to help you master InventSmart AI. From basic setup to advanced features, 
          these guides will get you up and running quickly.
        </p>
      </div>

      {/* Learning Paths */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Learning Paths</h2>
        <p className="text-muted-foreground">
          Follow these structured learning paths based on your experience level and goals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <Card key={path.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${path.color} rounded-lg flex items-center justify-center`}>
                    <path.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Includes:</h4>
                  <ul className="space-y-1">
                    {path.guides.map((guide) => (
                      <li key={guide} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{guide}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {path.estimatedTime}
                  </Badge>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/docs/guides/getting-started-path">
                      Start Path
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Individual Guides */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Individual Guides</h2>
        <p className="text-muted-foreground">
          Browse specific guides for particular features or tasks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userGuides.map((guide) => (
            <Card key={guide.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <guide.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription className="text-sm">{guide.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {guide.duration}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {guide.difficulty}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-sm">What you'll learn:</h4>
                  <ul className="space-y-1">
                    {guide.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={guide.href}>
                    Read Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Tips */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Quick Tips</h2>
        <p className="text-muted-foreground">
          Essential tips to help you get the most out of InventSmart AI.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickTips.map((tip) => (
            <Card key={tip.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <tip.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tip.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tip.tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Ready to Start Learning?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>New to InventSmart AI?</CardTitle>
              <CardDescription>Start with the basics and build your knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/guides/adding-products">
                  <Package className="mr-2 h-4 w-4" />
                  Start with Adding Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Want to Explore AI Features?</CardTitle>
              <CardDescription>Jump into the AI Query Console</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/guides/ai-queries">
                  <Brain className="mr-2 h-4 w-4" />
                  Learn AI Queries
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Documentation</CardTitle>
              <CardDescription>Detailed technical documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/features">
                  View Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>For developers and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/api">
                  API Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/troubleshooting">
                  Get Help
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
