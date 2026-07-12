"use server";

import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export async function getOrCreateStudent(
  parentId: string,
  studentName: string,
) {
  const { data: existingStudent } = await supabase
    .from("students")
    .select("id")
    .match({ parent_id: parentId, name: studentName })
    .single();

  if (existingStudent) return existingStudent.id;

  const { data: newStudent, error } = await supabase
    .from("students")
    .insert([
      {
        parent_id: parentId,
        name: studentName,
        experience_level: "Beginner",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return newStudent.id;
}
