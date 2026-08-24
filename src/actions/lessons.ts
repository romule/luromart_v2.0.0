"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLessonAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;
  const homeworkText = (formData.get("homework") as string)?.trim();

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    topic: formData.get("topic"),
    teacher_notes: formData.get("notes"),
    lesson_date: new Date().toISOString(),
    status: "completed",
  });

  if (error) return { error: "Failed to log lesson." };

  if (homeworkText) {
    const { error: homeworkError } = await supabase
      .from("students")
      .update({
        pending_homework: homeworkText,
        homework_notified: false,
      })
      .eq("id", studentId);

    if (homeworkError) return { error: "Failed to save homework assignment." };
  }

  revalidatePath(`/dashboard/student/${studentId}`);
  revalidatePath("/dashboard");
  return null;
}

export async function assignHomeworkAction(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;
  const homeworkText = formData.get("homework") as string;

  if (!homeworkText) return { error: "Homework text is required." };

  const { error } = await supabase
    .from("students")
    .update({
      pending_homework: homeworkText,
      homework_notified: false,
    })
    .eq("id", studentId);

  if (error) return { error: "Failed to assign homework." };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function dismissHomeworkNotifAction(formData: FormData) {
  const studentId = formData.get("student_id") as string;
  const supabase = await createClient();
  await supabase
    .from("students")
    .update({ homework_notified: true, pending_homework: null })
    .eq("id", studentId);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function scheduleLessonAction(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;
  const utcTimestamp = formData.get("utc_timestamp") as string;
  const duration = parseInt(formData.get("duration") as string) || 60;

  const newStart = new Date(utcTimestamp).getTime();
  const newEnd = newStart + duration * 60000;

  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("id, lesson_date, duration")
    .in("status", ["scheduled", "pending"]);
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
    const blockEnd = block.start + block.duration * 60000;
    return newStart < blockEnd && newEnd > block.start;
  });

  if (hasOverlap)
    return {
      error:
        "This time slot overlaps with an existing class or pending request.",
    };

  const { data: lastLesson } = await supabase
    .from("lessons")
    .select("color_id")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextColorId =
    lastLesson?.color_id !== null ? (Number(lastLesson?.color_id) + 1) % 10 : 0;

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    lesson_date: utcTimestamp,
    duration: duration,
    color_id: nextColorId,
    status: "pending",
    topic: "Art Lesson",
  });
  if (error) return { error: "Failed to schedule lesson. Please try again." };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function cancelLessonAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;
  const { error } = await supabase
    .from("lessons")
    .update({ status: "canceled" })
    .eq("id", lessonId);
  if (error) return { error: "Failed to cancel lesson" };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateLessonTimeAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

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
    const blockEnd = block.start + block.duration * 60000;
    return newStart < blockEnd && newEnd > block.start;
  });

  if (hasOverlap)
    return {
      error:
        "This new time overlaps with an existing class or pending request.",
    };

  if (isAdmin) {
    await supabase
      .from("lessons")
      .update({ lesson_date: isoString, duration, status: "scheduled" })
      .eq("id", lessonId);
    await supabase.from("lessons").insert({
      student_id: studentId,
      lesson_date: isoString,
      duration: 0,
      status: "notif_admin_rescheduled",
      topic: "Notification",
    });
  } else {
    await supabase
      .from("lessons")
      .update({ lesson_date: isoString, duration, status: "pending" })
      .eq("id", lessonId);
    await supabase.from("lessons").insert({
      student_id: studentId,
      lesson_date: isoString,
      duration: 0,
      status: "notif_parent_rescheduled",
      topic: "Notification",
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getAvailableGroupClassesAction() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("group_classes")
    .select("*")
    .gt("class_date", now)
    .order("class_date", { ascending: true });
  if (error) return { error: "Failed to load group classes." };
  return { data };
}

export async function joinGroupClassAction(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;
  const groupId = formData.get("group_class_id") as string;
  const classDate = formData.get("class_date") as string;
  const duration = parseInt(formData.get("duration") as string) || 60;
  const title = formData.get("title") as string;

  const { data: existingEntry } = await supabase
    .from("lessons")
    .select("id")
    .eq("student_id", studentId)
    .eq("group_class_id", groupId)
    .single();
  if (existingEntry)
    return { error: "This student is already enrolled in this group class." };

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
      const existingEnd = existingStart + (lesson.duration || 60) * 60000;
      return newStart < existingEnd && newEnd > existingStart;
    });
    if (hasOverlap)
      return {
        error:
          "This student already has an overlapping individual class at this time.",
      };
  }

  const { error } = await supabase.from("lessons").insert({
    student_id: studentId,
    group_class_id: groupId,
    lesson_date: classDate,
    duration,
    status: "scheduled",
    topic: title,
  });
  if (error) return { error: "Failed to join class. Please try again." };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function dismissNotificationAction(formData: FormData) {
  const supabase = await createClient();
  const lessonId = formData.get("lesson_id") as string;

  await supabase.from("lessons").delete().eq("id", lessonId);

  revalidatePath("/", "layout");
  return { success: true };
}
