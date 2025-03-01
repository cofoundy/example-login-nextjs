import { ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-background">
        {children}
      </main>
    </div>
  );
} 