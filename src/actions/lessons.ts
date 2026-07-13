"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLessonAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    topic: formData.get("topic"),
    teacher_notes: formData.get("notes"),
    homework_url: formData.get("homework"),
    lesson_date: new Date().toISOString(),
    status: "completed",
  });

  if (error) return { error: "Failed to log" };

  revalidatePath(`/dashboard/student/${studentId}`);
  return null;
}

export async function scheduleLessonAction(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;
  const datePart = formData.get("date") as string;
  const timePart = formData.get("time") as string;

  // Combine them into a local Date object to fix the ADT offset
  const localDate = new Date(`${datePart}T${timePart}:00`);

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    lesson_date: localDate.toISOString(),
    status: "scheduled",
    topic: "Pending",
  });

  if (error) throw new Error("Failed to schedule");

  revalidatePath(`/dashboard/student/${studentId}`, "page");
}

export async function cancelLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const studentId = formData.get("student_id") as string;

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) throw new Error("Failed to cancel lesson");

  // Added 'page' to force a hard layout refresh
  revalidatePath(`/dashboard/student/${studentId}`, "page");
}

export async function updateLessonTimeAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const studentId = formData.get("student_id") as string;
  const datePart = formData.get("date_part") as string; // YYYY-MM-DD
  const newTime = formData.get("time") as string; // HH:MM

  // FIX: Combine them into a proper local Date object, then convert to ISO (UTC)
  // This ensures the time you type is respected in your local timezone!
  const localDate = new Date(`${datePart}T${newTime}:00`);
  const isoString = localDate.toISOString();

  const { error } = await supabase
    .from("lessons")
    .update({
      lesson_date: isoString,
    })
    .eq("id", lessonId);

  if (error) throw new Error("Failed to update time");

  // Added 'page' to force a hard layout refresh
  revalidatePath(`/dashboard/student/${studentId}`, "page");
}

export async function createLesson(param1: any, param2?: any, param3?: any) {
  const supabase = await createClient();

  // Handle both possible ways booking.ts might be sending the data
  let insertData = {};
  if (typeof param1 === "object") {
    insertData = param1;
  } else {
    insertData = {
      student_id: param1,
      lesson_date: param2,
      topic: param3 || "Initial Booking",
      status: "scheduled",
    };
  }

  const { data, error } = await supabase
    .from("lessons")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Failed to create lesson from booking:", error);
    throw new Error("Failed to create lesson");
  }

  return data;
}
