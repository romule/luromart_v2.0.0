"use server";

import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export async function createLesson(studentId: string, lessonDate: string) {
  const { error } = await supabase.from("lessons").insert([
    {
      student_id: studentId,
      lesson_date: lessonDate,
    },
  ]);

  if (error) throw error;
  return true;
}
