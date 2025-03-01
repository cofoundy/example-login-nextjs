import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Schema for validation
const settingsSchema = z.object({
  settingName: z.string(),
  value: z.boolean()
});

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const { settingName, value } = settingsSchema.parse(body);
    
    // In a real app, this would update a settings table in the database
    // For this POC, we'll simulate updating settings
    let updateMessage;
    
    switch (settingName) {
      case "allowRegistration":
        // Update the setting in the database or environment variable
        // For now we'll just return success
        updateMessage = `Registration ${value ? 'enabled' : 'disabled'}`;
        break;
        
      case "requireVerification":
        // Update the setting in the database or environment variable
        updateMessage = `Email verification requirement ${value ? 'enabled' : 'disabled'}`;
        break;
        
      default:
        return NextResponse.json({ error: "Unknown setting" }, { status: 400 });
    }
    
    // For a real implementation, you would store these settings in the database
    // await prisma.systemSettings.upsert({
    //   where: { name: settingName },
    //   update: { value: String(value) },
    //   create: { name: settingName, value: String(value) }
    // });
    
    return NextResponse.json({ 
      success: true,
      message: updateMessage
    });
    
  } catch (error) {
    console.error("Error updating settings:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to update setting" 
    }, { status: 500 });
  }
} 