import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administration dashboard for user management",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Administrator";
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userName}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* #TODO: Fetch actual user count from database */}
              245
            </div>
            <p className="text-xs text-muted-foreground">
              Registered users on the platform
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* #TODO: Fetch actual active user count from database */}
              182
            </div>
            <p className="text-xs text-muted-foreground">
              Users with active accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* #TODO: Fetch actual admin count from database */}
              3
            </div>
            <p className="text-xs text-muted-foreground">
              Users with administrator privileges
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              User activity and trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* #TODO: Implement actual analytics visualization */}
            <div className="h-80 flex items-center justify-center border rounded">
              <p className="text-muted-foreground">Analytics charts will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 