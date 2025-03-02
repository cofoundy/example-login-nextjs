import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Shield, Users, UserCheck, Settings, UserX } from "lucide-react";
import prisma from "@/libs/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";

// Type definition for activity with user information
type ActivityWithUser = {
  id: number;
  userId: number;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
    profileImage: string | null;
  };
};

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
  
  // Get inactive users count
  const inactiveUsers = await prisma.user.count({
    where: { isActive: false }
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
  
  // Get 5 most recent users
  const latestUsers = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      profileImage: true,
      createdAt: true,
      isVerified: true,
      isActive: true
    }
  });
  
  // Get 5 most recent activities
  let recentActivities: ActivityWithUser[] = [];
  try {
    // Check if we have access to the Activity model - using a safer approach
    const tableExists = await prisma.$queryRaw<Array<{exists: boolean}>>(
      Prisma.sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Activity'
      ) as exists;`
    );
    
    // If Activity model exists, fetch recent activities
    if (tableExists && tableExists[0] && tableExists[0].exists) {
      // Using a dynamically constructed query to avoid TypeScript errors with a new model
      type RawActivity = {
        id: number;
        userId: number;
        action: string;
        details: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        email: string;
        name: string | null;
        profileImage: string | null;
      };

      // Using a string to avoid TypeScript errors with the SQL template literal
      // @ts-expect-error - SQL string is valid but TypeScript doesn't like it in the template literal
      const activities = await prisma.$queryRaw<RawActivity[]>(
        Prisma.sql`
          SELECT a.*, u.email, u.name, u.profile_image as "profileImage" 
          FROM "Activity" a 
          INNER JOIN "User" u ON a."userId" = u.id 
          ORDER BY a."createdAt" DESC 
          LIMIT 5
        `
      );
      
      // Transform the raw SQL result to our expected type
      if (Array.isArray(activities)) {
        recentActivities = activities.map((act) => ({
          id: act.id,
          userId: act.userId,
          action: act.action,
          details: act.details,
          ipAddress: act.ipAddress,
          userAgent: act.userAgent,
          createdAt: act.createdAt,
          user: {
            email: act.email,
            name: act.name,
            profileImage: act.profileImage
          }
        }));
      }
    }
  } catch (error) {
    console.error("Error checking for Activity model:", error);
    // Activity model doesn't exist yet, we'll handle this with a placeholder
    recentActivities = [];
  }
  
  return {
    totalUsers,
    verifiedUsers,
    activeUsers,
    inactiveUsers,
    unverifiedUsers,
    recentUsers,
    latestUsers,
    recentActivities
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
              Inactive Users
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inactiveUsers} users are inactive
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
                {stats.latestUsers.length > 0 ? (
                  <div className="divide-y divide-border rounded-md border">
                    {stats.latestUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            {user.profileImage ? (
                              <AvatarImage src={user.profileImage} alt={user.name || user.username || user.email} />
                            ) : (
                              <AvatarFallback>
                                {(user.name?.[0] || user.email[0]).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {user.name || user.username || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <div className={`h-2 w-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-amber-500'}`} />
                            <span className="text-xs">
                              {user.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-sm text-muted-foreground">No recent registrations found</p>
                  </div>
                )}
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
              {stats.recentActivities.length > 0 ? (
                <div className="divide-y divide-border rounded-md border">
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {activity.user?.profileImage ? (
                            <AvatarImage src={activity.user.profileImage} alt={activity.user.name || activity.user.email} />
                          ) : (
                            <AvatarFallback>
                              {(activity.user?.name?.[0] || activity.user?.email[0]).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.user?.name || activity.user?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.action}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-sm font-medium leading-none mb-2">
                      Activity logging not yet implemented
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You need to create an Activity model to track user actions
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/settings">
                      Configure Activity Logging
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 