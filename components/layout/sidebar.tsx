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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <aside
      className={cn(
        "border-r bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-end border-b px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </Button>
      </div>
      <nav className="space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-10 items-center rounded-md px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === item.href && "bg-accent text-accent-foreground",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            {item.icon}
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}