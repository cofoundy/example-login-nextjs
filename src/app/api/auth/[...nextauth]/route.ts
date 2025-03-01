import prisma from "@/libs/db"
import NextAuth, { 
  DefaultSession, 
  Session, 
  AuthOptions
} from "next-auth"
import CredentialProviders from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from "bcrypt"
import { JWT } from "next-auth/jwt"

// Extend the Session type using declaration merging
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      isVerified?: boolean;
    } & DefaultSession["user"]
  }
  
  // Extend User type with isVerified property
  interface User {
    isVerified?: boolean;
  }
}

export const authOptions: AuthOptions = {
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
                
                const matchPassword = await bcrypt.compare(credentials.password, userFound.password as string);
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
            // For OAuth providers like Google
            if (account?.provider !== "credentials") {
                try {
                    // Check if user exists in database
                    const existingUser = await prisma.user.findUnique({
                        where: { 
                            email: user.email as string 
                        }
                    });
                    
                    // If user doesn't exist, create a new one
                    if (!existingUser && user.email) {
                        // Generate a username from email if not provided
                        const username = user.name?.replace(/\s+/g, '').toLowerCase() || 
                                        user.email.split('@')[0];
                        
                        // Create new user
                        const newUser = await prisma.user.create({
                            data: {
                                email: user.email,
                                username: username,
                                name: user.name || null,
                                profileImage: user.image || null,
                                isVerified: true // Auto-verify OAuth users
                            }
                        });
                        
                        // Create account record linking the provider
                        if (account) {
                            await prisma.account.create({
                                data: {
                                    userId: newUser.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token || null,
                                    refresh_token: account.refresh_token || null,
                                    expires_at: account.expires_at || null,
                                    token_type: account.token_type || null,
                                    scope: account.scope || null,
                                    id_token: account.id_token || null,
                                    session_state: account.session_state || null
                                }
                            });
                        }
                    } else if (existingUser && user.image) {
                        // If user exists but doesn't have a profile image, update with Google image
                        if (!existingUser.profileImage) {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: { profileImage: user.image }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error in OAuth sign in:", error);
                    // Still allow sign in even if account creation fails
                }
                
                return true;
            }
            
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
                
                // If session doesn't have an image but user has a profileImage in database, add it
                if (!session.user.image || session.user.image === "") {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: parseInt(token.sub as string) },
                        select: { profileImage: true }
                    });
                    
                    if (dbUser?.profileImage) {
                        session.user.image = dbUser.profileImage;
                    }
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