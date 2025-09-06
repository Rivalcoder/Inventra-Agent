import { 
  Code, 
  Database, 
  Key, 
  Brain, 
  Package, 
  TrendingUp,
  ArrowRight,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Globe,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function APIPage() {
  const apiEndpoints = [
    {
      title: "Products API",
      description: "Manage your product catalog with full CRUD operations",
      icon: Package,
      href: "/docs/api/products",
      methods: ["GET", "POST", "PUT", "DELETE"],
      endpoints: [
        "GET /api/products - List all products",
        "POST /api/products - Create new product",
        "GET /api/products/[id] - Get product by ID",
        "PUT /api/products/[id] - Update product",
        "DELETE /api/products/[id] - Delete product"
      ]
    },
    {
      title: "Sales API",
      description: "Handle sales transactions and revenue tracking",
      icon: TrendingUp,
      href: "/docs/api/sales",
      methods: ["GET", "POST", "PUT", "DELETE"],
      endpoints: [
        "GET /api/sales - List all sales",
        "POST /api/sales - Create new sale",
        "GET /api/sales/[id] - Get sale by ID",
        "PUT /api/sales/[id] - Update sale",
        "DELETE /api/sales/[id] - Delete sale"
      ]
    },
    {
      title: "AI Query API",
      description: "Natural language queries powered by Google Gemini AI",
      icon: Brain,
      href: "/docs/api/ai-query",
      methods: ["POST"],
      endpoints: [
        "POST /api/ai/query - Process natural language query",
        "POST /api/ai/analyze - Analyze data with AI",
        "GET /api/ai/history - Get query history"
      ]
    },
    {
      title: "Database API",
      description: "Database operations and configuration management",
      icon: Database,
      href: "/docs/api/database",
      methods: ["GET", "POST", "PUT"],
      endpoints: [
        "GET /api/db/status - Check database status",
        "POST /api/db/backup - Create database backup",
        "POST /api/db/restore - Restore database",
        "GET /api/db/test-connection - Test database connection"
      ]
    }
  ];

  const authenticationMethods = [
    {
      title: "API Key Authentication",
      description: "Use API keys for secure access to endpoints",
      icon: Key,
      features: [
        "Generate API keys in settings",
        "Include key in request headers",
        "Rate limiting per key",
        "Key expiration management"
      ]
    },
    {
      title: "Session Authentication",
      description: "Use session-based authentication for web requests",
      icon: Shield,
      features: [
        "Login via /api/auth/signin",
        "Session cookies for web requests",
        "Automatic session management",
        "Secure session storage"
      ]
    }
  ];

  const responseFormats = [
    {
      title: "Success Response",
      description: "Standard format for successful API responses",
      example: `{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product Name",
    "price": 29.99
  },
  "message": "Operation completed successfully"
}`
    },
    {
      title: "Error Response",
      description: "Standard format for error responses",
      example: `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "price",
      "issue": "Price must be greater than 0"
    }
  }
}`
    }
  ];

  const statusCodes = [
    { code: 200, description: "OK - Request successful" },
    { code: 201, description: "Created - Resource created successfully" },
    { code: 400, description: "Bad Request - Invalid request data" },
    { code: 401, description: "Unauthorized - Authentication required" },
    { code: 403, description: "Forbidden - Access denied" },
    { code: 404, description: "Not Found - Resource not found" },
    { code: 422, description: "Unprocessable Entity - Validation error" },
    { code: 500, description: "Internal Server Error - Server error" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Code className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">API Reference</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete API documentation for InventSmart AI. Build integrations, automate workflows, and extend functionality using our RESTful API.
        </p>
      </div>

      {/* Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The InventSmart AI API is a RESTful API that provides programmatic access to all features of the application. 
          All endpoints return JSON responses and support standard HTTP methods.
        </AlertDescription>
      </Alert>

      {/* Base URL */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Base URL</h2>
        <Card>
          <CardHeader>
            <CardTitle>API Endpoint</CardTitle>
            <CardDescription>
              All API requests should be made to this base URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono">https://your-domain.com/api</code>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API Endpoints */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">API Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiEndpoints.map((endpoint) => (
            <Card key={endpoint.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <endpoint.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">HTTP Methods</h4>
                  <div className="flex flex-wrap gap-2">
                    {endpoint.methods.map((method) => (
                      <Badge 
                        key={method} 
                        variant={method === 'GET' ? 'default' : method === 'POST' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Endpoints</h4>
                  <ul className="space-y-1">
                    {endpoint.endpoints.map((ep, index) => (
                      <li key={index} className="text-sm text-muted-foreground font-mono">
                        {ep}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={endpoint.href}>
                    View Documentation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Authentication */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Authentication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authenticationMethods.map((method) => (
            <Card key={method.title}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <method.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {method.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Response Formats */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Response Formats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {responseFormats.map((format) => (
            <Card key={format.title}>
              <CardHeader>
                <CardTitle className="text-lg">{format.title}</CardTitle>
                <CardDescription>{format.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Example Response</span>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{format.example}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Status Codes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">HTTP Status Codes</h2>
        <Card>
          <CardHeader>
            <CardTitle>Common Status Codes</CardTitle>
            <CardDescription>
              Standard HTTP status codes returned by the API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {statusCodes.map((status) => (
                    <tr key={status.code} className="border-b">
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono">
                          {status.code}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{status.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rate Limiting */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Rate Limiting</h2>
        <Card>
          <CardHeader>
            <CardTitle>API Rate Limits</CardTitle>
            <CardDescription>
              Understanding rate limits and how to handle them
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Rate Limits</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 1000 requests per hour per API key</li>
                  <li>• 100 requests per minute per IP</li>
                  <li>• Burst limit: 50 requests per 10 seconds</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Rate Limit Headers</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• X-RateLimit-Limit: Request limit</li>
                  <li>• X-RateLimit-Remaining: Remaining requests</li>
                  <li>• X-RateLimit-Reset: Reset timestamp</li>
                </ul>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                When rate limits are exceeded, the API returns a 429 status code. 
                Implement exponential backoff to handle rate limiting gracefully.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* SDKs and Libraries */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">SDKs and Libraries</h2>
        <Card>
          <CardHeader>
            <CardTitle>Official SDKs</CardTitle>
            <CardDescription>
              Use our official SDKs for easier integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-1">JavaScript/TypeScript</h4>
                <p className="text-sm text-muted-foreground mb-3">npm install @inventsmart/ai-sdk</p>
                <Button variant="outline" size="sm">
                  <Globe className="mr-2 h-4 w-4" />
                  View Docs
                </Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-1">Python</h4>
                <p className="text-sm text-muted-foreground mb-3">pip install inventsmart-ai</p>
                <Button variant="outline" size="sm">
                  <Globe className="mr-2 h-4 w-4" />
                  View Docs
                </Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium mb-1">PHP</h4>
                <p className="text-sm text-muted-foreground mb-3">composer require inventsmart/ai-sdk</p>
                <Button variant="outline" size="sm">
                  <Globe className="mr-2 h-4 w-4" />
                  View Docs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Getting Started */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Setup</CardTitle>
              <CardDescription>Learn how to authenticate with the API</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/api/authentication">
                  Authentication Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get up and running with your first API call</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/api/quick-start">
                  Quick Start Guide
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
