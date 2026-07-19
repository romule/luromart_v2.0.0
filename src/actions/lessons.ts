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

  const utcTimestamp = formData.get("utc_timestamp") as string;
  const duration = parseInt(formData.get("duration") as string) || 60;

  let isoString = utcTimestamp;
  if (!isoString) {
    const datePart = formData.get("date") as string;
    const timePart = formData.get("time") as string;
    const localDate = new Date(`${datePart}T${timePart}:00`);
    isoString = localDate.toISOString();
  }

  // 1. Calculate absolute start and end times in milliseconds
  const newStart = new Date(isoString).getTime();
  const newEnd = newStart + duration * 60000; // 60,000 ms in a minute

  // 2. Fetch all existing lessons for this student
  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("id, lesson_date, duration")
    .eq("student_id", studentId);

  // 3. The Overlap Engine: Check if the new time block collides with ANY existing block
  if (existingLessons && existingLessons.length > 0) {
    const hasOverlap = existingLessons.some((lesson) => {
      const existingStart = new Date(lesson.lesson_date).getTime();
      const existingDuration = lesson.duration || 60;
      const existingEnd = existingStart + existingDuration * 60000;

      // Collision math: Starts before the other ends AND ends after the other starts
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return {
        error: "This time slot overlaps with an existing lesson duration.",
      };
    }
  }

  // 4. Bulletproof Color ID Engine
  const { data: lastLesson } = await supabase
    .from("lessons")
    .select("color_id")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextColorId = 0;
  // Force Number() conversion to prevent JavaScript "0" + 1 = "01" bugs
  if (lastLesson && lastLesson.color_id !== null) {
    nextColorId = (Number(lastLesson.color_id) + 1) % 10;
  }

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    lesson_date: isoString,
    duration: duration,
    color_id: nextColorId,
    status: "scheduled",
    topic: "Pending",
  });

  if (error) return { error: "Failed to schedule lesson. Please try again." };

  revalidatePath(`/dashboard/student/${studentId}`, "page");
  return { success: true };
}

export async function cancelLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const studentId = formData.get("student_id") as string;

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) throw new Error("Failed to cancel lesson");

  revalidatePath(`/dashboard/student/${studentId}`, "page");
}

export async function updateLessonTimeAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const studentId = formData.get("student_id") as string;

  const utcTimestamp = formData.get("utc_timestamp") as string;
  const duration = parseInt(formData.get("duration") as string) || 60;

  let isoString = utcTimestamp;
  if (!isoString) {
    const datePart = formData.get("date_part") as string;
    const newTime = formData.get("time") as string;
    const localDate = new Date(`${datePart}T${newTime}:00`);
    isoString = localDate.toISOString();
  }

  // 1. Calculate absolute start and end times
  const newStart = new Date(isoString).getTime();
  const newEnd = newStart + duration * 60000;

  // 2. Overlap Check (Excluding the lesson we are currently updating!)
  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("id, lesson_date, duration")
    .eq("student_id", studentId)
    .neq("id", lessonId);

  if (existingLessons && existingLessons.length > 0) {
    const hasOverlap = existingLessons.some((lesson) => {
      const existingStart = new Date(lesson.lesson_date).getTime();
      const existingDuration = lesson.duration || 60;
      const existingEnd = existingStart + existingDuration * 60000;

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      throw new Error(
        "This new time overlaps with an existing lesson duration.",
      );
    }
  }

  const { error } = await supabase
    .from("lessons")
    .update({
      lesson_date: isoString,
      duration: duration,
    })
    .eq("id", lessonId);

  if (error) throw new Error("Failed to update time");

  revalidatePath(`/dashboard/student/${studentId}`, "page");
}

export async function createLesson(param1: any, param2?: any, param3?: any) {
  const supabase = await createClient();

  let insertData = {};
  if (typeof param1 === "object") {
    insertData = param1;
  } else {
    insertData = {
      student_id: param1,
      lesson_date: param2,
      topic: param3 || "Initial Booking",
      status: "scheduled",
      duration: 60,
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
