"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin, requirePrimaryAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";

const MANAGE_PATH = "/admin/manage-admins";

// Admin lifecycle status (project-wide soft-delete convention, like Tool):
//   INVITED → pending acceptance · ACTIVE → can sign in · DELETED → soft-removed
function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function inviteRedirectTo() {
  return `${siteUrl()}/auth/callback?next=/accept-invite`;
}

const emailSchema = z.string().trim().toLowerCase().email();
const nameSchema = z.string().trim().min(1, "Name is required.").max(80);

/**
 * List admins for the Manage Admins screen. ANY active admin may view (the page
 * is read-only for non-primary admins). Soft-deleted rows are hidden.
 * `viewerIsPrimary` lets the UI show management controls; the server enforces it.
 */
const ADMIN_SELECT = {
  id: true,
  name: true,
  email: true,
  status: true,
  isPrimaryAdmin: true,
  invitedAt: true,
  acceptedAt: true,
  invitedBy: { select: { name: true, email: true } },
} as const;

export async function getAdmins() {
  const me = await requireAdmin();

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: { not: "DELETED" } },
    orderBy: [{ isPrimaryAdmin: "desc" }, { status: "asc" }, { email: "asc" }],
    select: ADMIN_SELECT,
  });

  // Removed (soft-deleted) admins are restore-only and visible to the primary alone.
  const removed = me.isPrimaryAdmin
    ? await prisma.user.findMany({
        where: { role: "ADMIN", status: "DELETED" },
        orderBy: [{ email: "asc" }],
        select: ADMIN_SELECT,
      })
    : [];

  return { admins, removed, viewerId: me.id, viewerIsPrimary: me.isPrimaryAdmin };
}

/**
 * Invite a new admin by email. PRIMARY ADMIN ONLY.
 * Sends a Supabase invite (set-password) link and records a pending ADMIN row.
 */
export async function inviteAdmin(rawEmail: string) {
  const me = await requirePrimaryAdmin();

  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    throw new Error("Please enter a valid email address.");
  }
  const email = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.role === "ADMIN" && existing.status === "ACTIVE") {
    throw new Error("That person is already an active admin.");
  }

  // Best-effort Supabase invite. "already registered" is fine (re-invite / a
  // previously-removed account) — we still (re)create the pending ADMIN row.
  const { error } = await getSupabaseAdmin().auth.admin.inviteUserByEmail(email, {
    redirectTo: inviteRedirectTo(),
  });
  if (error && !/already.*registered/i.test(error.message)) {
    throw new Error(`Could not send invite: ${error.message}`);
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      status: "INVITED",
      invitedById: me.id,
      invitedAt: new Date(),
    },
    create: {
      email,
      name: email.split("@")[0],
      role: "ADMIN",
      status: "INVITED",
      invitedById: me.id,
      invitedAt: new Date(),
    },
  });

  await logAudit({
    action: "admin.invite",
    actor: me,
    targetType: "User",
    targetLabel: email,
  });

  revalidatePath(MANAGE_PATH);
  return { success: true };
}

/**
 * Re-send the invite link to a still-pending admin. PRIMARY ADMIN ONLY.
 */
export async function resendInvite(id: string) {
  const me = await requirePrimaryAdmin();

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target?.email || target.status !== "INVITED") {
    throw new Error("No pending invite found for that user.");
  }

  const { error } = await getSupabaseAdmin().auth.admin.inviteUserByEmail(target.email, {
    redirectTo: inviteRedirectTo(),
  });
  if (error && !/already.*registered/i.test(error.message)) {
    throw new Error(`Could not resend invite: ${error.message}`);
  }

  await prisma.user.update({ where: { id }, data: { invitedAt: new Date() } });
  await logAudit({
    action: "admin.invite.resend",
    actor: me,
    targetType: "User",
    targetId: id,
    targetLabel: target.email,
  });
  revalidatePath(MANAGE_PATH);
  return { success: true };
}

/**
 * Edit an admin's details. PRIMARY ADMIN ONLY.
 * Email is the unique identifier and is never editable; only the name changes.
 */
export async function editAdmin(id: string, rawName: string) {
  const me = await requirePrimaryAdmin();

  const parsed = nameSchema.safeParse(rawName);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid name.");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("User not found.");

  await prisma.user.update({ where: { id }, data: { name: parsed.data } });
  await logAudit({
    action: "admin.edit",
    actor: me,
    targetType: "User",
    targetId: id,
    targetLabel: target.email,
    metadata: { oldName: target.name, newName: parsed.data },
  });
  revalidatePath(MANAGE_PATH);
  return { success: true };
}

/**
 * Revoke a still-pending invite. PRIMARY ADMIN ONLY.
 * Soft-delete (status → DELETED) per the project-wide convention.
 */
export async function revokeInvite(id: string) {
  const me = await requirePrimaryAdmin();

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("User not found.");
  if (target.isPrimaryAdmin) throw new Error("The primary admin cannot be removed.");
  if (target.status !== "INVITED") {
    throw new Error("That invite is no longer pending. Use Remove instead.");
  }

  await prisma.user.update({ where: { id }, data: { status: "DELETED" } });
  await logAudit({
    action: "admin.invite.revoke",
    actor: me,
    targetType: "User",
    targetId: id,
    targetLabel: target.email,
  });
  revalidatePath(MANAGE_PATH);
  return { success: true };
}

/**
 * Remove an active admin. PRIMARY ADMIN ONLY.
 * Soft-delete (status → DELETED): the row is retained (Tool.userId FK + audit),
 * and access is revoked because requireAdmin() demands status ACTIVE.
 * The primary admin can never be removed, and you cannot remove yourself.
 */
export async function removeAdmin(id: string) {
  const me = await requirePrimaryAdmin();

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("User not found.");
  if (target.isPrimaryAdmin) throw new Error("The primary admin cannot be removed.");
  if (target.id === me.id) throw new Error("You cannot remove yourself.");

  await prisma.user.update({ where: { id }, data: { status: "DELETED" } });
  await logAudit({
    action: "admin.remove",
    actor: me,
    targetType: "User",
    targetId: id,
    targetLabel: target.email,
  });
  revalidatePath(MANAGE_PATH);
  return { success: true };
}

/**
 * Restore a soft-deleted admin. PRIMARY ADMIN ONLY.
 * Returns them to ACTIVE if they had already accepted (acceptedAt set), otherwise
 * back to INVITED (they never finished setting a password).
 */
export async function restoreAdmin(id: string) {
  const me = await requirePrimaryAdmin();

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("User not found.");
  if (target.status !== "DELETED") throw new Error("That admin is not removed.");

  const newStatus = target.acceptedAt ? "ACTIVE" : "INVITED";
  await prisma.user.update({
    where: { id },
    data: { status: newStatus },
  });
  await logAudit({
    action: "admin.restore",
    actor: me,
    targetType: "User",
    targetId: id,
    targetLabel: target.email,
    metadata: { restoredTo: newStatus },
  });
  revalidatePath(MANAGE_PATH);
  return { success: true };
}

/**
 * Called by the invitee after they set their password. Promotes their own
 * pending invite to ACTIVE. Requires a valid session whose email matches an
 * INVITED admin row — a revoked (DELETED) invite can NOT be re-accepted.
 */
export async function acceptInvite() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    throw new Error("You must open this page from your invite link.");
  }

  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    throw new Error("This account has not been invited as an admin.");
  }
  if (dbUser.status === "DELETED") {
    throw new Error("This invitation has been revoked. Please contact the primary admin.");
  }

  if (dbUser.status === "INVITED") {
    await prisma.user.update({
      where: { email: user.email },
      data: { status: "ACTIVE", acceptedAt: new Date() },
    });
    await logAudit({
      action: "admin.invite.accept",
      actor: { id: dbUser.id, email: dbUser.email, role: dbUser.role },
      targetType: "User",
      targetId: dbUser.id,
      targetLabel: dbUser.email,
    });
  }

  revalidatePath(MANAGE_PATH);
  return { success: true };
}
