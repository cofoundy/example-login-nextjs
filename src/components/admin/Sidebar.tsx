"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  BarChart,
  Settings,
  LogOut
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings
    }
  ];
  
  return (
    <aside className="min-h-screen w-64 border-r bg-muted/40">
      <div className="flex flex-col h-full">
        <div className="px-6 py-8">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="px-4 py-6 border-t">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </div>
    </aside>
  );
} 