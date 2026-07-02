"use server";

import { getCurrentAdmin } from "@/lib/auth-guard";

export async function checkUserRole() {
  try {
    const admin = await getCurrentAdmin();
    if (admin) {
      return { isAdmin: true, isSuperAdmin: admin.isPrimaryAdmin };
    }
  } catch (error) {
    console.error("Error checking user role:", error);
  }
  return { isAdmin: false, isSuperAdmin: false };
}
