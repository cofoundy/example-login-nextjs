import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { generateVerificationCode, sendForgotPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
  console.log("==========================================");
  console.log("Forgot password API route called - start");
  
  try {
    const body = await req.json();
    const { email, checkUserExists } = body;
    
    console.log("Request body received:", JSON.stringify({ email, checkUserExists: !!checkUserExists }));

    if (!email) {
      console.log("Email missing from request");
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if the email exists
    console.log("Looking up user with email:", email);
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    console.log("User lookup result - user exists:", !!user);

    // If specifically checking if user exists (only used by our UI, not exposed externally)
    if (checkUserExists === true) {
      console.log("checkUserExists flag is true, returning userExists status");
      
      // Return the actual user existence status for proper flow control
      return NextResponse.json({ 
        success: true,
        userExists: !!user,
        message: user ? "User found" : "User not found"
      });
    }

    // If user doesn't exist, still return success (for security reasons)
    if (!user) {
      console.log("User not found, returning generic success message");
      return NextResponse.json({ 
        success: true, 
        message: "If an account with that email exists, we've sent a password reset code" 
      });
    }

    // Generate a 6-digit reset code
    const resetCode = generateVerificationCode(6);
    console.log("Generated reset code for user:", resetCode);
    
    // Set expiration time (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    // Delete any existing reset codes for this user
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id }
    });
    
    // Save the new reset code
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code: resetCode,
        expiresAt,
      }
    });
    
    // Send reset password email
    await sendForgotPasswordEmail({
      to: user.email,
      userName: user.username || undefined,
      resetCode,
    });
    
    console.log("Reset code sent successfully");
    return NextResponse.json({ 
      success: true, 
      message: "If an account with that email exists, we've sent a password reset code" 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" }, 
      { status: 500 }
    );
  } finally {
    console.log("Forgot password API route called - end");
    console.log("==========================================");
  }
} 