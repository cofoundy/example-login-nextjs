import { Metadata } from "next";
import { UserTable } from "@/components/admin/UserTable";
import { RefreshButton } from "@/components/admin/RefreshButton";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage user accounts and permissions",
};

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and activation status
          </p>
        </div>
        
        <RefreshButton />
      </div>
      
      <UserTable />
    </div>
  );
} 