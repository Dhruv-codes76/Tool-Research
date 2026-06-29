import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";

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
  // ─── DEV BYPASS ──────────────────────────────────────────────────────────
  // Lets developers skip Supabase auth by hitting /api/dev-login?role=admin.
  // Completely inert in production.
  if (process.env.NODE_ENV !== "production") {
    const cookieStore = await cookies();
    const devBypass = cookieStore.get("x-dev-bypass")?.value;
    if (devBypass === "admin") {
      const id = "dev-admin-id";
      const email = "dev@admin.local";

      // Ensure the user exists in DB to satisfy foreign keys
      await prisma.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          email,
          name: "Dev Admin",
          role: "ADMIN",
          status: "ACTIVE",
          isPrimaryAdmin: true,
        }
      });

      // Return a mock object that satisfies the shape callers expect.
      return {
        id,
        email,
        name: "Dev Admin",
        role: "ADMIN" as const,
        status: "ACTIVE" as const,
        isPrimaryAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        acceptedAt: new Date(),
        invitedById: null,
      };
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser || dbUser.role !== "ADMIN") return null;

  // Lazy activation: a verified login by an INVITED admin completes acceptance.
  // A successful Supabase auth (OAuth, password, or invite link) proves they
  // control this email — the same attestation the invite link provides — so we
  // promote them to ACTIVE here. This is what lets an admin who signs in with
  // Google (instead of clicking the email link) actually reach the panel, and
  // unblocks the seeded primary admin whose invite couldn't be re-sent.
  if (dbUser.status === "INVITED") {
    return prisma.user.update({
      where: { id: dbUser.id },
      data: { status: "ACTIVE", acceptedAt: new Date() },
    });
  }

  // DELETED (soft-removed) or any other non-active status stays locked out.
  if (dbUser.status !== "ACTIVE") return null;

  return dbUser;
}

/**
 * Resolves the currently authenticated user (any role), or null.
 * Returns a minimal { id, email } object — enough for user-gated pages.
 *
 * In development, the x-dev-bypass=user cookie satisfies this check so
 * you can access user-protected routes without a real Supabase session.
 */
export async function getCurrentUser() {
  // ─── DEV BYPASS ──────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const cookieStore = await cookies();
    const devBypass = cookieStore.get("x-dev-bypass")?.value;
    if (devBypass === "admin" || devBypass === "user") {
      const id = devBypass === "admin" ? "dev-admin-id" : "dev-user-id";
      const email = devBypass === "admin" ? "dev@admin.local" : "dev@user.local";
      
      // Ensure the user exists in DB to satisfy foreign keys
      await prisma.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          email,
          name: `Dev ${devBypass === "admin" ? "Admin" : "User"}`,
          role: devBypass === "admin" ? "ADMIN" : "USER",
          status: "ACTIVE",
          isPrimaryAdmin: devBypass === "admin",
        }
      });

      return { id, email };
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, email: true },
  });

  return dbUser ?? null;
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
