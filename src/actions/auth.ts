"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function loginParent(formData: any) {
  const { email, password } = formData;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Invalid email or password.");
  }

  return { success: true };
}

export async function registerParent(formData: any) {
  const { name, email, phone, password } = formData;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || "", phone: phone || "" },
    },
  });

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
