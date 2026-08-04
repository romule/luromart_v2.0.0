"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addStudentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const studentName = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const dob = formData.get("date_of_birth") as string;

  // Default to Beginner, but Admin can edit it later
  const experienceLevel =
    (formData.get("experience_level") as string) || "Beginner";

  const { error } = await supabase.from("students").insert([
    {
      parent_id: user.id,
      name: studentName,
      surname: surname,
      date_of_birth: dob,
      experience_level: experienceLevel,
    },
  ]);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function softDeleteStudentAction(studentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("students")
    .update({ is_deleted: true })
    .match({ id: studentId, parent_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function restoreStudentAction(studentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("students")
    .update({ is_deleted: false })
    .match({ id: studentId, parent_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function permanentlyDeleteStudentAction(studentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("students")
    .delete()
    .match({ id: studentId, parent_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function updateStudentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const studentId = formData.get("student_id") as string;
  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const dob = formData.get("date_of_birth") as string;
  const experienceLevel = formData.get("experience_level") as string;

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  let updateData: any = {
    name,
    surname,
    date_of_birth: dob,
  };

  // Only allow experience level to be updated if the user is an admin
  if (isAdmin && experienceLevel) {
    updateData.experience_level = experienceLevel;
  }

  // Ensure normal parents can only update their own children
  const matchQuery = isAdmin
    ? { id: studentId }
    : { id: studentId, parent_id: user.id };

  const { error } = await supabase
    .from("students")
    .update(updateData)
    .match(matchQuery);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
