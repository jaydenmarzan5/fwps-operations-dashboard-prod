import { supabase } from "@/lib/supabaseClient";

export async function getCurrentUserProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    return null;
  }

  return profile;
}