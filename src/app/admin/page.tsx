import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Shield, Users, UserCheck, AlertTriangle, Settings } from "lucide-react";
import prisma from "@/libs/db";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrator dashboard and user management"
};

async function getDashboardStats() {
  // Get total users count
  const totalUsers = await prisma.user.count();
  
  // Get verified users count
  const verifiedUsers = await prisma.user.count({
    where: { isVerified: true }
  });
  
  // Get active users count
  const activeUsers = await prisma.user.count({
    where: { isActive: true }
  });
  
  // Get unverified users count
  const unverifiedUsers = await prisma.user.count({
    where: { isVerified: false }
  });
  
  // Get users registered in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  });
  
  return {
    totalUsers,
    verifiedUsers,
    activeUsers,
    unverifiedUsers,
    recentUsers
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/admin/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentUsers} new users in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedUsers > 0 
                ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) 
                : 0}% of users verified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers > 0 
                ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
                : 0}% of users active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verification
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unverifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unverifiedUsers} users awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Registrations</CardTitle>
              <CardDescription>
                The most recently registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="border rounded-md">
                  <div className="flex items-center p-4">
                    <div className="flex flex-col gap-1 text-center">
                      <p className="text-sm font-medium leading-none">
                        Recent user list will display here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Integration with UserTable component will show recent registrations
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/admin/users">View All Users</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent user logins and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground">
                  Activity log will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 