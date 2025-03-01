import { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import { Shield, BarChart, Cog, UsersRound, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Define metadata for admin routes
export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard and management area"
};

// Admin navigation items
const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Shield,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: UsersRound,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Cog,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile menu - only visible on small screens */}
      <div className="md:hidden flex items-center h-14 border-b px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex h-14 items-center border-b px-4">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 font-semibold"
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin Panel</span>
                </Link>
              </div>
              <nav className="flex-1 overflow-auto py-4">
                <div className="px-4 space-y-1">
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex justify-center">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 font-semibold"
          >
            <Shield className="h-5 w-5" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* Admin sidebar - hidden on mobile */}
        <aside className="w-64 border-r bg-gray-50/50 hidden md:block">
          <div className="flex flex-col h-full">
            <div className="flex h-14 items-center border-b px-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 font-semibold"
              >
                <Shield className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            </div>
            <nav className="flex-1 overflow-auto py-4">
              <div className="px-4 space-y-1">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      {/* Toast provider for notifications */}
      <Toaster position="top-right" closeButton />
    </div>
  );
} 