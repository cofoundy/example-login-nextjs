import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/db";
import { z } from "zod";

// Schema for request validation
const activationSchema = z.object({
  isActive: z.boolean(),
  activeUntil: z.string().datetime().nullable().optional()
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current session to verify admin role
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Must be an admin to perform this action." },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validation = activationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 }
      );
    }
    
    const { isActive, activeUntil } = validation.data;
    const userId = parseInt(params.id);
    
    // Update user activation status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        isActive,
        // If activating with an expiration date, set the activeUntil field
        // If deactivating, set activeUntil to null
        activeUntil: isActive ? activeUntil : null
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        activeUntil: true
      }
    });
    
    // #TODO: Send notification email to user about account status change
    
    return NextResponse.json({
      message: `User account is now ${isActive ? 'active' : 'inactive'}`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user activation status:", error);
    return NextResponse.json(
      { error: "Failed to update user activation status" },
      { status: 500 }
    );
  }
} 