import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-guard";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login?next=/admin");
  // Redirect to tools for now until a full analytics dashboard is built
  redirect("/admin/tools");
}
