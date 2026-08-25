"use server";

import { createClient } from "@/utils/supabase/server";
import { getOrCreateParent } from "./parents";

export async function submitBookingRequest(
  parentEmail: string,
  parentPhone: string,
  studentName: string,
  lessonDate: string,
) {
  try {
    const supabase = await createClient();

    // 1. Handle the Parent (using your existing parents.ts function)
    const parentId = await getOrCreateParent(parentEmail, parentPhone);

    // 2. Handle the Student directly to avoid missing export errors
    let studentId;
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("parent_id", parentId)
      .eq("name", studentName)
      .maybeSingle();

    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      const { data: newStudent, error: studentError } = await supabase
        .from("students")
        .insert({
          parent_id: parentId,
          name: studentName,
          experience_level: "Beginner", // Default level for public bookings
        })
        .select()
        .single();

      if (studentError) throw new Error("Failed to create student.");
      studentId = newStudent.id;
    }

    // 3. Schedule the Lesson directly
    const { error: lessonError } = await supabase.from("lessons").insert({
      student_id: studentId,
      lesson_date: lessonDate,
      duration: 60, // Default duration
      status: "pending", // Sends it to the Admin Approval queue
      topic: "Trial Lesson Request",
    });

    if (lessonError) throw new Error("Failed to schedule lesson.");

    return {
      success: true,
      message: "Lesson scheduled successfully! Admin will review your request.",
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Failed to schedule lesson." };
  }
}
