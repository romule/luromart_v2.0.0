"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  scheduleLessonAction,
  cancelLessonAction,
  updateLessonTimeAction,
} from "@/actions/lessons";
import { Clock, CalendarX2 } from "lucide-react";

export default function LessonDialog({ lesson, mode, day, studentId }: any) {
  const [open, setOpen] = useState(false);

  // 1. VIEW MODE (History Cards)
  if (mode === "view") {
    const d = new Date(lesson.lesson_date);
    const lessonDate = d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const lessonTime = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-full p-4 text-left border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm bg-white">
          <p className="font-bold text-sm text-slate-900">{lesson.topic}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">{lessonDate}</p>
            <span className="text-xs text-slate-300">•</span>
            <p className="text-xs text-slate-500 font-medium">{lessonTime}</p>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl border-b pb-4 text-slate-900">
            {lesson.topic}
          </DialogTitle>
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Date & Time
                </h4>
                <p className="text-sm text-slate-700">
                  {lessonDate}
                  <br />
                  {lessonTime}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Duration
                </h4>
                {/* Fallback to 60 mins until your Mom's admin panel adds exact durations */}
                <p className="text-sm text-slate-700">
                  {lesson.duration || "60 minutes"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                Teacher Notes
              </h4>
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                {lesson.teacher_notes || "No notes provided for this lesson."}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                Homework
              </h4>
              <div className="text-sm text-indigo-800 bg-indigo-50 p-3 rounded-lg border border-indigo-100 whitespace-pre-wrap">
                {lesson.homework_url || "No homework assigned."}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 2. UPCOMING MODE (Manage scheduled lessons)
  // 2. UPCOMING MODE (Manage scheduled lessons)
  if (mode === "upcoming") {
    const d = new Date(lesson.lesson_date);
    const lessonDateStr = d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const lessonTimeStr = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // --- NEW ROUNDING LOGIC ---
    // Round to the nearest 10 minutes so the default value doesn't break HTML validation
    const coeff = 1000 * 60 * 10;
    const roundedD = new Date(Math.round(d.getTime() / coeff) * coeff);

    // Format required for input type="time" (HH:MM 24hr)
    const inputTimeDefault = roundedD.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    // Safe date part string to reconstruct date (YYYY-MM-DD)
    const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-full text-left p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer">
          <p className="font-bold text-sm text-indigo-900">{lessonDateStr}</p>
          <div className="flex items-center gap-1 mt-0.5 mb-1">
            <Clock size={12} className="text-indigo-500" />
            <p className="text-xs text-indigo-600 font-medium">
              {lessonTimeStr}
            </p>
          </div>
          <p className="text-xs text-slate-500 truncate">{lesson.topic}</p>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle>Manage Lesson</DialogTitle>
          <div className="text-sm text-slate-600 mb-2">
            Scheduled for: <strong>{lessonDateStr}</strong>
          </div>

          <form
            action={async (formData) => {
              formData.append("lesson_id", lesson.id);
              formData.append("student_id", studentId);
              formData.append("date_part", datePart);
              await updateLessonTimeAction(formData);
              setOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Change Time
              </label>
              <input
                type="time"
                name="time"
                className="w-full p-2.5 border border-slate-200 rounded-lg..."
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Update Time
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <form
              action={async (formData) => {
                formData.append("lesson_id", lesson.id);
                formData.append("student_id", studentId);
                await cancelLessonAction(formData);
                setOpen(false);
              }}
            >
              <Button
                type="submit"
                variant="destructive"
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none flex items-center gap-2"
              >
                <CalendarX2 size={16} /> Cancel Lesson
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 3. SCHEDULE MODE (Calendar Days)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-20 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center justify-center font-bold text-slate-600 shadow-sm cursor-pointer">
        {day}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Schedule for July {day}</DialogTitle>
        <form
          action={async (formData) => {
            formData.append("date", `2026-07-${String(day).padStart(2, "0")}`);
            formData.append("student_id", studentId);
            await scheduleLessonAction(formData);
            setOpen(false);
          }}
          className="space-y-4 pt-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Time</label>
            <input
              type="time"
              name="time"
              className="w-full p-2.5 border border-slate-200 rounded-lg..."
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Confirm Schedule
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
