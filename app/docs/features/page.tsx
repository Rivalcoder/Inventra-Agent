import { 
  Package, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Settings, 
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Database,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FeaturesPage() {
  const coreFeatures = [
    {
      title: "Inventory Management",
      description: "Complete product catalog management with real-time stock tracking, automated alerts, and supplier information.",
      icon: Package,
      href: "/docs/features/inventory",
      features: [
        "Add, edit, and delete products",
        "Real-time stock level tracking",
        "Low stock alerts and notifications",
        "Product categorization and search",
        "Supplier information management",
        "Bulk import/export capabilities"
      ],
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Sales Management",
      description: "Streamlined sales process with transaction recording, customer management, and revenue tracking.",
      icon: TrendingUp,
      href: "/docs/features/sales",
      features: [
        "Record sales transactions",
        "Customer information tracking",
        "Sales history and analytics",
        "Revenue and profit calculations",
        "Sales reporting and insights",
        "Transaction search and filtering"
      ],
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "AI Query Console",
      description: "Natural language interface powered by Google Gemini AI for intelligent business insights and data analysis.",
      icon: Brain,
      href: "/docs/features/ai-query",
      features: [
        "Natural language queries",
        "Intelligent data analysis",
        "Predictive insights",
        "SQL query generation",
        "Business recommendations",
        "Automated reporting"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Reports & Analytics",
      description: "Comprehensive reporting system with interactive charts, data visualization, and export capabilities.",
      icon: BarChart3,
      href: "/docs/features/reports",
      features: [
        "Sales performance reports",
        "Inventory status reports",
        "Revenue analytics",
        "Interactive charts and graphs",
        "PDF and CSV export",
        "Custom date range filtering"
      ],
      color: "from-orange-500 to-red-500"
    }
  ];

  const additionalFeatures = [
    {
      title: "Dashboard",
      description: "Real-time overview of your business metrics and key performance indicators.",
      icon: BarChart3,
      href: "/docs/features/dashboard",
      features: ["Revenue tracking", "Stock alerts", "Sales trends", "Quick actions"]
    },
    {
      title: "Settings & Configuration",
      description: "Comprehensive settings management for company information, preferences, and system configuration.",
      icon: Settings,
      href: "/docs/features/settings",
      features: ["Company setup", "User preferences", "Database management", "Backup & restore"]
    },
    {
      title: "Multi-Database Support",
      description: "Support for multiple database systems including MySQL, PostgreSQL, and MongoDB.",
      icon: Database,
      href: "/docs/features/multi-database",
      features: ["MySQL support", "PostgreSQL support", "MongoDB support", "Easy migration"]
    },
    {
      title: "User Management",
      description: "Secure user authentication and role-based access control.",
      icon: Users,
      href: "/docs/features/user-management",
      features: ["User authentication", "Role-based access", "Security features", "Session management"]
    }
  ];

  const keyBenefits = [
    {
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations and predictions based on your data patterns",
      icon: Brain,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Real-Time Updates",
      description: "Live data synchronization across all features with instant notifications",
      icon: Zap,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols to protect your sensitive data",
      icon: Shield,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Modern Interface",
      description: "Intuitive, responsive design that works perfectly on all devices",
      icon: Globe,
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Features Overview</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Discover all the powerful features that make InventSmart AI the perfect solution for your inventory and sales management needs.
        </p>
      </div>

      {/* Core Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Core Features</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coreFeatures.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Capabilities:</h4>
                  <ul className="space-y-1">
                    {feature.features.map((capability) => (
                      <li key={capability} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild variant="outline" className="w-full">
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

      {/* Additional Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Additional Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {additionalFeatures.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((capability) => (
                    <Badge key={capability} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={feature.href}>
                    View Details
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
        <h2 className="text-2xl font-semibold">Why Choose InventSmart AI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyBenefits.map((benefit) => (
            <Card key={benefit.title} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Feature Comparison</h2>
        <Card>
          <CardHeader>
            <CardTitle>What Makes Us Different?</CardTitle>
            <CardDescription>
              Compare InventSmart AI with traditional inventory management systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Feature</th>
                    <th className="text-center p-3 font-medium">InventSmart AI</th>
                    <th className="text-center p-3 font-medium">Traditional Systems</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="p-3">AI-Powered Queries</td>
                    <td className="text-center p-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-3">
                      <span className="text-muted-foreground">✗</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Real-Time Analytics</td>
                    <td className="text-center p-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-3">
                      <span className="text-muted-foreground">Limited</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Modern UI/UX</td>
                    <td className="text-center p-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-3">
                      <span className="text-muted-foreground">Outdated</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Multi-Database Support</td>
                    <td className="text-center p-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-3">
                      <span className="text-muted-foreground">Single DB</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Cloud-Ready</td>
                    <td className="text-center p-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-3">
                      <span className="text-muted-foreground">On-Premise</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Getting Started */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Ready to Explore?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Start with Core Features</CardTitle>
              <CardDescription>Begin with inventory and sales management</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/features/inventory">
                  Inventory Management
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Try AI Features</CardTitle>
              <CardDescription>Explore the AI Query Console</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/features/ai-query">
                  AI Query Console
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
