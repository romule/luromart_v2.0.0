"use server";

import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export async function getOrCreateParent(email: string, phone: string) {
  const { data: existingParent } = await supabase
    .from("parents")
    .select("id")
    .eq("email", email)
    .single();

  if (existingParent) return existingParent.id;

  const { data: newParent, error } = await supabase
    .from("parents")
    .insert([{ email, phone_number: phone }])
    .select()
    .single();

  if (error) throw error;
  return newParent.id;
}
