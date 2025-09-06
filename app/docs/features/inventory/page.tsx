import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Download,
  Upload,
  Filter,
  ArrowRight,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InventoryFeaturePage() {
  const inventoryFeatures = [
    {
      title: "Product Management",
      description: "Add, edit, and manage your product catalog with detailed information",
      icon: Package,
      features: [
        "Product name and description",
        "Category classification",
        "Pricing information",
        "Stock level tracking",
        "Supplier details",
        "Product images and specifications"
      ]
    },
    {
      title: "Stock Tracking",
      description: "Real-time inventory monitoring with automated alerts",
      icon: TrendingUp,
      features: [
        "Current stock levels",
        "Minimum stock thresholds",
        "Low stock notifications",
        "Stock movement history",
        "Automatic stock updates",
        "Stock value calculations"
      ]
    },
    {
      title: "Search & Filter",
      description: "Powerful search and filtering capabilities for easy product management",
      icon: Search,
      features: [
        "Text-based search",
        "Category filtering",
        "Price range filtering",
        "Stock level filtering",
        "Supplier filtering",
        "Advanced search options"
      ]
    },
    {
      title: "Bulk Operations",
      description: "Efficient bulk import, export, and update operations",
      icon: Upload,
      features: [
        "CSV import/export",
        "Bulk product updates",
        "Mass category changes",
        "Bulk price updates",
        "Inventory adjustments",
        "Data validation"
      ]
    }
  ];

  const inventoryActions = [
    {
      title: "Add Product",
      description: "Create new products in your inventory",
      icon: Plus,
      steps: [
        "Click 'Add Product' button",
        "Fill in product details",
        "Set initial stock level",
        "Configure minimum stock alert",
        "Add supplier information",
        "Save the product"
      ]
    },
    {
      title: "Edit Product",
      description: "Update existing product information",
      icon: Edit,
      steps: [
        "Find the product in the list",
        "Click the edit button",
        "Modify product details",
        "Update stock levels if needed",
        "Save changes"
      ]
    },
    {
      title: "Delete Product",
      description: "Remove products from inventory",
      icon: Trash2,
      steps: [
        "Select the product to delete",
        "Click the delete button",
        "Confirm the deletion",
        "Product is removed from inventory"
      ]
    },
    {
      title: "View Product Details",
      description: "Access detailed product information",
      icon: Info,
      steps: [
        "Click on a product name",
        "View detailed information",
        "Check stock history",
        "Review sales data"
      ]
    }
  ];

  const inventoryFields = [
    {
      field: "Product Name",
      type: "Text",
      required: true,
      description: "Unique name for the product"
    },
    {
      field: "Description",
      type: "Text Area",
      required: false,
      description: "Detailed product description"
    },
    {
      field: "Category",
      type: "Select",
      required: true,
      description: "Product category for organization"
    },
    {
      field: "Price",
      type: "Number",
      required: true,
      description: "Unit price of the product"
    },
    {
      field: "Stock",
      type: "Number",
      required: true,
      description: "Current stock quantity"
    },
    {
      field: "Minimum Stock",
      type: "Number",
      required: true,
      description: "Minimum stock level for alerts"
    },
    {
      field: "Supplier",
      type: "Text",
      required: false,
      description: "Supplier or vendor name"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Inventory Management</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Complete product catalog management with real-time stock tracking, automated alerts, and comprehensive search capabilities.
        </p>
      </div>

      {/* Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The Inventory Management system is the core of InventSmart AI, providing comprehensive tools for managing your product catalog, 
          tracking stock levels, and ensuring you never run out of important items.
        </AlertDescription>
      </Alert>

      {/* Key Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inventoryFeatures.map((feature) => (
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
        <h2 className="text-2xl font-semibold">How to Use Inventory Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inventoryActions.map((action) => (
            <Card key={action.title}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {action.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Product Fields */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Product Information Fields</h2>
        <Card>
          <CardHeader>
            <CardTitle>Required and Optional Fields</CardTitle>
            <CardDescription>
              Understanding the product information fields and their requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Field Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-center p-3 font-medium">Required</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryFields.map((field) => (
                    <tr key={field.field} className="border-b">
                      <td className="p-3 font-medium">{field.field}</td>
                      <td className="p-3">
                        <Badge variant="outline">{field.type}</Badge>
                      </td>
                      <td className="text-center p-3">
                        {field.required ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">Optional</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stock Management */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Stock Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Low Stock Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Set minimum stock levels for each product to receive automatic alerts when inventory runs low.
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Configure minimum stock thresholds</li>
                <li>• Receive email notifications</li>
                <li>• View alerts on dashboard</li>
                <li>• Track stock movement history</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <CardTitle>Stock Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Monitor stock levels in real-time with automatic updates when sales are recorded.
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Real-time stock updates</li>
                <li>• Automatic stock reduction on sales</li>
                <li>• Stock value calculations</li>
                <li>• Inventory reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Advanced Features</h2>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search & Filter</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search and Filtering</CardTitle>
                <CardDescription>
                  Powerful search and filtering capabilities to quickly find products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Search Options</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Search by product name</li>
                      <li>• Search by description</li>
                      <li>• Search by supplier</li>
                      <li>• Search by category</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Filter Options</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Filter by category</li>
                      <li>• Filter by price range</li>
                      <li>• Filter by stock level</li>
                      <li>• Filter by supplier</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
                <CardDescription>
                  Efficiently manage large numbers of products with bulk operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Import/Export</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• CSV file import</li>
                      <li>• Excel file support</li>
                      <li>• Data validation</li>
                      <li>• Error reporting</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Bulk Updates</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Bulk price updates</li>
                      <li>• Category changes</li>
                      <li>• Stock adjustments</li>
                      <li>• Supplier updates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive reports about your inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Report Types</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Current inventory status</li>
                      <li>• Low stock reports</li>
                      <li>• Stock value reports</li>
                      <li>• Category-wise reports</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Export Options</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• PDF export</li>
                      <li>• CSV export</li>
                      <li>• Excel export</li>
                      <li>• Email reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Best Practices */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Do's</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Keep product information up to date</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Set appropriate minimum stock levels</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Use consistent naming conventions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Regularly review and update pricing</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Don'ts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="text-sm">Don't ignore low stock alerts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="text-sm">Don't enter duplicate products</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="text-sm">Don't skip product descriptions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="text-sm">Don't forget to update stock after sales</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Related Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Management</CardTitle>
              <CardDescription>Learn how inventory integrates with sales</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/docs/features/sales">
                  View Sales Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Generate inventory reports and analytics</CardDescription>
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
        </div>
      </section>
    </div>
  );
}
