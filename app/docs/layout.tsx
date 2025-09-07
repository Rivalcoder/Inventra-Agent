'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  ChevronRight, 
  Home, 
  Rocket, 
  Package, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Settings, 
  Code, 
  Users, 
  HelpCircle,
  FileText,
  Database,
  Zap,
  Shield,
  Globe,
  ChevronDown,
  ChevronUp,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const docsNavigation = [
  {
    title: 'Getting Started',
    icon: Rocket,
    href: '/docs',
    children: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Configuration', href: '/docs/configuration' },
      { title: 'First Steps', href: '/docs/first-steps' }
    ]
  },
  {
    title: 'Features',
    icon: Package,
    href: '/docs/features',
    children: [
      { title: 'Overview', href: '/docs/features' },
      { title: 'Inventory Management', href: '/docs/features/inventory' },
      { title: 'Sales Management', href: '/docs/features/sales' },
      { title: 'AI Query Console', href: '/docs/features/ai-query' },
      { title: 'Reports & Analytics', href: '/docs/features/reports' },
      { title: 'Dashboard', href: '/docs/features/dashboard' }
    ]
  },
  {
    title: 'User Guides',
    icon: Users,
    href: '/docs/guides',
    children: [
      { title: 'Overview', href: '/docs/guides' },
      { title: 'Adding Products', href: '/docs/guides/adding-products' },
      { title: 'Managing Sales', href: '/docs/guides/managing-sales' },
      { title: 'Using AI Queries', href: '/docs/guides/ai-queries' },
      { title: 'Generating Reports', href: '/docs/guides/reports' },
      { title: 'Settings & Configuration', href: '/docs/guides/settings' }
    ]
  },
  {
    title: 'API Reference',
    icon: Code,
    href: '/docs/api',
    children: [
      { title: 'Overview', href: '/docs/api' },
      { title: 'Authentication', href: '/docs/api/authentication' },
      { title: 'Products API', href: '/docs/api/products' },
      { title: 'Sales API', href: '/docs/api/sales' },
      { title: 'AI Query API', href: '/docs/api/ai-query' },
      { title: 'Database API', href: '/docs/api/database' }
    ]
  },
  {
    title: 'Database',
    icon: Database,
    href: '/docs/database',
    children: [
      { title: 'Overview', href: '/docs/database' },
      { title: 'Schema Design', href: '/docs/database/schema' },
      { title: 'Setup & Migration', href: '/docs/database/setup' },
      { title: 'Backup & Restore', href: '/docs/database/backup' },
      { title: 'Multi-Database Support', href: '/docs/database/multi-database' }
    ]
  },
  {
    title: 'Troubleshooting',
    icon: HelpCircle,
    href: '/docs/troubleshooting',
    children: [
      { title: 'Common Issues', href: '/docs/troubleshooting' },
      { title: 'Error Codes', href: '/docs/troubleshooting/errors' },
      { title: 'Performance Issues', href: '/docs/troubleshooting/performance' },
      { title: 'FAQ', href: '/docs/troubleshooting/faq' }
    ]
  },
  {
    title: 'Advanced',
    icon: Zap,
    href: '/docs/advanced',
    children: [
      { title: 'Customization', href: '/docs/advanced/customization' },
      { title: 'Integrations', href: '/docs/advanced/integrations' },
      { title: 'Security', href: '/docs/advanced/security' },
      { title: 'Deployment', href: '/docs/advanced/deployment' }
    ]
  }
];

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Getting Started']);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(section => section !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen(true)}
            >
              <ChevronRight className="h-5 w-5 shrink-0" />
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary shrink-0" />
              <span className="text-xl font-bold">InventSmart AI</span>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">Documentation</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Back to App</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex flex-col md:flex-row">
        {/* Sidebar */}
        {/* Desktop sidebar */}
        <aside className="hidden md:block md:w-64 md:border-r bg-muted/30 min-h-[calc(100vh-4rem)]">
          <ScrollArea className="h-full">
            <div className="p-4">
              <nav className="space-y-2">
                {docsNavigation.map((section) => {
                  const isExpanded = expandedSections.includes(section.title);
                  const hasActiveChild = section.children?.some(child => pathname === child.href);
                  
                  return (
                    <div key={section.title}>
                      <Button
                        variant={hasActiveChild ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto p-3 text-sm"
                        onClick={() => toggleSection(section.title)}
                      >
                        <section.icon className="mr-2 h-5 w-5 shrink-0" />
                        <span className="flex-1 text-left">{section.title}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        )}
                      </Button>
                      
                      {isExpanded && section.children && (
                        <div className="ml-6 mt-1 space-y-1">
                          {section.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                                pathname === child.href
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              <ChevronRight className="mr-2 h-3 w-3 shrink-0" />
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-72 max-w-[85%] h-full bg-background border-r">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-semibold">Docs</span>
                </div>
                <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setMobileOpen(false)}>
                  <ChevronLeft className="h-5 w-5 shrink-0" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100%-3rem)]">
                <div className="p-3">
                  <nav className="space-y-2">
                    {docsNavigation.map((section) => {
                      const isExpanded = expandedSections.includes(section.title);
                      const hasActiveChild = section.children?.some(child => pathname === child.href);
                      return (
                        <div key={section.title}>
                          <Button
                            variant={hasActiveChild ? "secondary" : "ghost"}
                            className="w-full justify-start h-auto p-3 text-sm"
                            onClick={() => toggleSection(section.title)}
                          >
                            <section.icon className="mr-2 h-5 w-5 shrink-0" />
                            <span className="flex-1 text-left">{section.title}</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                          </Button>
                          {isExpanded && section.children && (
                            <div className="ml-6 mt-1 space-y-1">
                              {section.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                                    pathname === child.href
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  <ChevronRight className="mr-2 h-3 w-3 shrink-0" />
                                  {child.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </div>
              </ScrollArea>
            </div>
            <button
              aria-label="Close overlay"
              className="flex-1 h-full bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
