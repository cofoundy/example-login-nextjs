"use client";

import { RefreshButton } from "@/components/admin/RefreshButton";
import { UserTable } from "@/components/admin/UserTable";
import { useState } from "react";

export default function UserManagement() {
  // Use a simple counter state to trigger refreshes
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Function to manually trigger a refresh
  const handleRefresh = () => {
    // Increment the counter to trigger a new fetch
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and activation status
          </p>
        </div>
        
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      
      {/* Pass the counter as a prop to force re-rendering */}
      <UserTable key={`user-table-${refreshCounter}`} />
    </div>
  );
} 