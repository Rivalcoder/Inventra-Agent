import { 
  Settings, 
  Database, 
  Key, 
  Mail, 
  Globe, 
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ConfigurationPage() {
  const configurationSections = [
    {
      title: "Database Configuration",
      description: "Set up your MySQL database connection and schema",
      icon: Database,
      href: "/docs/configuration/database"
    },
    {
      title: "AI Integration",
      description: "Configure Google Gemini AI for intelligent features",
      icon: Key,
      href: "/docs/configuration/ai"
    },
    {
      title: "Email Settings",
      description: "Set up email notifications and SMTP configuration",
      icon: Mail,
      href: "/docs/configuration/email"
    },
    {
      title: "Security Settings",
      description: "Configure authentication and security options",
      icon: Shield,
      href: "/docs/configuration/security"
    }
  ];

  const environmentVariables = [
    {
      category: "Database",
      variables: [
        {
          name: "DATABASE_URL",
          description: "MySQL connection string",
          example: "mysql://username:password@localhost:3306/inventory_db",
          required: true
        },
        {
          name: "DB_HOST",
          description: "Database host address",
          example: "localhost",
          required: false
        },
        {
          name: "DB_PORT",
          description: "Database port number",
          example: "3306",
          required: false
        },
        {
          name: "DB_NAME",
          description: "Database name",
          example: "inventory_db",
          required: false
        },
        {
          name: "DB_USER",
          description: "Database username",
          example: "inventory_user",
          required: false
        },
        {
          name: "DB_PASSWORD",
          description: "Database password",
          example: "your_password",
          required: false
        }
      ]
    },
    {
      category: "AI & Authentication",
      variables: [
        {
          name: "GOOGLE_AI_API_KEY",
          description: "Google AI API key for Gemini integration",
          example: "AIzaSyB...",
          required: true
        },
        {
          name: "NEXTAUTH_SECRET",
          description: "Secret key for NextAuth.js",
          example: "your-secret-key-here",
          required: true
        },
        {
          name: "NEXTAUTH_URL",
          description: "Base URL for your application",
          example: "http://localhost:3000",
          required: true
        }
      ]
    },
    {
      category: "Email Configuration",
      variables: [
        {
          name: "EMAIL_SERVER_HOST",
          description: "SMTP server host",
          example: "smtp.gmail.com",
          required: false
        },
        {
          name: "EMAIL_SERVER_PORT",
          description: "SMTP server port",
          example: "587",
          required: false
        },
        {
          name: "EMAIL_SERVER_USER",
          description: "SMTP username",
          example: "your-email@gmail.com",
          required: false
        },
        {
          name: "EMAIL_SERVER_PASSWORD",
          description: "SMTP password or app password",
          example: "your-app-password",
          required: false
        },
        {
          name: "EMAIL_FROM",
          description: "From email address",
          example: "noreply@yourdomain.com",
          required: false
        }
      ]
    }
  ];

  const configurationSteps = [
    {
      step: 1,
      title: "Environment Variables",
      description: "Set up all required environment variables",
      details: "Create a .env file in your project root and add all necessary configuration variables."
    },
    {
      step: 2,
      title: "Database Setup",
      description: "Configure your MySQL database",
      details: "Create the database, set up the schema, and configure connection parameters."
    },
    {
      step: 3,
      title: "AI API Configuration",
      description: "Set up Google AI API integration",
      details: "Get your API key from Google AI Studio and configure it in your environment."
    },
    {
      step: 4,
      title: "Application Settings",
      description: "Configure application-specific settings",
      details: "Set up company information, currency, and other application preferences."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Configuration Guide</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete guide to configuring InventSmart AI for your specific needs and environment.
        </p>
      </div>

      {/* Configuration Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Configuration Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configurationSections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={section.href}>
                    Configure
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Configuration Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Configuration Steps</h2>
        <div className="space-y-4">
          {configurationSteps.map((step) => (
            <Card key={step.step}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {step.step}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Environment Variables */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Environment Variables</h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            All environment variables should be set in your .env file in the project root directory.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="database" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="ai-auth">AI & Auth</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          {environmentVariables.map((category) => (
            <TabsContent key={category.category.toLowerCase().replace(' ', '-')} value={category.category.toLowerCase().replace(' ', '-')} className="space-y-4">
              <h3 className="text-xl font-semibold">{category.category} Variables</h3>
              <div className="space-y-4">
                {category.variables.map((variable) => (
                  <Card key={variable.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-mono">{variable.name}</CardTitle>
                        <Badge variant={variable.required ? "default" : "secondary"}>
                          {variable.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <CardDescription>{variable.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Example Value</span>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <code className="text-sm">{variable.example}</code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Complete .env Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Complete .env Example</h2>
        <Card>
          <CardHeader>
            <CardTitle>Full Environment Configuration</CardTitle>
            <CardDescription>
              Copy this template and replace the values with your actual configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Complete .env file</span>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="text-sm overflow-x-auto">
{`# ============================================
# InventSmart AI Configuration
# ============================================

# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/inventory_db
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_db
DB_USER=inventory_user
DB_PASSWORD=your_secure_password

# Google AI Configuration
GOOGLE_AI_API_KEY=AIzaSyB...

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Application Settings
NODE_ENV=development
PORT=3000

# Security Settings
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# Optional: External Services
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Configuration Validation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Configuration Validation</h2>
        <Card>
          <CardHeader>
            <CardTitle>Test Your Configuration</CardTitle>
            <CardDescription>
              Use these commands to validate your configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Test Database Connection</span>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="text-sm">npm run db:test</code>
              </div>
              
              <div className="bg-muted p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Test AI API Connection</span>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="text-sm">npm run test:ai</code>
              </div>
              
              <div className="bg-muted p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Validate Environment</span>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="text-sm">npm run validate:env</code>
              </div>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All tests should pass before proceeding to the next step. Check the console output for any errors.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Next Steps */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>Set up your database schema and initial data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/database/setup">
                  Database Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>First Steps</CardTitle>
              <CardDescription>Learn how to use the application</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/first-steps">
                  Get Started
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
