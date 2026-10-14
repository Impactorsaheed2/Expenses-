import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Debugging helper: DO NOT log actual secret values. Only report whether they are set.
console.log("SUPABASE_URL:", url ? "[set]" : "[missing]", "SUPABASE_KEY:", key ? "[set]" : "[missing]");
export const supabase = url && key ? createClient(url, key) : null;
