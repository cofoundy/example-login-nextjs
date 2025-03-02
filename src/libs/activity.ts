import prisma from "@/libs/db";
import { Prisma } from "@prisma/client";

/**
 * Logs a user activity in the database
 */
export async function logUserActivity(
  userId: number,
  action: string,
  details?: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Use a raw query to insert activity in case the TypeScript types aren't updated yet
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "Activity" ("userId", "action", "details", "ipAddress", "userAgent", "createdAt") 
        VALUES (${userId}, ${action}, ${details || null}, ${ipAddress || null}, ${userAgent || null}, ${new Date()})
      `
    );
    return true;
  } catch (error) {
    console.error("Error logging user activity:", error);
    return false;
  }
}

/**
 * Get recent activities for a user
 */
export async function getUserActivities(userId: number, limit: number = 10) {
  try {
    // Use a raw query to fetch activities for a specific user
    const results = await prisma.$queryRaw(
      Prisma.sql`
        SELECT a.*, u.email, u.name, u.profile_image as "profileImage"
        FROM "Activity" a
        INNER JOIN "User" u ON a."userId" = u.id
        WHERE a."userId" = ${userId}
        ORDER BY a."createdAt" DESC
        LIMIT ${limit}
      `
    );
    
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return [];
  }
}

/**
 * Get recent activities for all users
 */
export async function getAllActivities(limit: number = 10) {
  try {
    // Use a raw query to fetch activities for all users
    const results = await prisma.$queryRaw(
      Prisma.sql`
        SELECT a.*, u.email, u.name, u.profile_image as "profileImage"
        FROM "Activity" a
        INNER JOIN "User" u ON a."userId" = u.id
        ORDER BY a."createdAt" DESC
        LIMIT ${limit}
      `
    );
    
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Error fetching all activities:", error);
    return [];
  }
} 