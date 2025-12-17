import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set");
}

// Client-side Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
    },
  }
);

// Server-side Supabase client with service role (for admin operations)
export function createServiceClient() {
  if (!process.env.SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
