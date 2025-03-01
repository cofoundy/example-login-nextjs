import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Settings and configuration for administrators"
};

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and defaults
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Registration</CardTitle>
            <CardDescription>
              Configure user registration settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-registration">Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable new user registrations
                  </p>
                </div>
                <Switch id="allow-registration" defaultChecked={true} disabled />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-verification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify email before accessing the platform
                  </p>
                </div>
                <Switch id="require-verification" defaultChecked={true} disabled />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {/* #TODO: Implement actual settings functionality */}
                  These settings are currently in demo mode and cannot be changed.
                </p>
                <Button disabled>
                  Save Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>
              Perform maintenance tasks and system operations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Database Operations</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled>
                  Backup Database
                </Button>
                <Button variant="outline" disabled>
                  Clean Expired Sessions
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {/* #TODO: Implement actual maintenance functionality */}
              Maintenance operations are currently in demo mode and cannot be performed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 