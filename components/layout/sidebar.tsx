"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  MessagesSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

// Export a trigger for mobile sidebar
export function SidebarMobileTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      aria-label="Open sidebar"
      onClick={onClick}
    >
      <Menu size={22} />
    </Button>
  );
}

export default function Sidebar({ mobile = false, open = false, onOpenChange }: { mobile?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void } = {}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // For mobile, always expanded
  const isCollapsed = mobile ? false : collapsed;

  const navItems: NavItem[] = [
    {
      href: "/",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    {
      href: "/inventory",
      icon: <Package size={20} />,
      label: "Inventory",
    },
    {
      href: "/sales",
      icon: <ShoppingCart size={20} />,
      label: "Sales",
    },
    {
      href: "/query",
      icon: <MessagesSquare size={20} />,
      label: "AI Query",
    },
    {
      href: "/reports",
      icon: <FileText size={20} />,
      label: "Reports",
    },
    {
      href: "/settings",
      icon: <Settings size={20} />,
      label: "Settings",
    },
  ];

  // Sidebar content
  const sidebarContent = (
    <div className={cn("flex flex-col h-full", isCollapsed ? "items-center" : "")}>  
      {/* Collapse button (desktop only, now at the top) */}
      {!mobile && (
        <div className="flex items-center justify-end border-b px-3 h-14 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      )}
      {/* Nav */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto">
        <nav className="space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center rounded-lg px-3 text-muted-foreground font-medium transition-colors hover:bg-accent hover:text-accent-foreground group",
                pathname === item.href && "bg-accent text-accent-foreground shadow",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              onClick={item.href === '/' ? (e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              } : undefined}
            >
              <span className="relative">
                {item.icon}
                {pathname === item.href && (
                  <span className="absolute -right-2 -top-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                )}
              </span>
              {!isCollapsed && <span className="ml-3 text-base">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      {/* Footer (always visible, never scrolls out) */}
      <div className={cn("py-3 px-2 text-xs text-muted-foreground w-full shrink-0", isCollapsed ? "text-center" : "")}>© {new Date().getFullYear()} InventSmart AI</div>
    </div>
  );

  // Desktop sidebar
  if (!mobile) {
    return (
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card max-h-[90vh] sticky top-14 z-20 transition-all duration-150 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    );
  }

  // Mobile sidebar (Sheet)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-64 max-w-full">
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );
}