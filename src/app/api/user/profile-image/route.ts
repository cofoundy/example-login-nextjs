import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
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
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("profileImage") as File | null;
    
    // Check if file exists
    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }
    
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create directory path
    const publicDir = join(process.cwd(), "public");
    const uploadsDir = join(publicDir, "uploads");
    
    // Ensure uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true });
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      console.error("File write error:", error);
      return NextResponse.json(
        { message: "Failed to save file" },
        { status: 500 }
      );
    }
    
    // Update user profile with image URL
    const imageUrl = `/uploads/${fileName}`;
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        profileImage: imageUrl,
      },
    });
    
    // Return success response
    return NextResponse.json({
      message: "Profile image updated successfully",
      profileImage: imageUrl,
    });
  } catch (error) {
    console.error("Profile image update error:", error);
    return NextResponse.json(
      { message: "Failed to update profile image" },
      { status: 500 }
    );
  }
} 