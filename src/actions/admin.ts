"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const studentId = formData.get("student_id") as string;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("lesson_date")
    .eq("id", lessonId)
    .single();

  const { error } = await supabase
    .from("lessons")
    .update({ status: "scheduled" })
    .eq("id", lessonId);
  if (error)
    return {
      error:
        error.message || "Failed to approve lesson due to a database conflict.",
    };

  if (lesson) {
    await supabase.from("lessons").insert({
      student_id: studentId,
      lesson_date: lesson.lesson_date,
      duration: 0,
      status: "notif_approved",
      topic: "Notification",
    });
  }
  return { success: true };
}

export async function declineLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const { error } = await supabase
    .from("lessons")
    .update({ status: "declined" })
    .eq("id", lessonId);
  if (error) return { error: error.message || "Failed to decline lesson." };
  return { success: true };
}

export async function acknowledgeCanceledAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("status")
    .eq("id", lessonId)
    .single();

  if (lesson?.status === "canceled") {
    await supabase
      .from("lessons")
      .update({ status: "canceled_acknowledged" })
      .eq("id", lessonId);
  } else {
    await supabase.from("lessons").delete().eq("id", lessonId);
  }

  // FIXED: Forces the Bell icon to update instantly!
  revalidatePath("/", "layout");
  return { success: true };
}

export async function adminCancelLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const { error } = await supabase
    .from("lessons")
    .update({ status: "admin_canceled_in_trash" })
    .eq("id", lessonId);
  if (error) return { error: error.message || "Failed to cancel lesson." };
  return { success: true };
}

export async function adminRestoreLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const { error } = await supabase
    .from("lessons")
    .update({ status: "scheduled" })
    .eq("id", lessonId);
  if (error) return { error: error.message || "Failed to restore lesson." };
  return { success: true };
}

export async function adminPermanentDeleteLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("status")
    .eq("id", lessonId)
    .single();

  if (lesson?.status?.startsWith("admin_canceled")) {
    const { error } = await supabase
      .from("lessons")
      .update({ status: "notif_admin_deleted_final" })
      .eq("id", lessonId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function createGroupClassAction(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const utc_timestamp = formData.get("utc_timestamp") as string;
  const duration = parseInt(formData.get("duration") as string) || 60;
  const max_capacity = parseInt(formData.get("max_capacity") as string) || 10;

  if (!title || !utc_timestamp) return { error: "Missing required fields." };

  const newStart = new Date(utc_timestamp).getTime();
  const newEnd = newStart + duration * 60000;

  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("lesson_date, duration")
    .in("status", ["scheduled", "pending"]);
  const { data: groupClasses } = await supabase
    .from("group_classes")
    .select("class_date, duration");

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
    const blockEnd = block.start + block.duration * 60000;
    return newStart < blockEnd && newEnd > block.start;
  });

  if (hasOverlap)
    return {
      error:
        "This time slot overlaps with an existing individual or group class.",
    };

  const { error } = await supabase
    .from("group_classes")
    .insert({ title, class_date: utc_timestamp, duration, max_capacity });
  if (error) return { error: error.message || "Failed to create group class." };

  return { success: true };
}

export async function deleteGroupClassAction(formData: FormData) {
  const supabase = await createClient();
  const classId = formData.get("class_id") as string;

  const { error } = await supabase
    .from("group_classes")
    .delete()
    .eq("id", classId);
  await supabase.from("lessons").delete().eq("group_class_id", classId);

  if (error) return { error: error.message || "Failed to delete group class." };
  return { success: true };
}
