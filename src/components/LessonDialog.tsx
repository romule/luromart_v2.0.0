"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  scheduleLessonAction,
  cancelLessonAction,
  updateLessonTimeAction,
} from "@/actions/lessons";
import {
  Clock,
  CalendarX2,
  CalendarPlus,
  Globe,
  AlertCircle,
} from "lucide-react";

export default function LessonDialog({ lesson, mode, day, studentId }: any) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null); // NEW ERROR STATE

  // 1. VIEW MODE (History Cards)
  if (mode === "view") {
    // ... [KEEP EXACTLY THE SAME AS BEFORE] ...
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
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Globe size={10} /> Local Time
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Duration
                </h4>
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
  if (mode === "upcoming") {
    // ... [KEEP EXACTLY THE SAME AS BEFORE] ...
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
    const coeff = 1000 * 60 * 10;
    const roundedD = new Date(Math.round(d.getTime() / coeff) * coeff);
    const inputTimeDefault = roundedD.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <DialogContent className="sm:max-w-sm p-6">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Manage Lesson
          </DialogTitle>
          <div className="text-sm text-slate-600 mb-2">
            Scheduled for: <strong>{lessonDateStr}</strong>
          </div>
          <form
            action={async (formData) => {
              if (isSubmitting) return;
              setIsSubmitting(true);
              try {
                formData.append("lesson_id", lesson.id);
                formData.append("student_id", studentId);
                formData.append("date_part", datePart);
                await updateLessonTimeAction(formData);
                setOpen(false);
              } finally {
                setIsSubmitting(false);
              }
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
                defaultValue={inputTimeDefault}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
              <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                <Globe size={14} className="shrink-0 mt-0.5" />
                <span>
                  Automatically syncs with Atlantic Time (Halifax). Please pick
                  the time in your local timezone.
                </span>
              </p>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Time"}
            </Button>
          </form>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <form
              action={async (formData) => {
                if (isSubmitting) return;
                setIsSubmitting(true);
                try {
                  formData.append("lesson_id", lesson.id);
                  formData.append("student_id", studentId);
                  await cancelLessonAction(formData);
                  setOpen(false);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalendarX2 size={16} />
                {isSubmitting ? "Canceling..." : "Cancel Lesson"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 3. DESKTOP SCHEDULE MODE (Calendar Days Grid)
  if (mode === "schedule") {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="h-20 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center justify-center font-bold text-slate-600 shadow-sm cursor-pointer">
            {day}
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogTitle>Schedule for July {day}</DialogTitle>
            <form
              action={async (formData) => {
                if (isSubmitting) return;
                setIsSubmitting(true);

                formData.append(
                  "date",
                  `2026-07-${String(day).padStart(2, "0")}`,
                );
                formData.append("student_id", studentId);
                const result = await scheduleLessonAction(formData);

                setIsSubmitting(false);

                if (result?.error) {
                  setBookingError(result.error); // Show error alert!
                } else {
                  setOpen(false); // Success, close window!
                }
              }}
              className="space-y-4 pt-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                  <Globe size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Studio operates in Atlantic Time. Please select your local
                    time.
                  </span>
                </p>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Booking..." : "Confirm Schedule"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- ERROR ALERT WINDOW --- */}
        <AlertDialog
          open={!!bookingError}
          onOpenChange={() => setBookingError(null)}
        >
          <AlertDialogContent className="sm:max-w-sm rounded-xl w-[90%]">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" /> Scheduling Conflict
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                {bookingError}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setBookingError(null)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
              >
                Okay, got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // 4. MOBILE NATIVE SCHEDULE MODE
  if (mode === "mobile-schedule") {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="w-full py-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <CalendarPlus size={20} /> Book New Lesson
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm w-[90%] rounded-xl">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Schedule Lesson
            </DialogTitle>
            <form
              action={async (formData) => {
                if (isSubmitting) return;
                setIsSubmitting(true);

                formData.append("student_id", studentId);
                const result = await scheduleLessonAction(formData);

                setIsSubmitting(false);

                if (result?.error) {
                  setBookingError(result.error); // Trigger Shadcn Alert!
                } else {
                  setOpen(false); // Success, close window!
                }
              }}
              className="space-y-5 pt-2"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Select Date
                </label>
                <input
                  type="date"
                  name="date"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Select Time
                </label>
                <input
                  type="time"
                  name="time"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                  required
                />
                <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                  <Globe
                    size={14}
                    className="shrink-0 mt-0.5 text-emerald-600"
                  />
                  <span>
                    Studio operates in Atlantic Time. Please select your local
                    time.
                  </span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Booking..." : "Confirm Schedule"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- ERROR ALERT WINDOW --- */}
        <AlertDialog
          open={!!bookingError}
          onOpenChange={() => setBookingError(null)}
        >
          <AlertDialogContent className="sm:max-w-sm rounded-xl w-[90%]">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" /> Scheduling Conflict
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                {bookingError}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setBookingError(null)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
              >
                Okay, got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return null;
}
