import prisma from "@/libs/db"
import NextAuth from "next-auth"
import CredentialProviders from 'next-auth/providers/credentials'
import bcrypt from "bcrypt"

export const authOptions = {
    providers:[
        CredentialProviders({
            name: "credentials",
            credentials: {
                email: {label: "Email", type: "email", placeholder: "example@example.com"},
                password: {label: "Password", type: "password", placeholder: "********"}
            },
            async authorize(credentials){
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const userFound = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if(!userFound) return null;
                
                const matchPassword = await bcrypt.compare(credentials.password, userFound.password);
                if(!matchPassword) return null;
                
                return {
                    id: String(userFound.id),
                    email: userFound.email,
                    name: userFound.username
                }
            }
        })
    ],
    session: {
        strategy: "jwt" as const,
        
    },
    pages: {
        signIn: "/auth/login",
    }
}

const handler = NextAuth(authOptions)

export {handler as GET, handler as POST}