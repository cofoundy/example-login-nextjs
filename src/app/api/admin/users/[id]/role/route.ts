import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/db";
import { z } from "zod";

// Schema for request validation
const roleSchema = z.object({
  role: z.enum(["USER", "ADMIN"])
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
    const validation = roleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid role. Role must be either USER or ADMIN." },
        { status: 400 }
      );
    }
    
    const { role } = validation.data;
    const userId = parseInt(params.id);
    
    // Ensure we don't demote the last admin
    if (role === "USER") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" }
      });
      
      const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      if (adminCount <= 1 && userToUpdate?.role === "ADMIN") {
        return NextResponse.json(
          { error: "Cannot demote the last admin user." },
          { status: 400 }
        );
      }
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    return NextResponse.json({
      message: `User role updated successfully to ${role}`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
} 