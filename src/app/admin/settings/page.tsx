"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Create a separate server action file for these functions
async function updateSystemSetting(settingName: string, value: boolean) {
  try {
    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settingName,
        value
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update setting');
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating setting:", error);
    throw error;
  }
}

async function performMaintenance(operation: string) {
  try {
    const response = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to perform maintenance');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error performing maintenance:", error);
    throw error;
  }
}

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    allowRegistration: true,
    requireVerification: true
  });
  const [loading, setLoading] = useState({
    allowRegistration: false,
    requireVerification: false,
    backupDb: false,
    cleanSessions: false
  });

  // Handle toggle for settings
  const handleToggleSetting = async (settingName: string) => {
    setLoading(prev => ({ ...prev, [settingName]: true }));
    
    try {
      // Get current value and toggle it
      const currentValue = settings[settingName as keyof typeof settings];
      const newValue = !currentValue;
      
      // Update in UI immediately for responsive feel
      setSettings(prev => ({ ...prev, [settingName]: newValue }));
      
      // Send to server
      await updateSystemSetting(settingName, newValue);
      
      toast.success(`Successfully updated ${settingName} setting.`);
    } catch (error) {
      // Revert UI change on error
      setSettings(prev => ({ ...prev, [settingName]: !prev[settingName as keyof typeof settings] }));
      
      const errorMessage = error instanceof Error ? error.message : "Failed to update setting";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, [settingName]: false }));
    }
  };

  // Handle maintenance operations
  const handleMaintenance = async (operation: string) => {
    const operationKey = operation === 'backupDatabase' ? 'backupDb' : 'cleanSessions';
    setLoading(prev => ({ ...prev, [operationKey]: true }));
    
    try {
      const result = await performMaintenance(operation);
      
      toast.success(result.message || `Successfully performed ${operation}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Operation failed";
      toast.error(`Operation failed: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, [operationKey]: false }));
      
      // Refresh the page to reflect any changes
      router.refresh();
    }
  };

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
                  <Label htmlFor="allowRegistration">Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable new user registrations
                  </p>
                </div>
                <div className="flex items-center">
                  {loading.allowRegistration && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Switch 
                    id="allowRegistration" 
                    checked={settings.allowRegistration}
                    onCheckedChange={() => handleToggleSetting('allowRegistration')}
                    disabled={loading.allowRegistration}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify email before accessing the platform
                  </p>
                </div>
                <div className="flex items-center">
                  {loading.requireVerification && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Switch 
                    id="requireVerification" 
                    checked={settings.requireVerification}
                    onCheckedChange={() => handleToggleSetting('requireVerification')}
                    disabled={loading.requireVerification}
                  />
                </div>
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
                <Button 
                  variant="outline" 
                  onClick={() => handleMaintenance('backupDatabase')}
                  disabled={loading.backupDb}
                >
                  {loading.backupDb ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Backing up...
                    </>
                  ) : (
                    "Backup Database"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleMaintenance('cleanSessions')}
                  disabled={loading.cleanSessions}
                >
                  {loading.cleanSessions ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    "Clean Expired Sessions"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 