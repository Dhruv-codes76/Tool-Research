import "server-only";

import { createServerClient as ssrCreateServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a cookie-aware Supabase client for Server Components and Route Handlers.
 * 
 * This lives in a separate file from supabase.ts because that file is imported
 * by client components (AuthForm, TopNavBar). Importing `next/headers` in a
 * module that reaches the client bundle causes a build error, so we isolate
 * the server-only code here with the `server-only` package guard.
 */
export const createServerClient = async () => {
  const cookieStore = await cookies();

  return ssrCreateServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Silently catch when called during static prerendering
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Silently catch when called during static prerendering
          }
        },
      },
    }
  );
};
