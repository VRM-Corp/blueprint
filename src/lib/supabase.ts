import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    if (typeof window !== "undefined") {
      console.warn(
        "[Blueprint] Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }
    return createClient("https://placeholder.supabase.co", "placeholder");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();

export type Message = {
  id: string;
  text: string;
  sender_name?: string;
  created_at: string;
};

export type Drawing = {
  id: string;
  image_data: string;
  sender_name?: string;
  created_at: string;
};

export type Participant = {
  id: string;
  name: string;
  contact?: string;
  contact_type?: string;
  avatar_url?: string;
  created_at: string;
};
