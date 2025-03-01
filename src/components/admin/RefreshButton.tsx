"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface RefreshButtonProps {
  onRefresh?: () => void;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const router = useRouter();
  
  const handleRefresh = () => {
    // Always refresh the router
    router.refresh();
    
    // If an onRefresh callback is provided, call it
    if (onRefresh) {
      onRefresh();
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleRefresh}
      className="flex items-center gap-2"
    >
      <RefreshCcw className="h-4 w-4" />
      Refresh
    </Button>
  );
} 