import { 
  Play, 
  Package, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Settings, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users,
  FileText,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FirstStepsPage() {
  const gettingStartedSteps = [
    {
      step: 1,
      title: "Access the Application",
      description: "Open your browser and navigate to the application URL",
      details: "If running locally, go to http://localhost:3000. You'll see the landing page with options to sign in or sign up.",
      icon: Play,
      color: "from-blue-500 to-indigo-500"
    },
    {
      step: 2,
      title: "Create Your Account",
      description: "Sign up for a new account or sign in with existing credentials",
      details: "Click 'Get Started Free' or 'Sign Up' to create your account. Fill in your company information and preferences.",
      icon: Users,
      color: "from-emerald-500 to-teal-500"
    },
    {
      step: 3,
      title: "Configure Your Settings",
      description: "Set up your company information and preferences",
      details: "Go to Settings and configure your company name, logo, currency, and other preferences. This personalizes your experience.",
      icon: Settings,
      color: "from-purple-500 to-pink-500"
    },
    {
      step: 4,
      title: "Add Your First Products",
      description: "Start building your inventory by adding products",
      details: "Navigate to Inventory and click 'Add Product'. Fill in product details like name, description, price, and stock levels.",
      icon: Package,
      color: "from-orange-500 to-red-500"
    },
    {
      step: 5,
      title: "Record Your First Sale",
      description: "Process a sale transaction to see the system in action",
      details: "Go to Sales and click 'Add Sale'. Select a product, enter quantity, and complete the transaction. Watch your inventory update automatically.",
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-500"
    },
    {
      step: 6,
      title: "Explore AI Features",
      description: "Try the AI Query Console for intelligent insights",
      details: "Visit the AI Query page and ask questions like 'What are my top products?' or 'Show me low stock items'. The AI will analyze your data and provide insights.",
      icon: Brain,
      color: "from-violet-500 to-purple-500"
    }
  ];

  const featureTutorials = [
    {
      title: "Inventory Management",
      description: "Learn how to manage your product catalog effectively",
      icon: Package,
      href: "/docs/guides/adding-products",
      features: ["Add Products", "Edit Details", "Stock Tracking", "Low Stock Alerts"]
    },
    {
      title: "Sales Management",
      description: "Master the sales process and transaction handling",
      icon: TrendingUp,
      href: "/docs/guides/managing-sales",
      features: ["Record Sales", "View History", "Customer Management", "Revenue Tracking"]
    },
    {
      title: "AI Query Console",
      description: "Harness the power of AI for business insights",
      icon: Brain,
      href: "/docs/guides/ai-queries",
      features: ["Natural Language Queries", "Data Analysis", "Predictive Insights", "SQL Generation"]
    },
    {
      title: "Reports & Analytics",
      description: "Generate comprehensive reports and visualizations",
      icon: BarChart3,
      href: "/docs/guides/reports",
      features: ["Sales Reports", "Inventory Reports", "Revenue Charts", "Export Options"]
    }
  ];

  const quickActions = [
    {
      title: "Add Sample Data",
      description: "Populate your system with sample products and sales for testing",
      action: "Go to Settings > Database > Import Sample Data",
      icon: Database
    },
    {
      title: "Configure Notifications",
      description: "Set up email notifications for low stock and important events",
      action: "Go to Settings > Notifications and configure your preferences",
      icon: Zap
    },
    {
      title: "Customize Dashboard",
      description: "Personalize your dashboard with relevant metrics and widgets",
      action: "Visit Dashboard and use the customization options",
      icon: BarChart3
    },
    {
      title: "Set Up Backup",
      description: "Configure automatic backups to protect your data",
      action: "Go to Settings > Database > Backup Configuration",
      icon: FileText
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Play className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">First Steps</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Get up and running with InventSmart AI in just a few minutes. Follow this step-by-step guide to set up your account and start managing your inventory.
        </p>
      </div>

      {/* Welcome Message */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Welcome to InventSmart AI!</strong> This guide will help you get started with your AI-powered inventory management system. 
          Each step builds upon the previous one, so follow them in order for the best experience.
        </AlertDescription>
      </Alert>

      {/* Getting Started Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Getting Started Steps</h2>
        <div className="space-y-6">
          {gettingStartedSteps.map((step) => (
            <Card key={step.step} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-sm">
                        Step {step.step}
                      </Badge>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base mt-1">{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Tutorials */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Feature Tutorials</h2>
        <p className="text-muted-foreground">
          Once you've completed the basic setup, explore these detailed tutorials to master each feature.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureTutorials.map((tutorial) => (
            <Card key={tutorial.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <tutorial.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">What you'll learn:</h4>
                  <div className="flex flex-wrap gap-2">
                    {tutorial.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={tutorial.href}>
                    Start Tutorial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Quick Actions</h2>
        <p className="text-muted-foreground">
          These quick actions will help you get the most out of your InventSmart AI setup.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{action.action}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips for Success */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tips for Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Keep product information up to date</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Set appropriate minimum stock levels</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Regularly review and update pricing</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm">Use AI queries to gain insights</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Mistakes to Avoid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <p className="text-sm">Don't skip the initial configuration</p>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <p className="text-sm">Avoid entering incorrect product data</p>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <p className="text-sm">Don't ignore low stock notifications</p>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <p className="text-sm">Remember to backup your data regularly</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Next Steps */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What's Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Explore Features</CardTitle>
              <CardDescription>Learn about all available features</CardDescription>
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
              <CardTitle>User Guides</CardTitle>
              <CardDescription>Detailed tutorials for each feature</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/guides">
                  Read Guides
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Get Help</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/troubleshooting">
                  Troubleshooting
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
