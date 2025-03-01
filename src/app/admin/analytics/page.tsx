import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Analytics",
  description: "Analytics dashboard for administrators"
};

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          View user activity and platform metrics
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* #TODO: Implement actual analytics chart */}
            <div className="h-80 flex items-center justify-center border rounded">
              <p className="text-muted-foreground">User growth chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Metrics</CardTitle>
            <CardDescription>
              User engagement and activity statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* #TODO: Implement actual analytics data */}
            <div className="h-80 flex items-center justify-center border rounded">
              <p className="text-muted-foreground">Activity metrics will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 