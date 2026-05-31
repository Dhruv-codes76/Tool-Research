import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Helper function to check if the supabase URL is valid
const isValidUrl = (url: string) => {
  if (!url || url === 'your-supabase-url') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const finalSupabaseUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-supabase-url.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key' ? supabaseAnonKey : 'placeholder-anon-key';

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn("Supabase is not properly configured. Using placeholder values to prevent runtime crashes.");
}

// Public client for browser-side usage (anon key)
export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey);

/**
 * Admin client for server-side elevated tasks (service role).
 * We initialize this as a function to avoid browser-side crashes if the key is missing.
 */
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error("supabaseAdmin should only be used server-side!");
  }
  const finalServiceKey = supabaseServiceKey && supabaseServiceKey !== 'your-supabase-service-role-key' ? supabaseServiceKey : 'placeholder-service-key';
  if (!supabaseServiceKey || supabaseServiceKey === 'your-supabase-service-role-key') {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing or invalid in environment variables!");
  }
  return createClient(finalSupabaseUrl, finalServiceKey);
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
  return createClient(finalSupabaseUrl, finalSupabaseAnonKey);
};
