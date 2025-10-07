import { 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Code, 
  Zap,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Copy,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AIQueryFeaturePage() {
  const aiFeatures = [
    {
      title: "Natural Language Queries",
      description: "Ask questions in plain English and get intelligent responses",
      icon: MessageSquare,
      features: [
        "Ask questions in natural language",
        "Get instant business insights",
        "Understand complex data relationships",
        "Receive actionable recommendations"
      ]
    },
    {
      title: "Data Analysis",
      description: "AI-powered analysis of your business data with intelligent insights",
      icon: BarChart3,
      features: [
        "Automatic data pattern recognition",
        "Trend analysis and forecasting",
        "Performance metrics calculation",
        "Comparative analysis across periods"
      ]
    },
    {
      title: "SQL Generation",
      description: "Automatic SQL query generation for complex data operations",
      icon: Code,
      features: [
        "Natural language to SQL conversion",
        "Complex query optimization",
        "Data manipulation commands",
        "Custom report generation"
      ]
    },
    {
      title: "Predictive Insights",
      description: "AI-powered predictions and recommendations for business growth",
      icon: TrendingUp,
      features: [
        "Sales forecasting",
        "Inventory optimization",
        "Demand prediction",
        "Growth opportunity identification"
      ]
    }
  ];

  const exampleQueries = [
    {
      category: "Sales Analysis",
      queries: [
        "What are my top 5 selling products this month?",
        "Show me sales trends for the last 6 months",
        "Which products have the highest profit margins?",
        "Compare this month's sales to last month"
      ]
    },
    {
      category: "Inventory Management",
      queries: [
        "Which products are running low on stock?",
        "What's the total value of my current inventory?",
        "Show me products that haven't sold in 30 days",
        "Which categories have the most inventory?"
      ]
    },
    {
      category: "Business Insights",
      queries: [
        "What's my average order value?",
        "Which customers buy the most?",
        "What are my busiest sales days?",
        "How has my revenue grown over time?"
      ]
    },
    {
      category: "Predictive Analytics",
      queries: [
        "Predict next month's sales based on trends",
        "Which products should I restock soon?",
        "What's the optimal stock level for product X?",
        "Forecast inventory needs for the next quarter"
      ]
    }
  ];

  const aiCapabilities = [
    {
      title: "Data Understanding",
      description: "The AI understands your database schema and can interpret complex relationships between products, sales, and customers.",
      icon: Brain,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Context Awareness",
      description: "Maintains context across multiple queries and can reference previous questions and answers.",
      icon: Lightbulb,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Business Intelligence",
      description: "Provides business-focused insights and recommendations based on industry best practices.",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Real-time Processing",
      description: "Processes queries in real-time using the latest data from your database.",
      icon: Zap,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">AI Query Console</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Harness the power of Google Gemini AI to ask natural language questions about your business data and get intelligent insights.
        </p>
      </div>

      {/* Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The AI Query Console is powered by Google Gemini AI and can understand natural language questions about your inventory, sales, and business data. 
          Simply type your question and get instant, intelligent responses with actionable insights.
        </AlertDescription>
      </Alert>

      {/* Key Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiFeatures.map((feature) => (
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
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((capability) => (
                    <li key={capability} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Use */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">How to Use the AI Query Console</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Guide</CardTitle>
              <CardDescription>
                Follow these simple steps to get started with AI-powered queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Navigate to AI Query</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to the AI Query page from the main navigation menu
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Type Your Question</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter your question in natural language in the query input field
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Submit Query</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the "Ask AI" button or press Enter to submit your question
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Review Results</h4>
                    <p className="text-sm text-muted-foreground">
                      View the AI's response, which may include data, insights, and recommendations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Example Queries */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Example Queries</h2>
        <p className="text-muted-foreground">
          Here are some example questions you can ask the AI to get started:
        </p>
        
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="insights">Business Insights</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
          </TabsList>
          
          {exampleQueries.map((category) => (
            <TabsContent key={category.category.toLowerCase().replace(' ', '-')} value={category.category.toLowerCase().replace(' ', '-')} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{category.category} Queries</CardTitle>
                  <CardDescription>
                    Try these example queries to explore {category.category.toLowerCase()} features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.queries.map((query, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{query}</p>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* AI Capabilities */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">AI Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiCapabilities.map((capability) => (
            <Card key={capability.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${capability.color} rounded-lg flex items-center justify-center`}>
                    <capability.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{capability.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{capability.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Query Types */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Types of Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retrieval Queries</CardTitle>
              <CardDescription>Get specific information from your database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Examples:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• "Show me all products with low stock"</li>
                  <li>• "What are my sales for this month?"</li>
                  <li>• "List all customers who bought product X"</li>
                  <li>• "Show me the top 10 selling products"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytical Queries</CardTitle>
              <CardDescription>Get insights and analysis of your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Examples:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• "What's the trend in my sales?"</li>
                  <li>• "Which products have the best profit margins?"</li>
                  <li>• "How has my inventory value changed?"</li>
                  <li>• "What's my average order value?"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Comparative Queries</CardTitle>
              <CardDescription>Compare data across different periods or categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Examples:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• "Compare this month's sales to last month"</li>
                  <li>• "Which category performs better?"</li>
                  <li>• "Show me year-over-year growth"</li>
                  <li>• "Compare product performance"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Predictive Queries</CardTitle>
              <CardDescription>Get forecasts and predictions based on your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Examples:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• "Predict next month's sales"</li>
                  <li>• "When should I restock product X?"</li>
                  <li>• "What's the optimal stock level?"</li>
                  <li>• "Forecast inventory needs"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Effective Query Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Be specific about time periods (e.g., "this month", "last quarter")</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Use clear, natural language</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Ask follow-up questions for deeper insights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Use the query history to reference previous questions</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Things to Avoid</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">Don't use overly complex or technical language</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">Avoid asking multiple unrelated questions at once</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">Don't expect the AI to modify data (it's read-only)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">Avoid asking about data that doesn't exist in your system</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technical Details */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Technical Details</h2>
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the technology behind the AI Query Console
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">AI Technology</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Powered by Google Gemini AI</li>
                  <li>• Natural language processing</li>
                  <li>• Context-aware responses</li>
                  <li>• Real-time data analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Security</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Read-only access to your data</li>
                  <li>• No data storage by AI service</li>
                  <li>• Secure API connections</li>
                  <li>• Privacy-compliant processing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Related Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Generate detailed reports based on AI insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/features/reports">
                  View Reports
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>View AI insights on your main dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/features/dashboard">
                  View Dashboard
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
