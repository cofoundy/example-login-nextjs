"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  
  const handleRefresh = () => {
    router.refresh();
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