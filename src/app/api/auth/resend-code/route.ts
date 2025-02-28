import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        isVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // If user is already verified, return an error
    if (user.isVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 400 }
      );
    }

    // Delete any existing verification codes for this user
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id },
    });

    // Generate a new verification code
    const verificationCode = generateVerificationCode(6);
    
    // Set expiration time to 30 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Save the new verification code
    await prisma.verificationCode.create({
      data: {
        code: verificationCode,
        userId: user.id,
        expiresAt,
      },
    });

    // Send the verification email
    const emailResult = await sendVerificationEmail({
      to: user.email,
      userName: user.username || undefined,
      verificationCode,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { message: "An error occurred while sending the verification code" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 