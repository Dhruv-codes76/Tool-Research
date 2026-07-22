import { redirect } from "next/navigation";

// Blog content is authored in the embedded Sanity Studio at /studio (separate
// Sanity project login). The admin sidebar links here for discoverability, so
// send editors straight through. Keeping the Studio outside the /admin tree
// avoids double-gating it behind both Supabase admin auth and Sanity auth.
export default function AdminBlogsPage() {
  redirect("/studio");
}
