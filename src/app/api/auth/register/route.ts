import { NextResponse } from "next/server"
import { prisma } from "@/libs/db"
import bcrypt from "bcrypt"
async function POST(req: Request) {
    const data = await req.json()
    console.log(data)   

    const userFound = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    })
    const usernameFound = await prisma.user.findUnique({
        where: {
            username: data.username
        }
    })

    if(userFound) {
        return NextResponse.json({message: "User already exists"}, {status: 400})
    }
    if(usernameFound) {
        return NextResponse.json({message: "Username already exists"}, {status: 400})
    }
    const newUser = await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: await bcrypt.hash(data.password, 10)
        }
    })
    return NextResponse.json(newUser)
}

export { POST }