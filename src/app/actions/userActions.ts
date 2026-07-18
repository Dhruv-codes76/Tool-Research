"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-guard";

/* ------------------------------------------------------------------ *
 * Wishlist (saved tools) — login-required, DB-backed.
 * ------------------------------------------------------------------ */

/** IDs of the tools the current user has saved (empty when logged out). */
export async function getSavedToolIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.savedTool.findMany({
    where: { userId: user.id },
    select: { toolId: true },
  });
  return rows.map((r) => r.toolId);
}

/**
 * Toggle a tool in the current user's wishlist. Returns the new saved state,
 * or `{ requiresAuth: true }` so the client can bounce to /login.
 */
export async function toggleSavedTool(
  toolId: string,
): Promise<{ saved: boolean } | { requiresAuth: true }> {
  const user = await getCurrentUser();
  if (!user) return { requiresAuth: true };

  const existing = await prisma.savedTool.findUnique({
    where: { userId_toolId: { userId: user.id, toolId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.savedTool.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard");
    return { saved: false };
  }

  // create() throws on a bad toolId (FK) — surfaced as a normal error.
  await prisma.savedTool.create({ data: { userId: user.id, toolId } });
  revalidatePath("/dashboard");
  return { saved: true };
}

/** The current user's saved tools (ACTIVE only), newest-saved first. */
export async function getSavedTools() {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.savedTool.findMany({
    where: { userId: user.id, tool: { status: "ACTIVE" } },
    orderBy: { createdAt: "desc" },
    include: { tool: { include: { platforms: true, toolTypes: true } } },
  });
  return rows.map((r) => r.tool);
}

/* ------------------------------------------------------------------ *
 * My submissions — status + "edited by our team" field-level diff.
 * ------------------------------------------------------------------ */

export type SubmissionEdit = "name" | "description" | "categories" | "image";

/**
 * Diff what the submitter originally provided (submissionSnapshot) against the
 * now-published tool, so the dashboard can show exactly what the team changed.
 */
function computeEdits(tool: {
  name: string;
  description: string;
  heroImageUrl: string | null;
  submissionSnapshot: string | null;
  toolTypes: { name: string }[];
}): SubmissionEdit[] {
  if (!tool.submissionSnapshot) return [];
  let snap: {
    name?: string;
    description?: string;
    heroImageUrl?: string;
    toolTypes?: string[];
  };
  try {
    snap = JSON.parse(tool.submissionSnapshot);
  } catch {
    return [];
  }

  const edits: SubmissionEdit[] = [];
  if ((snap.name ?? "") !== (tool.name ?? "")) edits.push("name");
  if ((snap.description ?? "") !== (tool.description ?? "")) edits.push("description");
  if ((snap.heroImageUrl ?? "") !== (tool.heroImageUrl ?? "")) edits.push("image");
  const before = [...(snap.toolTypes ?? [])].sort().join("|");
  const after = tool.toolTypes.map((t) => t.name).sort().join("|");
  if (before !== after) edits.push("categories");
  return edits;
}

/**
 * Self-service edit of the current user's OWN submission — only while it is still
 * PENDING (i.e. before an admin accepts/rejects it). Restricted to the fields the
 * submitter controls (description, images, categories); the name/stats come from
 * GitHub and the admin finalises slug/SEO. Ownership + status are enforced here,
 * never trusted from the client. The submissionSnapshot is refreshed so the
 * dashboard "edited by our team" diff still reflects what the user last submitted.
 */
export type MySubmissionEdit = {
  description?: string;
  heroImageUrl?: string;
  galleryImages?: string; // JSON string of string[]
  galleryLayout?: string;
  toolTypes?: string[];
  platforms?: string[];
};

export async function updateMySubmission(toolId: string, data: MySubmissionEdit) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in to edit a submission.");

  const tool = await prisma.tool.findUnique({
    where: { id: toolId },
    select: { userId: true, status: true, submissionSnapshot: true, name: true },
  });
  if (!tool) throw new Error("Submission not found.");
  if (tool.userId !== user.id) throw new Error("You can only edit your own submissions.");
  if (tool.status !== "PENDING") {
    throw new Error("This submission has already been reviewed and can no longer be edited.");
  }

  const platforms = data.platforms ?? [];
  const toolTypes = data.toolTypes ?? [];

  // Refresh the snapshot with the values the submitter now provides.
  let snap: Record<string, unknown> = {};
  try {
    snap = tool.submissionSnapshot ? JSON.parse(tool.submissionSnapshot) : {};
  } catch {
    snap = {};
  }
  const snapshot = {
    ...snap,
    name: tool.name,
    description: data.description ?? "",
    heroImageUrl: data.heroImageUrl ?? "",
    galleryImages: data.galleryImages ?? "[]",
    galleryLayout: data.galleryLayout ?? "16:9",
    toolTypes,
    platforms,
  };

  await prisma.tool.update({
    where: { id: toolId },
    data: {
      description: data.description ?? "",
      heroImageUrl: data.heroImageUrl || null,
      galleryImages: data.galleryImages ?? "[]",
      galleryLayout: data.galleryLayout ?? "16:9",
      submissionSnapshot: JSON.stringify(snapshot),
      platforms: {
        set: [],
        connectOrCreate: platforms.map((n) => ({ where: { name: n }, create: { name: n } })),
      },
      toolTypes: {
        set: [],
        connectOrCreate: toolTypes.map((n) => ({ where: { name: n }, create: { name: n } })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/submissions");
}

/** The current user's submitted tools (every status), newest first. */
export async function getMySubmissions() {
  const user = await getCurrentUser();
  if (!user) return [];

  const tools = await prisma.tool.findMany({
    where: { userId: user.id, status: { not: "DELETED" } },
    orderBy: { createdAt: "desc" },
    include: { toolTypes: true, platforms: true },
  });

  return tools.map((t) => ({
    ...t,
    // Only published tools have been through the editor, so only they can show edits.
    edits: t.status === "ACTIVE" ? computeEdits(t) : [],
  }));
}
