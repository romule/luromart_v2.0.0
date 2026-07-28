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

  const newStart = new Date(isoString).getTime();
  const newEnd = newStart + duration * 60000;

  // OVERLAP ENGINE: Check globally for ANY approved OR pending lessons
  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("id, lesson_date, duration")
    .in("status", ["scheduled", "pending"]);

  // OVERLAP ENGINE: Check globally against all created Group Classes
  const { data: groupClasses } = await supabase
    .from("group_classes")
    .select("id, class_date, duration");

  // Merge both pools into a single array of busy blocks
  const busyBlocks = [
    ...(existingLessons || []).map((l) => ({
      start: new Date(l.lesson_date).getTime(),
      duration: l.duration || 60,
    })),
    ...(groupClasses || []).map((g) => ({
      start: new Date(g.class_date).getTime(),
      duration: g.duration || 60,
    })),
  ];

  const hasOverlap = busyBlocks.some((block) => {
    const blockStart = block.start;
    const blockEnd = blockStart + block.duration * 60000;
    return newStart < blockEnd && newEnd > blockStart;
  });

  if (hasOverlap) {
    return {
      error:
        "This time slot overlaps with an existing class or pending request.",
    };
  }

  const { data: lastLesson } = await supabase
    .from("lessons")
    .select("color_id")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextColorId = 0;
  if (lastLesson && lastLesson.color_id !== null) {
    nextColorId = (Number(lastLesson.color_id) + 1) % 10;
  }

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    lesson_date: isoString,
    duration: duration,
    color_id: nextColorId,
    status: "pending",
    topic: "Art Lesson",
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

  if (error) return { error: "Failed to cancel lesson" };

  revalidatePath(`/dashboard/student/${studentId}`, "page");
  return { success: true };
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

  const newStart = new Date(isoString).getTime();
  const newEnd = newStart + duration * 60000;

  // OVERLAP ENGINE: Check globally for ANY approved OR pending lessons (excluding this one)
  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("id, lesson_date, duration")
    .in("status", ["scheduled", "pending"])
    .neq("id", lessonId);

  const { data: groupClasses } = await supabase
    .from("group_classes")
    .select("id, class_date, duration");

  const busyBlocks = [
    ...(existingLessons || []).map((l) => ({
      start: new Date(l.lesson_date).getTime(),
      duration: l.duration || 60,
    })),
    ...(groupClasses || []).map((g) => ({
      start: new Date(g.class_date).getTime(),
      duration: g.duration || 60,
    })),
  ];

  const hasOverlap = busyBlocks.some((block) => {
    const blockStart = block.start;
    const blockEnd = blockStart + block.duration * 60000;
    return newStart < blockEnd && newEnd > blockStart;
  });

  if (hasOverlap) {
    return {
      error:
        "This new time overlaps with an existing class or pending request.",
    };
  }

  const { error } = await supabase
    .from("lessons")
    .update({
      lesson_date: isoString,
      duration: duration,
      status: "pending", // Rescheduling throws it back to pending
    })
    .eq("id", lessonId);

  if (error) return { error: "Failed to update time" };

  revalidatePath(`/dashboard/student/${studentId}`, "page");
  return { success: true };
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

// --- NEW GROUP CLASS ACTIONS ---

export async function getAvailableGroupClassesAction() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("group_classes")
    .select("*")
    .gt("class_date", now)
    .order("class_date", { ascending: true });

  if (error) {
    console.error("Error fetching group classes:", error);
    return { error: "Failed to load group classes." };
  }

  return { data };
}

export async function joinGroupClassAction(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;
  const groupId = formData.get("group_class_id") as string;
  const classDate = formData.get("class_date") as string;
  const duration = parseInt(formData.get("duration") as string) || 60;
  const title = formData.get("title") as string;

  // 1. PEAF Check: Did they already join this exact class?
  const { data: existingEntry } = await supabase
    .from("lessons")
    .select("id")
    .eq("student_id", studentId)
    .eq("group_class_id", groupId)
    .single();

  if (existingEntry) {
    return { error: "This student is already enrolled in this group class." };
  }

  // 2. OVERLAP Check: Does the student already have an individual lesson at this exact time?
  const newStart = new Date(classDate).getTime();
  const newEnd = newStart + duration * 60000;

  const { data: studentLessons } = await supabase
    .from("lessons")
    .select("id, lesson_date, duration")
    .eq("student_id", studentId)
    .in("status", ["scheduled", "pending"]);

  if (studentLessons && studentLessons.length > 0) {
    const hasOverlap = studentLessons.some((lesson) => {
      const existingStart = new Date(lesson.lesson_date).getTime();
      const existingDuration = lesson.duration || 60;
      const existingEnd = existingStart + existingDuration * 60000;
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return {
        error:
          "This student already has an overlapping individual class at this time.",
      };
    }
  }

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    group_class_id: groupId,
    lesson_date: classDate,
    duration: duration,
    status: "scheduled",
    topic: title,
  });

  if (error) return { error: "Failed to join class. Please try again." };

  revalidatePath(`/dashboard/student/${studentId}`, "page");
  revalidatePath(`/dashboard`, "page");

  return { success: true };
}
