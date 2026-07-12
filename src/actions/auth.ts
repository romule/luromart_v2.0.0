// src/actions/auth.ts
"use server";

import { supabase } from "@/lib/supabase";

export async function registerParent(formData: any) {
  const { name, email, phone, password } = formData;

  console.log("Starting secure registration for:", email);

  // Registretion of parents/users   */

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || "",
        phone: phone || "",
      },
    },
  });

  if (error) {
    console.error("Registration failed:", error.message);
    throw new Error(error.message);
  }

  console.log(
    "User vault account created. Database trigger handling profile cascade.",
  );
  return { success: true };
}

// Login of parents/users

export async function loginParent(formData: any) {
  const { email, password } = formData;

  console.log("Attempting login for:", email);

  // 1. Ask Supabase to verify the credentials and create a secure session
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 2. Handle wrong passwords or unregistered emails
  if (error) {
    console.error("Login failed:", error.message);
    throw new Error("Invalid email or password.");
  }

  console.log("Login successful! Session created.");
  return { success: true };
}
