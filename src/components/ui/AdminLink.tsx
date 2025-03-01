"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLink() {
  const { data: session } = useSession();
  
  // Only show the admin link if the user has the ADMIN role
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return null;
  }
  
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/admin" className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span>Admin Dashboard</span>
      </Link>
    </Button>
  );
} 