import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/db";

export async function GET(req: NextRequest) {
  try {
    // Get current session to verify admin role
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Must be an admin to access this data." },
        { status: 403 }
      );
    }
    
    // Get query parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        profileImage: true,
        isVerified: true,
        role: true,
        isActive: true,
        activeUntil: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in the response
      }
    });
    
    // Get total user count for pagination
    const totalUsers = await prisma.user.count();
    
    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 