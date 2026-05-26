"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  await requireAdmin();
  
  const [total, active, draft] = await Promise.all([
    prisma.tool.count(),
    prisma.tool.count({ where: { status: 'ACTIVE' } }),
    prisma.tool.count({ where: { status: 'DRAFT' } })
  ]);
  
  return {
    total,
    active,
    pending: draft
  };
}

export async function getAllToolsAdmin() {
  await requireAdmin();
  
  return prisma.tool.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      platforms: true,
      toolTypes: true,
    }
  });
}

export async function deleteTool(id: string) {
  await requireAdmin();
  
  await prisma.tool.update({
    where: { id },
    data: { status: 'DELETED' }
  });
  
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
}

export type ToolAdminFormData = {
  name: string;
  description: string;
  repoUrl: string;
  stars: number;
  forks: number;
  issues: number;
  status: string;
  aboutText: string;
  version: string;
  license: string;
  installCommand: string;
  heroImageUrl: string;
  galleryImages: string; // JSON string
  galleryLayout: string;
  features: string; // JSON string
  author: string;
  since: string;
  websiteUrl: string;
  platforms: string[]; // array of names
  toolTypes: string[]; // array of names
};

export async function createTool(data: ToolAdminFormData) {
  const admin = await requireAdmin();
  
  const { platforms, toolTypes, ...toolData } = data;

  const tool = await prisma.tool.create({
    data: {
      ...toolData,
      userId: admin.id,
      platforms: {
        connectOrCreate: platforms.map(name => ({
          where: { name },
          create: { name },
        })),
      },
      toolTypes: {
        connectOrCreate: toolTypes.map(name => ({
          where: { name },
          create: { name },
        })),
      },
    }
  });

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return tool;
}

export async function updateTool(id: string, data: ToolAdminFormData) {
  await requireAdmin();
  
  const { platforms, toolTypes, ...toolData } = data;

  // We need to overwrite platforms and toolTypes. Prisma 'set' replaces existing connections.
  const tool = await prisma.tool.update({
    where: { id },
    data: {
      ...toolData,
      platforms: {
        set: [], // Clear existing
        connectOrCreate: platforms.map(name => ({
          where: { name },
          create: { name },
        })),
      },
      toolTypes: {
        set: [], // Clear existing
        connectOrCreate: toolTypes.map(name => ({
          where: { name },
          create: { name },
        })),
      },
    }
  });

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath(`/tools/${id}`);
  return tool;
}
