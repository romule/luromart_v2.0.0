"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const studentId = formData.get("student_id") as string;

  const { error } = await supabase
    .from("lessons")
    .update({ status: "scheduled" })
    .eq("id", lessonId);

  if (error) {
    console.error("Failed to approve lesson:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath(`/dashboard/student/${studentId}`);
}

export async function declineLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const studentId = formData.get("student_id") as string;

  const { error } = await supabase
    .from("lessons")
    .update({ status: "declined" })
    .eq("id", lessonId);

  if (error) {
    console.error("Failed to decline lesson:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath(`/dashboard/student/${studentId}`);
}

export async function dismissNotificationAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) {
    console.error("Failed to dismiss notification:", error);
    return;
  }

  revalidatePath("/dashboard");
}

export async function createGroupClassAction(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const datePart = formData.get("date") as string;
  const timePart = formData.get("time") as string;
  const duration = parseInt(formData.get("duration") as string) || 60;
  const max_capacity = parseInt(formData.get("max_capacity") as string) || 10;

  if (!title || !datePart || !timePart) {
    console.error("Missing required fields.");
    return;
  }

  const localDate = new Date(`${datePart}T${timePart}:00`);
  const isoString = localDate.toISOString();

  const { error } = await supabase.from("group_classes").insert({
    title,
    class_date: isoString,
    duration,
    max_capacity,
  });

  if (error) {
    console.error("Failed to create group class:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function deleteGroupClassAction(formData: FormData) {
  const supabase = await createClient();
  const classId = formData.get("class_id") as string;

  // Delete the class
  const { error } = await supabase
    .from("group_classes")
    .delete()
    .eq("id", classId);

  // Also clean up any lessons parents booked attached to this class
  await supabase.from("lessons").delete().eq("group_class_id", classId);

  if (error) {
    console.error("Failed to delete group class:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
