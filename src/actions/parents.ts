import { createClient } from "@/utils/supabase/server";

export async function getOrCreateParent(email: string, phone: string) {
  const supabase = await createClient();

  const { data: existingParent } = await supabase
    .from("parents")
    .select("*")
    .eq("email", email)
    .single();

  if (existingParent) return existingParent.id;

  const { data: newParent, error } = await supabase
    .from("parents")
    .insert({ email, phone })
    .select()
    .single();

  if (error) throw new Error("Failed to create parent");
  return newParent.id;
}
