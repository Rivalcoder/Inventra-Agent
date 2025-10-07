"use client";

import { useState } from 'react';
import { 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search,
  ArrowRight,
  Copy,
  ExternalLink,
  RefreshCw,
  Database,
  Wifi,
  Settings,
  Bug
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function TroubleshootingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const commonIssues = [
    {
      title: "Application Won't Start",
      description: "The application fails to start or crashes on startup",
      severity: "high",
      solutions: [
        "Check if all environment variables are properly set",
        "Verify database connection settings",
        "Ensure all dependencies are installed (npm install)",
        "Check if the required ports are available",
        "Review the console logs for specific error messages"
      ],
      icon: XCircle,
      color: "text-red-500"
    },
    {
      title: "Database Connection Issues",
      description: "Unable to connect to the database or database errors occur",
      severity: "high",
      solutions: [
        "Verify DATABASE_URL in your .env file",
        "Check if MySQL server is running",
        "Confirm database credentials are correct",
        "Ensure database exists and user has proper permissions",
        "Test connection using the database test endpoint"
      ],
      icon: Database,
      color: "text-red-500"
    },
    {
      title: "AI Query Not Working",
      description: "AI queries fail or return errors",
      severity: "medium",
      solutions: [
        "Verify GOOGLE_AI_API_KEY is set correctly",
        "Check if the API key has proper permissions",
        "Ensure you have sufficient API quota",
        "Test the AI API connection",
        "Check network connectivity to Google AI services"
      ],
      icon: Bug,
      color: "text-orange-500"
    },
    {
      title: "Slow Performance",
      description: "Application is running slowly or taking too long to load",
      severity: "medium",
      solutions: [
        "Check database query performance",
        "Optimize database indexes",
        "Clear browser cache and cookies",
        "Check server resources (CPU, memory)",
        "Review network latency"
      ],
      icon: RefreshCw,
      color: "text-orange-500"
    },
    {
      title: "Login Issues",
      description: "Unable to log in or authentication problems",
      severity: "medium",
      solutions: [
        "Clear browser cache and cookies",
        "Check if user account exists",
        "Verify authentication settings",
        "Try logging in from an incognito window",
        "Check if the session has expired"
      ],
      icon: Settings,
      color: "text-orange-500"
    },
    {
      title: "Data Not Saving",
      description: "Changes are not being saved or data is lost",
      severity: "high",
      solutions: [
        "Check database write permissions",
        "Verify database connection is stable",
        "Check for validation errors",
        "Review browser console for JavaScript errors",
        "Ensure proper form submission"
      ],
      icon: Database,
      color: "text-red-500"
    }
  ];

  const errorCodes = [
    {
      code: "DB_CONNECTION_ERROR",
      description: "Database connection failed",
      cause: "Invalid database URL or server not running",
      solution: "Check DATABASE_URL and ensure MySQL is running"
    },
    {
      code: "AI_API_ERROR",
      description: "AI API request failed",
      cause: "Invalid API key or quota exceeded",
      solution: "Verify GOOGLE_AI_API_KEY and check API quota"
    },
    {
      code: "VALIDATION_ERROR",
      description: "Input validation failed",
      cause: "Invalid or missing required fields",
      solution: "Check form inputs and ensure all required fields are filled"
    },
    {
      code: "AUTH_ERROR",
      description: "Authentication failed",
      cause: "Invalid credentials or session expired",
      solution: "Check login credentials or refresh the session"
    },
    {
      code: "PERMISSION_ERROR",
      description: "Insufficient permissions",
      cause: "User doesn't have required permissions",
      solution: "Contact administrator for proper access rights"
    },
    {
      code: "RATE_LIMIT_ERROR",
      description: "Rate limit exceeded",
      cause: "Too many requests in a short time",
      solution: "Wait before making more requests or implement backoff"
    }
  ];

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "Currently, password reset functionality is not implemented. Contact your system administrator to reset your password or create a new account."
    },
    {
      question: "Can I use a different database?",
      answer: "Yes, InventSmart AI supports MySQL, PostgreSQL, and MongoDB. Check the database configuration documentation for setup instructions."
    },
    {
      question: "How do I backup my data?",
      answer: "Use the backup feature in Settings > Database > Backup. You can also export data in CSV format from the Reports section."
    },
    {
      question: "Why are my AI queries slow?",
      answer: "AI queries depend on Google's API response time and your data size. Large datasets may take longer to process. Consider optimizing your queries."
    },
    {
      question: "Can I customize the interface?",
      answer: "Yes, you can customize company information, logo, and theme in the Settings section. Advanced customization requires code modifications."
    },
    {
      question: "How do I add more users?",
      answer: "Currently, the system supports single-user access. Multi-user support is planned for future releases."
    },
    {
      question: "What browsers are supported?",
      answer: "InventSmart AI works on all modern browsers including Chrome, Firefox, Safari, and Edge. JavaScript must be enabled."
    },
    {
      question: "How do I update the application?",
      answer: "Pull the latest changes from the repository, run 'npm install' to update dependencies, and restart the application."
    }
  ];

  const diagnosticSteps = [
    {
      step: 1,
      title: "Check Environment Variables",
      description: "Verify all required environment variables are set",
      command: "npm run validate:env"
    },
    {
      step: 2,
      title: "Test Database Connection",
      description: "Ensure database is accessible and configured correctly",
      command: "npm run db:test"
    },
    {
      step: 3,
      title: "Test AI API Connection",
      description: "Verify Google AI API is working",
      command: "npm run test:ai"
    },
    {
      step: 4,
      title: "Check Application Logs",
      description: "Review console output for error messages",
      command: "npm run dev"
    },
    {
      step: 5,
      title: "Verify Dependencies",
      description: "Ensure all packages are installed correctly",
      command: "npm list --depth=0"
    }
  ];

  const filteredIssues = commonIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Troubleshooting</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Find solutions to common issues, error codes, and frequently asked questions. 
          Get your InventSmart AI system running smoothly.
        </p>
      </div>

      {/* Search */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for issues, errors, or questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </section>

      {/* Quick Diagnostics */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Quick Diagnostics</h2>
        <Card>
          <CardHeader>
            <CardTitle>System Health Check</CardTitle>
            <CardDescription>
              Run these diagnostic commands to identify common issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnosticSteps.map((step) => (
                <div key={step.step} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono">{step.command}</code>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Common Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Common Issues</h2>
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <Card key={issue.title}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <issue.icon className={`h-5 w-5 ${issue.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                      <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <CardDescription>{issue.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium">Solutions:</h4>
                  <ol className="space-y-2">
                    {issue.solutions.map((solution, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                          {index + 1}
                        </span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Error Codes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Error Codes</h2>
        <Card>
          <CardHeader>
            <CardTitle>Common Error Codes</CardTitle>
            <CardDescription>
              Reference guide for error codes and their solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Error Code</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">Common Cause</th>
                    <th className="text-left p-3 font-medium">Solution</th>
                  </tr>
                </thead>
                <tbody>
                  {errorCodes.map((error) => (
                    <tr key={error.code} className="border-b">
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono">
                          {error.code}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{error.description}</td>
                      <td className="p-3 text-sm text-muted-foreground">{error.cause}</td>
                      <td className="p-3 text-sm text-muted-foreground">{error.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Performance Issues */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Performance Optimization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Optimization</CardTitle>
              <CardDescription>Improve database performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Add database indexes for frequently queried fields</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Regularly clean up old data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Optimize database queries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Use connection pooling</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Application Optimization</CardTitle>
              <CardDescription>Improve application performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Enable browser caching</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Optimize images and assets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Use CDN for static assets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Implement lazy loading</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Help */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Check Documentation</CardTitle>
              <CardDescription>Browse our comprehensive documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs">
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Report an Issue</CardTitle>
              <CardDescription>Found a bug? Report it on GitHub</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="https://github.com/your-repo/inventory-ai/issues" target="_blank" rel="noopener noreferrer">
                  Report Issue
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
