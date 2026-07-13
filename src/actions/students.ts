"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrCreateStudent(studentName: string) {
  const supabase = await createClient();

  // 1. Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. Check if student exists
  const { data: existingStudent } = await supabase
    .from("students")
    .select("id")
    .match({ parent_id: user.id, name: studentName })
    .single();

  if (existingStudent) return existingStudent.id;

  // 3. Create if not found
  const { data: newStudent, error } = await supabase
    .from("students")
    .insert([
      {
        parent_id: user.id,
        name: studentName,
        experience_level: "Beginner",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return newStudent.id;
}

export async function addStudentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const studentName = formData.get("name") as string;
  const experienceLevel =
    (formData.get("experience_level") as string) || "Beginner";

  const { error } = await supabase.from("students").insert([
    {
      parent_id: user.id,
      name: studentName,
      experience_level: experienceLevel,
    },
  ]);

  if (error) throw new Error(error.message);

  // This forces the dashboard to refresh instantly after adding the student
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
