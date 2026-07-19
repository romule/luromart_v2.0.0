"use server";

// Import our new, modular tools
import { getOrCreateParent } from "./parents";
import { getOrCreateStudent } from "./students";
import { createLesson } from "./lessons";

export async function submitBookingRequest(
  parentEmail: string,
  parentPhone: string,
  studentName: string,
  lessonDate: string,
) {
  try {
    // 1. Handle the Parent
    const parentId = await getOrCreateParent(parentEmail, parentPhone);

    // 2. Handle the Student
    const studentId = await getOrCreateStudent(parentId, studentName);

    // 3. Schedule the Lesson
    await createLesson(studentId, lessonDate);

    return { success: true, message: "Lesson scheduled successfully!" };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Failed to schedule lesson." };
  }
}
