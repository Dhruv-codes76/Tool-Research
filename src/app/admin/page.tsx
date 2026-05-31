import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminDashboardPage() {
  await requireAdmin();
  // Redirect to tools for now until a full analytics dashboard is built
  redirect("/admin/tools");
}
