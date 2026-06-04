import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase-server";

/**
 * Resolves the currently authenticated admin, or null.
 *
 * Identity comes from Supabase (`getUser()` *verifies* the JWT against the auth
 * server — never use `getSession()` here, which only decodes the cookie).
 * Authorization comes from our own DB: a user is only an admin if their Prisma
 * row has role ADMIN and status ACTIVE. We never create or elevate users here.
 *
 * Use in Server Components / layouts (returns null so the caller can redirect).
 */
export async function getCurrentAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.status !== "ACTIVE") {
    return null;
  }

  return dbUser;
}

/**
 * Throws "Forbidden" unless the caller is an active admin.
 * Use in Server Actions, where throwing is the right failure mode.
 */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Forbidden: admin access required.");
  }
  return admin;
}

/**
 * Throws unless the caller is the (single) primary admin.
 * Gate destructive admin-management actions (remove/revoke) with this.
 */
export async function requirePrimaryAdmin() {
  const admin = await requireAdmin();
  if (!admin.isPrimaryAdmin) {
    throw new Error("Forbidden: primary admin access required.");
  }
  return admin;
}
