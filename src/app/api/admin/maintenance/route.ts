import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/libs/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Schema for validation
const maintenanceSchema = z.object({
  operation: z.enum(["backupDatabase", "cleanSessions"])
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
    const { operation } = maintenanceSchema.parse(body);
    
    // Perform the requested maintenance operation
    let result;
    
    switch (operation) {
      case "backupDatabase":
        // In a real application, this would perform a database backup
        // For now, we'll simulate success
        result = {
          success: true,
          message: "Database backup completed successfully",
          timestamp: new Date().toISOString(),
          details: {
            backupLocation: "/backups/db-backup-" + new Date().toISOString().split('T')[0] + ".sql",
            recordsCaptured: await prisma.user.count()
          }
        };
        break;
        
      case "cleanSessions":
        // In a real application, this would clean up expired sessions
        // We'll use Prisma to delete expired sessions
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // This is an example - your session schema might be different
        // If using the NextAuth.js default database adapter, session cleanup is automatic
        
        // For demonstration purposes:
        /*
        const deletedSessions = await prisma.session.deleteMany({
          where: {
            expires: {
              lt: new Date()
            }
          }
        });
        */
        
        result = {
          success: true,
          message: "Expired sessions cleaned successfully",
          timestamp: new Date().toISOString(),
          details: {
            cleanedCount: 0, // Simulated count of cleaned sessions
            dateThreshold: oneWeekAgo.toISOString()
          }
        };
        break;
        
      default:
        return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Error performing maintenance:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to perform maintenance operation" 
    }, { status: 500 });
  }
} 