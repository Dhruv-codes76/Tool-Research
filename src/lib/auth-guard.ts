import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  // Authentication temporarily disabled
  // Returning a mock admin user to bypass the guard
  return {
    id: "temp-admin-id",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN",
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
