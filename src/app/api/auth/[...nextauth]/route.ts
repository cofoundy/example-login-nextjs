import prisma from "@/libs/db"
import NextAuth, { DefaultSession, Session } from "next-auth"
import CredentialProviders from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from "bcrypt"
import { JWT } from "next-auth/jwt"
import { Account } from "next-auth"

// Extend the Session type using declaration merging
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      isVerified?: boolean;
    } & DefaultSession["user"]
  }
}

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
                    name: userFound.username,
                    isVerified: userFound.isVerified
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async signIn({ user, account }) {
            // Allow OAuth without email verification
            if (account?.provider !== "credentials") return true;
            
            // For credentials provider, check if user is verified
            const userRecord = await prisma.user.findUnique({
                where: { 
                    id: parseInt(user.id as string)
                },
                select: {
                    isVerified: true
                }
            });
            
            // If user is not verified, redirect to verification page
            if (!userRecord?.isVerified) {
                throw new Error("UNVERIFIED_USER");
            }
            
            return true;
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            if (session.user) {
                session.user.id = token.sub;
                
                // Add isVerified to session
                if (token.isVerified !== undefined) {
                    session.user.isVerified = token.isVerified as boolean;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.isVerified = user.isVerified;
            }
            return token;
        }
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login"
    }
}

const handler = NextAuth(authOptions)

export {handler as GET, handler as POST}