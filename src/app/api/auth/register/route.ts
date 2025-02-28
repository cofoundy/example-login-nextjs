import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email"

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const data = await req.json()
        console.log(data)   

        // Check if email or username already exists
        const userFound = await prisma.user.findUnique({
            where: { email: data.email }
        })
        
        const usernameFound = await prisma.user.findUnique({
            where: { username: data.username }
        })

        if(userFound) {
            return NextResponse.json(
                { message: "User already exists" }, 
                { status: 400 }
            )
        }
        
        if(usernameFound) {
            return NextResponse.json(
                { message: "Username already exists" }, 
                { status: 400 }
            )
        }
        
        // Create the new user (unverified by default)
        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: await bcrypt.hash(data.password, 10),
                isVerified: false, // Set as unverified initially
            }
        })
        
        // For non-Google provider registration only (email/password)
        if (!data.provider || data.provider !== 'google') {
            // Generate verification code
            const verificationCode = generateVerificationCode(6);
            
            // Set expiration time (30 minutes from now)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30);
            
            // Save verification code
            await prisma.verificationCode.create({
                data: {
                    userId: newUser.id,
                    code: verificationCode,
                    expiresAt,
                }
            });
            
            // Send verification email
            await sendVerificationEmail({
                to: newUser.email,
                userName: newUser.username || undefined,
                verificationCode,
            });
            
            // Return user with isVerificationEmailSent flag
            return NextResponse.json({ 
                ...newUser, 
                password: undefined, 
                isVerificationEmailSent: true
            });
        }
        
        // For Google provider, auto-verify
        if (data.provider === 'google') {
            // Update user to be verified
            await prisma.user.update({
                where: { id: newUser.id },
                data: { isVerified: true }
            });
        }
        
        // Return the user (exclude password)
        return NextResponse.json({
            ...newUser,
            password: undefined
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An error occurred during registration" }, 
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}