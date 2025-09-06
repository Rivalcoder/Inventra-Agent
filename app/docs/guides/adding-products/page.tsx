import { 
  Package, 
  Plus, 
  Edit, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Copy,
  Upload,
  Download,
  Clock,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AddingProductsGuide() {
  const steps = [
    {
      step: 1,
      title: "Navigate to Inventory",
      description: "Go to the Inventory section from the main navigation",
      details: "Click on 'Inventory' in the sidebar or use the main navigation menu to access the inventory management page.",
      image: "/docs/images/navigate-inventory.png"
    },
    {
      step: 2,
      title: "Click Add Product",
      description: "Click the 'Add Product' button to open the product form",
      details: "Look for the 'Add Product' button, usually located at the top right of the inventory list or as a prominent button on the page.",
      image: "/docs/images/add-product-button.png"
    },
    {
      step: 3,
      title: "Fill Product Information",
      description: "Enter all required product details",
      details: "Complete the product form with name, description, category, price, and other relevant information.",
      image: "/docs/images/product-form.png"
    },
    {
      step: 4,
      title: "Set Stock Levels",
      description: "Configure initial stock and minimum stock levels",
      details: "Set the current stock quantity and minimum stock level for low stock alerts.",
      image: "/docs/images/stock-levels.png"
    },
    {
      step: 5,
      title: "Add Supplier Information",
      description: "Enter supplier details if available",
      details: "Add supplier name and contact information for better inventory management.",
      image: "/docs/images/supplier-info.png"
    },
    {
      step: 6,
      title: "Save the Product",
      description: "Review and save your new product",
      details: "Double-check all information and click 'Save' to add the product to your inventory.",
      image: "/docs/images/save-product.png"
    }
  ];

  const productFields = [
    {
      field: "Product Name",
      required: true,
      description: "Unique name for the product",
      example: "Wireless Bluetooth Headphones",
      tips: "Use descriptive names that are easy to search and identify"
    },
    {
      field: "Description",
      required: false,
      description: "Detailed product description",
      example: "High-quality wireless headphones with noise cancellation",
      tips: "Include key features, specifications, and benefits"
    },
    {
      field: "Category",
      required: true,
      description: "Product category for organization",
      example: "Electronics > Audio",
      tips: "Choose or create categories that make sense for your business"
    },
    {
      field: "Price",
      required: true,
      description: "Unit price of the product",
      example: "99.99",
      tips: "Enter the selling price in your local currency"
    },
    {
      field: "Stock",
      required: true,
      description: "Current stock quantity",
      example: "50",
      tips: "Enter the actual quantity available in your inventory"
    },
    {
      field: "Minimum Stock",
      required: true,
      description: "Minimum stock level for alerts",
      example: "10",
      tips: "Set a level that gives you time to reorder before running out"
    },
    {
      field: "Supplier",
      required: false,
      description: "Supplier or vendor name",
      example: "TechSupply Inc.",
      tips: "Keep track of your suppliers for reordering"
    }
  ];

  const bestPractices = [
    {
      title: "Consistent Naming",
      description: "Use consistent naming conventions for easy searching and organization",
      tips: [
        "Use clear, descriptive names",
        "Avoid abbreviations unless necessary",
        "Include brand names when relevant",
        "Use consistent capitalization"
      ]
    },
    {
      title: "Proper Categorization",
      description: "Organize products into logical categories for better management",
      tips: [
        "Create hierarchical categories (e.g., Electronics > Audio > Headphones)",
        "Use categories that match your business structure",
        "Keep category names simple and clear",
        "Review and update categories regularly"
      ]
    },
    {
      title: "Accurate Stock Levels",
      description: "Maintain accurate stock levels for proper inventory management",
      tips: [
        "Update stock levels immediately after sales",
        "Set realistic minimum stock levels",
        "Conduct regular stock audits",
        "Use stock adjustments for corrections"
      ]
    },
    {
      title: "Complete Information",
      description: "Fill in all available product information for better management",
      tips: [
        "Include detailed descriptions",
        "Add supplier information",
        "Set appropriate pricing",
        "Include product specifications"
      ]
    }
  ];

  const commonMistakes = [
    {
      mistake: "Inconsistent Product Names",
      problem: "Makes searching and organization difficult",
      solution: "Establish and follow naming conventions"
    },
    {
      mistake: "Missing Categories",
      problem: "Products become hard to find and organize",
      solution: "Always assign products to appropriate categories"
    },
    {
      mistake: "Incorrect Stock Levels",
      problem: "Leads to overselling or missed sales opportunities",
      solution: "Regularly audit and update stock levels"
    },
    {
      mistake: "Incomplete Product Information",
      problem: "Makes it difficult to manage and sell products effectively",
      solution: "Fill in all available fields with accurate information"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Adding Products Guide</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Learn how to add products to your inventory system with this step-by-step guide. 
          Master the process of creating and managing your product catalog.
        </p>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            5 min read
          </Badge>
          <Badge variant="outline">Beginner</Badge>
        </div>
      </div>

      {/* Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This guide will walk you through the complete process of adding products to your inventory system. 
          Follow each step carefully to ensure your products are properly configured and ready for sales.
        </AlertDescription>
      </Alert>

      {/* Step-by-Step Guide */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Step-by-Step Guide</h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <Card key={step.step}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-semibold">
                    {step.step}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{step.details}</p>
                {step.image && (
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Screenshot: {step.title}</p>
                    <div className="mt-2 h-32 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">Image placeholder</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Product Fields Reference */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Product Fields Reference</h2>
        <Card>
          <CardHeader>
            <CardTitle>Understanding Product Fields</CardTitle>
            <CardDescription>
              Detailed explanation of each field in the product form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productFields.map((field) => (
                <div key={field.field} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{field.field}</h4>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Example: </span>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{field.example}</code>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Tip: </span>
                      <span className="text-sm text-muted-foreground">{field.tips}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Practices */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bestPractices.map((practice) => (
            <Card key={practice.title}>
              <CardHeader>
                <CardTitle className="text-lg">{practice.title}</CardTitle>
                <CardDescription>{practice.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {practice.tips.map((tip) => (
                    <li key={tip} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Common Mistakes to Avoid</h2>
        <Card>
          <CardHeader>
            <CardTitle>Learn from Common Errors</CardTitle>
            <CardDescription>
              Avoid these common mistakes when adding products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonMistakes.map((mistake) => (
                <div key={mistake.mistake} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-700">{mistake.mistake}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{mistake.problem}</p>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm text-green-700">{mistake.solution}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bulk Import */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Bulk Import Products</h2>
        <Card>
          <CardHeader>
            <CardTitle>Import Multiple Products at Once</CardTitle>
            <CardDescription>
              Save time by importing multiple products using CSV files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">CSV Format</h4>
                <div className="bg-muted p-3 rounded">
                  <pre className="text-sm">
{`Product Name,Description,Category,Price,Stock,Min Stock,Supplier
Wireless Headphones,High-quality audio,Electronics,99.99,50,10,TechSupply
Smart Watch,Fitness tracking,Electronics,199.99,25,5,TechSupply`}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Import Steps</h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">1</span>
                    <span>Prepare your CSV file with product data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">2</span>
                    <span>Go to Inventory > Import Products</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">3</span>
                    <span>Upload your CSV file</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">4</span>
                    <span>Review and confirm the import</span>
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Next Steps */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What's Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Managing Sales</CardTitle>
              <CardDescription>Learn how to record sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/guides/managing-sales">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Next: Managing Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Explore advanced inventory features</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/features/inventory">
                  <Package className="mr-2 h-4 w-4" />
                  View Inventory Features
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
