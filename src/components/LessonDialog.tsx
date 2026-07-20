"use client";

import { useState, useMemo } from "react";
import { format, parse } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  scheduleLessonAction,
  cancelLessonAction,
  updateLessonTimeAction,
} from "@/actions/lessons";

import { Clock, CalendarX2, CalendarPlus, Globe, Timer } from "lucide-react";

import {
  generateTimeSlots,
  isDateInPast,
  createUtcTimestamp,
} from "@/lib/time-utils";

import StatusAlert, { StatusAlertState } from "./StatusAlert";

// 🎨 10 Distinct Color Palettes for the Upcoming Cards
const colorPalettes = [
  {
    bg: "bg-blue-50/80",
    hover: "hover:bg-blue-100/80",
    border: "border-blue-200",
    text: "text-blue-900",
    accent: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    bg: "bg-emerald-50/80",
    hover: "hover:bg-emerald-100/80",
    border: "border-emerald-200",
    text: "text-emerald-900",
    accent: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    bg: "bg-amber-50/80",
    hover: "hover:bg-amber-100/80",
    border: "border-amber-200",
    text: "text-amber-900",
    accent: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    bg: "bg-fuchsia-50/80",
    hover: "hover:bg-fuchsia-100/80",
    border: "border-fuchsia-200",
    text: "text-fuchsia-900",
    accent: "text-fuchsia-500",
    badge: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    bg: "bg-cyan-50/80",
    hover: "hover:bg-cyan-100/80",
    border: "border-cyan-200",
    text: "text-cyan-900",
    accent: "text-cyan-500",
    badge: "bg-cyan-100 text-cyan-700",
  },
  {
    bg: "bg-rose-50/80",
    hover: "hover:bg-rose-100/80",
    border: "border-rose-200",
    text: "text-rose-900",
    accent: "text-rose-500",
    badge: "bg-rose-100 text-rose-700",
  },
  {
    bg: "bg-violet-50/80",
    hover: "hover:bg-violet-100/80",
    border: "border-violet-200",
    text: "text-violet-900",
    accent: "text-violet-500",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    bg: "bg-orange-50/80",
    hover: "hover:bg-orange-100/80",
    border: "border-orange-200",
    text: "text-orange-900",
    accent: "text-orange-500",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    bg: "bg-teal-50/80",
    hover: "hover:bg-teal-100/80",
    border: "border-teal-200",
    text: "text-teal-900",
    accent: "text-teal-500",
    badge: "bg-teal-100 text-teal-700",
  },
  {
    bg: "bg-pink-50/80",
    hover: "hover:bg-pink-100/80",
    border: "border-pink-200",
    text: "text-pink-900",
    accent: "text-pink-500",
    badge: "bg-pink-100 text-pink-700",
  },
];

export default function LessonDialog({
  lesson,
  mode,
  day,
  month,
  year,
  studentId,
}: any) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteData, setPendingDeleteData] = useState<FormData | null>(
    null,
  );

  const [alertState, setAlertState] = useState<StatusAlertState>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const closeAlert = async () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    if (pendingDeleteData) {
      setIsSubmitting(true);
      try {
        await cancelLessonAction(pendingDeleteData);
        setOpen(false);
      } finally {
        setIsSubmitting(false);
        setPendingDeleteData(null);
      }
    }
  };

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("60");

  const durationOptions = ["30", "60", "90", "120"];
  const timeSlots = useMemo(() => generateTimeSlots("09:00", "20:00", 30), []);

  // 1. VIEW MODE
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
                <p className="text-sm text-slate-700">
                  {lesson.duration
                    ? `${lesson.duration} minutes`
                    : "60 minutes"}
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
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 2. UPCOMING MODE (UPDATE)
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

    // PULL FROM DATABASE (Default to 0 if undefined for older lessons)
    const persistentColorId =
      lesson.color_id !== undefined && lesson.color_id !== null
        ? lesson.color_id
        : 0;
    const palette = colorPalettes[persistentColorId % colorPalettes.length];
    return (
      <>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (val) {
              setSelectedDate(d);
              setSelectedTime(format(d, "HH:mm"));
              setSelectedDuration(lesson.duration?.toString() || "60");
            }
          }}
        >
          <DialogTrigger
            className={`w-full text-left p-4 border rounded-xl transition-all cursor-pointer shadow-sm group ${palette.bg} ${palette.hover} ${palette.border}`}
          >
            <div className="flex justify-between items-start">
              <p className={`font-bold text-sm ${palette.text}`}>
                {lessonDateStr}
              </p>
              {lesson.duration && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${palette.badge}`}
                >
                  {lesson.duration}m
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5 mb-1">
              <Clock
                size={12}
                className={`${palette.accent} group-hover:scale-110 transition-transform`}
              />
              <p className={`text-xs font-medium ${palette.text}`}>
                {lessonTimeStr}
              </p>
            </div>
            <p className="text-xs text-slate-500 truncate">{lesson.topic}</p>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md w-[95%] p-6 max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogTitle className="text-xl font-bold text-slate-900 mb-2">
              Manage Lesson
            </DialogTitle>

            {/* BUTTONS MOVED TO THE VERY TOP */}
            <div className="flex gap-3 pb-4 mb-2 border-b border-slate-100">
              <Button
                type="submit"
                form={`update-form-${lesson.id}`}
                disabled={isSubmitting || !selectedDate || !selectedTime}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? "Wait..." : "Update Details"}
              </Button>

              <form
                action={(formData) => {
                  if (isSubmitting) return;
                  formData.append("lesson_id", lesson.id);
                  formData.append("student_id", studentId);
                  setPendingDeleteData(formData);
                  setAlertState({
                    isOpen: true,
                    status: "canceled",
                    title: "Lesson Canceled",
                    message: "The lesson has been permanently removed.",
                  });
                }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                  className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none flex items-center justify-center gap-2 h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarX2 size={16} />
                  {isSubmitting ? "Wait..." : "Cancel Lesson"}
                </Button>
              </form>
            </div>

            <form
              id={`update-form-${lesson.id}`}
              action={async (formData) => {
                if (isSubmitting || !selectedDate || !selectedTime) return;
                setIsSubmitting(true);
                try {
                  formData.append("lesson_id", lesson.id);
                  formData.append("student_id", studentId);

                  const newDatePart = format(selectedDate, "yyyy-MM-dd");
                  formData.append("date_part", newDatePart);
                  formData.append("time", selectedTime);
                  formData.append("duration", selectedDuration);
                  formData.append(
                    "utc_timestamp",
                    createUtcTimestamp(selectedDate, selectedTime),
                  );

                  // Capture the backend result
                  const result = await updateLessonTimeAction(formData);

                  if (result?.error) {
                    // Show the error in the custom alert without closing the modal
                    setAlertState({
                      isOpen: true,
                      status: "error",
                      title: "Scheduling Conflict",
                      message: result.error,
                    });
                  } else {
                    // Success! Close modal, reset time, and show the green alert
                    setOpen(false);
                    setSelectedTime(""); // Clear the time for the next booking
                    setAlertState({
                      isOpen: true,
                      status: "success",
                      title: "Lesson Updated!",
                      message: "The schedule has been successfully changed.",
                    });
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-6 pt-2"
            >
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <CalendarPlus className="mr-2 h-4 w-4 text-slate-500" />
                  Update Date
                </label>
                <div className="flex justify-center border border-slate-100 rounded-xl p-2 bg-slate-50/50 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateInPast}
                    className="bg-transparent"
                  />
                </div>
              </div>

              {selectedDate && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 flex items-center">
                      <Timer className="mr-2 h-4 w-4 text-slate-500" />
                      Update Duration
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {durationOptions.map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          className={`w-full h-10 text-xs sm:text-sm transition-all rounded-xl border flex items-center justify-center ${selectedDuration === dur ? "bg-indigo-600 text-white font-semibold border-indigo-600 shadow-md shadow-indigo-200/50" : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200"}`}
                          onClick={() => setSelectedDuration(dur)}
                        >
                          {dur}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-slate-500" />
                      Update Time
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
                      {timeSlots.map((slot) => {
                        const displayTime = format(
                          parse(slot, "HH:mm", new Date()),
                          "h:mm a",
                        );
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`w-full h-11 text-sm transition-all rounded-xl border flex items-center justify-center ${selectedTime === slot ? "bg-indigo-600 text-white font-semibold border-indigo-600 shadow-md shadow-indigo-200/50" : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200"}`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {displayTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
        <StatusAlert {...alertState} onClose={closeAlert} />
      </>
    );
  }

  // 3. DESKTOP SCHEDULE MODE
  if (mode === "schedule") {
    const buttonDate = new Date(year, month, day);
    const isPast = isDateInPast(buttonDate);
    const dateTitle = format(buttonDate, "MMMM d");

    return (
      <>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (val) {
              setSelectedTime("");
              setSelectedDuration("60");
            }
          }}
        >
          <DialogTrigger
            disabled={isPast}
            className={`h-20 w-full border rounded-xl flex items-center justify-center font-bold transition-all shadow-sm ${
              isPast
                ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed pointer-events-none"
                : "border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 cursor-pointer"
            }`}
          >
            {day}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogTitle>Schedule for {dateTitle}</DialogTitle>
            <form
              action={async (formData) => {
                if (isSubmitting || !selectedTime) return;
                setIsSubmitting(true);

                const dateStr = format(buttonDate, "yyyy-MM-dd");
                formData.append("date", dateStr);
                formData.append("time", selectedTime);
                formData.append("duration", selectedDuration);
                formData.append("student_id", studentId);
                formData.append(
                  "utc_timestamp",
                  createUtcTimestamp(buttonDate, selectedTime),
                );

                const result = await scheduleLessonAction(formData);
                setIsSubmitting(false);

                if (result?.error) {
                  setAlertState({
                    isOpen: true,
                    status: "error",
                    title: "Scheduling Conflict",
                    message: result.error,
                  });
                } else {
                  setOpen(false);
                  setAlertState({
                    isOpen: true,
                    status: "success",
                    title: "Lesson Scheduled!",
                    message: `Successfully booked for ${dateTitle} (${selectedDuration} mins).`,
                  });
                }
              }}
              className="space-y-6 pt-4"
            >
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <Timer className="mr-2 h-4 w-4 text-slate-500" />
                  Select Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {durationOptions.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      className={`w-full h-10 text-xs sm:text-sm transition-all rounded-xl border flex items-center justify-center ${
                        selectedDuration === dur
                          ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-md shadow-emerald-200/50"
                          : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200"
                      }`}
                      onClick={() => setSelectedDuration(dur)}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-slate-500" />
                  Select Time
                </label>
                <div className="max-h-[250px] overflow-y-scroll pr-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
                    {timeSlots.map((slot) => {
                      const displayTime = format(
                        parse(slot, "HH:mm", new Date()),
                        "h:mm a",
                      );
                      return (
                        <button
                          key={slot}
                          type="button"
                          className={`w-full h-11 text-sm transition-all rounded-xl border flex items-center justify-center ${
                            selectedTime === slot
                              ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-md shadow-emerald-200/50"
                              : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200"
                          }`}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {displayTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Booking..." : "Confirm Schedule"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <StatusAlert {...alertState} onClose={closeAlert} />
      </>
    );
  }

  // 4. MOBILE NATIVE SCHEDULE MODE
  if (mode === "mobile-schedule") {
    return (
      <>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (val) {
              setSelectedDate(undefined);
              setSelectedTime("");
              setSelectedDuration("60");
            }
          }}
        >
          <DialogTrigger className="w-full py-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <CalendarPlus size={20} /> Book New Lesson
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-[95%] max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Schedule Lesson
            </DialogTitle>
            <form
              action={async (formData) => {
                if (isSubmitting || !selectedDate || !selectedTime) return;
                setIsSubmitting(true);

                formData.append("student_id", studentId);
                formData.append("date", format(selectedDate, "yyyy-MM-dd"));
                formData.append("time", selectedTime);
                formData.append("duration", selectedDuration);
                formData.append(
                  "utc_timestamp",
                  createUtcTimestamp(selectedDate, selectedTime),
                );

                const result = await scheduleLessonAction(formData);
                setIsSubmitting(false);

                if (result?.error) {
                  setAlertState({
                    isOpen: true,
                    status: "error",
                    title: "Scheduling Conflict",
                    message: result.error,
                  });
                } else {
                  setOpen(false);
                  setAlertState({
                    isOpen: true,
                    status: "success",
                    title: "Lesson Scheduled!",
                    message: `The lesson (${selectedDuration} mins) has been successfully added to the calendar.`,
                  });
                }
              }}
              className="space-y-6 pt-2"
            >
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Step 1: Select Date
                </label>
                <div className="flex justify-center border border-slate-100 rounded-xl p-2 bg-slate-50/50 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateInPast}
                    className="bg-transparent"
                  />
                </div>
              </div>

              {selectedDate && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-100">
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center">
                      <Timer className="mr-2 h-4 w-4 text-slate-500" />
                      Step 2: Select Duration
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {durationOptions.map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          className={`w-full h-10 text-xs sm:text-sm transition-all rounded-xl border flex items-center justify-center ${
                            selectedDuration === dur
                              ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-md shadow-emerald-200/50"
                              : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200"
                          }`}
                          onClick={() => setSelectedDuration(dur)}
                        >
                          {dur}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <label className="text-sm font-medium text-slate-700 flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-slate-500" />
                      Step 3: Select Time
                    </label>
                    <div className="max-h-[200px] overflow-y-scroll pr-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
                        {timeSlots.map((slot) => {
                          const displayTime = format(
                            parse(slot, "HH:mm", new Date()),
                            "h:mm a",
                          );
                          return (
                            <button
                              key={slot}
                              type="button"
                              className={`w-full h-11 text-sm transition-all rounded-xl border flex items-center justify-center ${
                                selectedTime === slot
                                  ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-md shadow-emerald-200/50"
                                  : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200"
                              }`}
                              onClick={() => setSelectedTime(slot)}
                            >
                              {displayTime}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !selectedDate || !selectedTime}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? "Booking..." : "Confirm Schedule"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <StatusAlert {...alertState} onClose={closeAlert} />
      </>
    );
  }

  return null;
}
