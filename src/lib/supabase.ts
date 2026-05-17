import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables!");
}

// Public client for browser-side usage (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client for server-side elevated tasks (service role).
 * We initialize this as a function to avoid browser-side crashes if the key is missing.
 */
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error("supabaseAdmin should only be used server-side!");
  }
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in environment variables!");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 * @param file - The image file as a Buffer or Blob.
 * @param fileName - The name to save the file as.
 */
export async function uploadToolImage(file: Buffer | Blob, fileName: string) {
  const { error } = await supabase.storage
    .from("tool-screenshots")
    .upload(fileName, file, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("tool-screenshots")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * Creates a Supabase client for use in Server Components.
 */
export const createServerClient = () => {
  // Using the newer approach for Next.js App Router
  // Note: auth-helpers-nextjs is deprecated but still widely used for simple setups
  // Ideally, migrate to @supabase/ssr later if needed.
  return createClient(supabaseUrl, supabaseAnonKey);
};
