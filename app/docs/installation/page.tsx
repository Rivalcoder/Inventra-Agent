import { 
  Terminal, 
  Package, 
  Database, 
  Key, 
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

export default function InstallationPage() {
  const requirements = [
    {
      name: "Node.js",
      version: "18.0.0 or higher",
      description: "JavaScript runtime environment",
      required: true
    },
    {
      name: "npm",
      version: "9.0.0 or higher",
      description: "Package manager for Node.js",
      required: true
    },
    {
      name: "MySQL",
      version: "8.0 or higher",
      description: "Database server for data storage",
      required: true
    },
    {
      name: "Google AI API Key",
      version: "Latest",
      description: "For AI-powered features and queries",
      required: true
    }
  ];

  const installationSteps = [
    {
      step: 1,
      title: "Clone the Repository",
      description: "Get the latest version of InventSmart AI",
      command: "git clone https://github.com/your-repo/inventory-ai.git",
      details: "Clone the repository to your local machine. Make sure you have Git installed."
    },
    {
      step: 2,
      title: "Install Dependencies",
      description: "Install all required packages",
      command: "npm install",
      details: "This will install all the necessary dependencies including React, Next.js, and other packages."
    },
    {
      step: 3,
      title: "Environment Configuration",
      description: "Set up your environment variables",
      command: "cp .env.example .env",
      details: "Copy the example environment file and configure it with your settings."
    },
    {
      step: 4,
      title: "Database Setup",
      description: "Configure your MySQL database",
      command: "npm run db:setup",
      details: "Set up the database schema and initial configuration."
    },
    {
      step: 5,
      title: "Start Development Server",
      description: "Launch the application",
      command: "npm run dev",
      details: "Start the development server and access the application at http://localhost:3000"
    }
  ];

  const environmentVariables = [
    {
      name: "DATABASE_URL",
      description: "MySQL database connection string",
      example: "mysql://username:password@localhost:3306/inventory_db",
      required: true
    },
    {
      name: "GOOGLE_AI_API_KEY",
      description: "Google AI API key for Gemini integration",
      example: "AIzaSyB...",
      required: true
    },
    {
      name: "NEXTAUTH_SECRET",
      description: "Secret key for NextAuth.js authentication",
      example: "your-secret-key-here",
      required: true
    },
    {
      name: "NEXTAUTH_URL",
      description: "Base URL for your application",
      example: "http://localhost:3000",
      required: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Installation Guide</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Follow this step-by-step guide to install and set up InventSmart AI on your system.
        </p>
      </div>

      {/* Requirements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">System Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.map((req) => (
            <Card key={req.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{req.name}</CardTitle>
                  <Badge variant={req.required ? "default" : "secondary"}>
                    {req.required ? "Required" : "Optional"}
                  </Badge>
                </div>
                <CardDescription>{req.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{req.version}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Installation Steps */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Installation Steps</h2>
        <div className="space-y-4">
          {installationSteps.map((step) => (
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
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Command</span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <code className="text-sm font-mono">{step.command}</code>
                </div>
                <p className="text-sm text-muted-foreground">{step.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Environment Configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Environment Configuration</h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Make sure to configure all required environment variables before starting the application.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="variables" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variables">Environment Variables</TabsTrigger>
            <TabsTrigger value="example">Example .env File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variables" className="space-y-4">
            {environmentVariables.map((env) => (
              <Card key={env.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono">{env.name}</CardTitle>
                    <Badge variant={env.required ? "default" : "secondary"}>
                      {env.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                  <CardDescription>{env.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded">
                    <code className="text-sm">{env.example}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="example">
            <Card>
              <CardHeader>
                <CardTitle>Example .env File</CardTitle>
                <CardDescription>
                  Copy this template and fill in your actual values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
{`# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/inventory_db

# Google AI Configuration
GOOGLE_AI_API_KEY=AIzaSyB...

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Database Setup */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Database Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>MySQL Setup</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Install MySQL 8.0 or higher</li>
                <li>Create a new database for the application</li>
                <li>Create a user with appropriate permissions</li>
                <li>Update the DATABASE_URL in your .env file</li>
              </ol>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/database/setup">
                  Database Setup Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>Google AI API</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Google AI Studio</li>
                <li>Create a new API key</li>
                <li>Copy the API key</li>
                <li>Add it to your .env file</li>
              </ol>
              <Button asChild variant="outline" size="sm">
                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                  Get API Key
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Verification */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Verification</h2>
        <Card>
          <CardHeader>
            <CardTitle>Verify Installation</CardTitle>
            <CardDescription>
              Run these commands to verify your installation is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Check Dependencies</span>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="text-sm">npm list --depth=0</code>
              </div>
              
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
                  <span className="text-sm font-medium">Start Development Server</span>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="text-sm">npm run dev</code>
              </div>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                If all commands run successfully, you should see the application running at http://localhost:3000
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
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set up your application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/configuration">
                  Configure Application
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
