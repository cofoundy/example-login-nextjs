import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/db";
import { z } from "zod";

// Schema for profile update validation
const profileUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input data
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { username, name, email } = validationResult.data;
    
    // If email is being updated, check if it's already in use
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }
    }
    
    // If username is being updated, check if it's already in use
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      
      if (existingUser && existingUser.email !== session.user.email) {
        return NextResponse.json(
          { message: "Username already in use" },
          { status: 400 }
        );
      }
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(username && { username }),
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        profileImage: true,
        isVerified: true,
      }
    });
    
    // Return success response
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        profileImage: true,
        isVerified: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    // Return user profile
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { message: "Failed to get profile" },
      { status: 500 }
    );
  }
} 