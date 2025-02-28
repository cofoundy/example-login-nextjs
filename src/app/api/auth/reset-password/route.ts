import { NextResponse } from 'next/server';
import prisma from "@/libs/db";
import bcrypt from 'bcrypt';
import { sendPasswordChangedEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, password } = body;

    if (!email || !code || !password) {
      return NextResponse.json(
        { message: "Email, code, and password are required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the verification code is valid
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: {
          gt: new Date(), // Code hasn't expired
        },
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { message: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        // Also ensure the user is verified
        isVerified: true
      },
    });

    // Delete all verification codes for this user (cleanup)
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id },
    });

    // Send password changed notification email
    await sendPasswordChangedEmail({
      to: email,
      userName: user.username || undefined,
    });

    return NextResponse.json({ 
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "An error occurred during password reset" },
      { status: 500 }
    );
  }
} 