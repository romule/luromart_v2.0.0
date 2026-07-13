"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { scheduleLessonAction } from "@/actions/lessons";

export default function LessonDialog({ lesson, mode, day, studentId }: any) {
  const [open, setOpen] = useState(false);

  if (mode === "view") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-full p-3 text-left border rounded-lg hover:bg-slate-50 transition-all">
          <p className="font-bold text-sm">{lesson.topic}</p>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Lesson Details</DialogTitle>
          <p className="text-slate-600">
            {lesson.teacher_notes || "No notes provided."}
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // Calendar Schedule Mode
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-20 border rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center font-bold">
        {day}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Schedule for July {day}</DialogTitle>
        <form
          action={async (formData) => {
            formData.append("date", `2026-07-${day}`);
            formData.append("student_id", studentId);
            await scheduleLessonAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <input
            type="time"
            name="time"
            className="w-full p-2 border rounded"
            required
          />
          <Button type="submit">Confirm Schedule</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
