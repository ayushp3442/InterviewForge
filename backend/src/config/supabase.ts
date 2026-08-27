import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "placeholder-key";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn("⚠️ Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables are missing. Resume uploads will fail until configured in Render Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);