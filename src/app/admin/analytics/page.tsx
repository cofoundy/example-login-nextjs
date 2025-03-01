import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/libs/db";

export const metadata: Metadata = {
  title: "Admin Analytics",
  description: "Analytics dashboard for administrators"
};

async function getUserStats() {
  // Get total user count
  const totalUsers = await prisma.user.count();
  
  // Get verified users count
  const verifiedUsers = await prisma.user.count({
    where: { isVerified: true }
  });
  
  // Get users by role
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      id: true
    }
  });
  
  // Get users registered in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    }
  });
  
  return {
    totalUsers,
    verifiedUsers,
    usersByRole,
    recentUsers
  };
}

export default async function AnalyticsDashboard() {
  const { totalUsers, verifiedUsers, usersByRole, recentUsers } = await getUserStats();
  
  // Calculate verification rate
  const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          View user activity and platform metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
            <CardDescription>
              Current user statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Verified Users</p>
                <p className="text-3xl font-bold">{verifiedUsers}</p>
                <p className="text-sm text-muted-foreground">{verificationRate}% verified</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">New in Last 30 Days</p>
                <p className="text-3xl font-bold">{recentUsers}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">{verifiedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
              Distribution of users by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usersByRole.map((roleData) => (
                <div key={roleData.role} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{roleData.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full" 
                        style={{ width: `${(roleData._count.id / totalUsers) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium">{roleData._count.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              Recent user registration trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center justify-center border rounded">
              <p className="text-muted-foreground mb-2">Recent Registration Activity</p>
              <p className="text-xl font-bold">{recentUsers} new users in the last 30 days</p>
              <p className="text-sm text-muted-foreground mt-4">
                A more detailed chart with daily registrations will be added in a future update
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 