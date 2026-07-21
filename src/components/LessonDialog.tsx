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
  getAvailableGroupClassesAction,
  joinGroupClassAction,
} from "@/actions/lessons";

import {
  Clock,
  CalendarX2,
  CalendarPlus,
  Globe,
  Timer,
  User,
  Users,
} from "lucide-react";

import {
  generateTimeSlots,
  isDateInPast,
  createUtcTimestamp,
} from "@/lib/time-utils";

import StatusAlert, { StatusAlertState } from "./StatusAlert";

// 🎨 Updated palettes specifically balanced for Dark Mode
const colorPalettes = [
  {
    bg: "bg-blue-50/80 dark:bg-blue-500/10",
    hover: "hover:bg-blue-100/80 dark:hover:bg-blue-500/20",
    border: "border-blue-200 dark:border-blue-500/30",
    text: "text-blue-900 dark:text-blue-200",
    accent: "text-blue-500 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-200",
  },
  {
    bg: "bg-emerald-50/80 dark:bg-emerald-500/10",
    hover: "hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20",
    border: "border-emerald-200 dark:border-emerald-500/30",
    text: "text-emerald-900 dark:text-emerald-200",
    accent: "text-emerald-500 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-200",
  },
  {
    bg: "bg-amber-50/80 dark:bg-amber-500/10",
    hover: "hover:bg-amber-100/80 dark:hover:bg-amber-500/20",
    border: "border-amber-200 dark:border-amber-500/30",
    text: "text-amber-900 dark:text-amber-200",
    accent: "text-amber-500 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-500/30 text-amber-700 dark:text-amber-200",
  },
  {
    bg: "bg-fuchsia-50/80 dark:bg-fuchsia-500/10",
    hover: "hover:bg-fuchsia-100/80 dark:hover:bg-fuchsia-500/20",
    border: "border-fuchsia-200 dark:border-fuchsia-500/30",
    text: "text-fuchsia-900 dark:text-fuchsia-200",
    accent: "text-fuchsia-500 dark:text-fuchsia-400",
    badge:
      "bg-fuchsia-100 dark:bg-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-200",
  },
  {
    bg: "bg-cyan-50/80 dark:bg-cyan-500/10",
    hover: "hover:bg-cyan-100/80 dark:hover:bg-cyan-500/20",
    border: "border-cyan-200 dark:border-cyan-500/30",
    text: "text-cyan-900 dark:text-cyan-200",
    accent: "text-cyan-500 dark:text-cyan-400",
    badge: "bg-cyan-100 dark:bg-cyan-500/30 text-cyan-700 dark:text-cyan-200",
  },
  {
    bg: "bg-rose-50/80 dark:bg-rose-500/10",
    hover: "hover:bg-rose-100/80 dark:hover:bg-rose-500/20",
    border: "border-rose-200 dark:border-rose-500/30",
    text: "text-rose-900 dark:text-rose-200",
    accent: "text-rose-500 dark:text-rose-400",
    badge: "bg-rose-100 dark:bg-rose-500/30 text-rose-700 dark:text-rose-200",
  },
  {
    bg: "bg-violet-50/80 dark:bg-violet-500/10",
    hover: "hover:bg-violet-100/80 dark:hover:bg-violet-500/20",
    border: "border-violet-200 dark:border-violet-500/30",
    text: "text-violet-900 dark:text-violet-200",
    accent: "text-violet-500 dark:text-violet-400",
    badge:
      "bg-violet-100 dark:bg-violet-500/30 text-violet-700 dark:text-violet-200",
  },
  {
    bg: "bg-orange-50/80 dark:bg-orange-500/10",
    hover: "hover:bg-orange-100/80 dark:hover:bg-orange-500/20",
    border: "border-orange-200 dark:border-orange-500/30",
    text: "text-orange-900 dark:text-orange-200",
    accent: "text-orange-500 dark:text-orange-400",
    badge:
      "bg-orange-100 dark:bg-orange-500/30 text-orange-700 dark:text-orange-200",
  },
  {
    bg: "bg-teal-50/80 dark:bg-teal-500/10",
    hover: "hover:bg-teal-100/80 dark:hover:bg-teal-500/20",
    border: "border-teal-200 dark:border-teal-500/30",
    text: "text-teal-900 dark:text-teal-200",
    accent: "text-teal-500 dark:text-teal-400",
    badge: "bg-teal-100 dark:bg-teal-500/30 text-teal-700 dark:text-teal-200",
  },
  {
    bg: "bg-pink-50/80 dark:bg-pink-500/10",
    hover: "hover:bg-pink-100/80 dark:hover:bg-pink-500/20",
    border: "border-pink-200 dark:border-pink-500/30",
    text: "text-pink-900 dark:text-pink-200",
    accent: "text-pink-500 dark:text-pink-400",
    badge: "bg-pink-100 dark:bg-pink-500/30 text-pink-700 dark:text-pink-200",
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
  const [lessonType, setLessonType] = useState<"individual" | "group" | null>(
    null,
  );
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
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

  const handleSelectGroupPath = async () => {
    setLessonType("group");
    setIsLoadingGroups(true);
    const result = await getAvailableGroupClassesAction();
    if (result?.data) {
      setAvailableGroups(result.data);
    }
    setIsLoadingGroups(false);
  };

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("60");

  const durationOptions = ["30", "60", "90", "120"];
  const timeSlots = useMemo(() => generateTimeSlots("09:00", "20:00", 30), []);

  // 1. VIEW MODE (HISTORY)
  if (mode === "view") {
    const d = new Date(lesson.lesson_date);
    const lessonDate = d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const lessonTime = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-full p-4 text-left border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm bg-slate-50 dark:bg-slate-900 group cursor-pointer flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {lessonDate}
            </p>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400 dark:text-slate-500" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {lessonTime}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-0.5">
            Done
          </span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md dark:bg-slate-950 dark:border-slate-800">
          <DialogTitle className="text-xl border-b border-slate-200 dark:border-slate-800 pb-4 text-slate-900 dark:text-slate-100">
            Lesson Details
          </DialogTitle>
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Date & Time
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {lessonDate}
                  <br />
                  {lessonTime}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Duration
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {lesson.duration
                    ? `${lesson.duration} minutes`
                    : "60 minutes"}
                </p>
              </div>
            </div>
            {lesson.teacher_notes && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  Teacher Notes
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                  {lesson.teacher_notes}
                </div>
              </div>
            )}
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

    const nowMs = Date.now();
    const startMs = d.getTime();
    const endMs = startMs + (lesson.duration || 60) * 60000;
    const isOngoing = nowMs >= startMs && nowMs < endMs;

    const persistentColorId =
      lesson.color_id !== undefined && lesson.color_id !== null
        ? lesson.color_id
        : 0;
    const palette = colorPalettes[persistentColorId % colorPalettes.length];

    const cardClasses = isOngoing
      ? "w-full text-left p-4 rounded-xl transition-all cursor-pointer shadow-md group border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/20"
      : `w-full text-left p-4 border rounded-xl transition-all cursor-pointer shadow-sm group ${palette.bg} ${palette.hover} ${palette.border}`;

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
          <DialogTrigger className={cardClasses}>
            <div className="flex justify-between items-start">
              <p
                className={`font-bold text-sm ${isOngoing ? "text-indigo-700 dark:text-indigo-300" : palette.text}`}
              >
                {isOngoing ? "ONGOING / PENDING" : lessonDateStr}
              </p>
              {lesson.duration && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOngoing ? "bg-indigo-200 dark:bg-indigo-500/30 text-indigo-800 dark:text-indigo-200" : palette.badge}`}
                >
                  {lesson.duration}m
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5 mb-1">
              <Clock
                size={12}
                className={`${isOngoing ? "text-indigo-500 dark:text-indigo-400 animate-pulse" : palette.accent} group-hover:scale-110 transition-transform`}
              />
              <p
                className={`text-xs font-medium ${isOngoing ? "text-indigo-700 dark:text-indigo-300" : palette.text}`}
              >
                {lessonTimeStr}
              </p>
            </div>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md w-[95%] p-6 max-h-[90vh] overflow-y-auto rounded-xl dark:bg-slate-950 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Manage Lesson
            </DialogTitle>

            <div className="flex gap-3 pb-4 mb-2 border-b border-slate-100 dark:border-slate-800">
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
                  className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 border-none shadow-none flex items-center justify-center gap-2 h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

                  const result = await updateLessonTimeAction(formData);

                  if (result?.error) {
                    setAlertState({
                      isOpen: true,
                      status: "error",
                      title: "Scheduling Conflict",
                      message: result.error,
                    });
                  } else {
                    setOpen(false);
                    setSelectedTime("");
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
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                  <CalendarPlus className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Update Date
                </label>
                <div className="flex justify-center border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateInPast}
                    className="bg-transparent dark:text-slate-100"
                  />
                </div>
              </div>

              {selectedDate && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                      <Timer className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Update Duration
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {durationOptions.map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          className={`w-full h-10 text-xs sm:text-sm transition-all rounded-xl border flex items-center justify-center ${selectedDuration === dur ? "bg-indigo-600 text-white font-semibold border-indigo-600 shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/50" : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                          onClick={() => setSelectedDuration(dur)}
                        >
                          {dur}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
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
                            className={`w-full h-11 text-sm transition-all rounded-xl border flex items-center justify-center ${selectedTime === slot ? "bg-indigo-600 text-white font-semibold border-indigo-600 shadow-md shadow-indigo-200/50 dark:shadow-indigo-900/50" : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
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

  // 4. GLOBAL SCHEDULE MODE (Individual & Group Router)
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
              setLessonType(null);
            }
          }}
        >
          <DialogTrigger className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-md">
            <CalendarPlus size={20} /> Schedule Lesson
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-[95%] max-h-[90vh] overflow-y-auto rounded-xl dark:bg-slate-950 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {lessonType === "individual"
                ? "Schedule Individual Lesson"
                : lessonType === "group"
                  ? "Join Group Class"
                  : "Select Lesson Type"}
            </DialogTitle>

            {!lessonType && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setLessonType("individual")}
                  className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                    <User
                      className="text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      size={24}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                      1-on-1 Lesson
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Book a private session
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleSelectGroupPath}
                  className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                    <Users
                      className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                      size={24}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                      Group Class
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Join an upcoming group
                    </p>
                  </div>
                </button>
              </div>
            )}

            {lessonType === "individual" && (
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
                      title: "Conflict",
                      message: result.error,
                    });
                  } else {
                    setOpen(false);
                    setAlertState({
                      isOpen: true,
                      status: "success",
                      title: "Scheduled!",
                      message: "Added to calendar.",
                    });
                  }
                }}
                className="space-y-6 pt-2"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Step 1: Select Date
                  </label>
                  <div className="flex justify-center border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateInPast}
                      className="bg-transparent dark:text-slate-100"
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <Timer className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                        Step 2: Select Duration
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {durationOptions.map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            className={`w-full h-10 text-xs sm:text-sm transition-all rounded-xl border flex items-center justify-center ${selectedDuration === dur ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/50" : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                            onClick={() => setSelectedDuration(dur)}
                          >
                            {dur}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
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
                                className={`w-full h-11 text-sm transition-all rounded-xl border flex items-center justify-center ${selectedTime === slot ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/50" : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
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

                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLessonType(null)}
                    className="h-12 px-4 rounded-xl text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedDate || !selectedTime}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isSubmitting ? "Booking..." : "Confirm Schedule"}
                  </Button>
                </div>
              </form>
            )}

            {lessonType === "group" && (
              <div className="flex flex-col py-4 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Available Classes
                </h3>

                {isLoadingGroups ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">
                      Fetching schedule...
                    </p>
                  </div>
                ) : availableGroups.length > 0 ? (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {availableGroups.map((group) => {
                      const d = new Date(group.class_date);
                      const dateStr = d.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                      const timeStr = d.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={group.id}
                          className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors"
                        >
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">
                              {group.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                <CalendarPlus size={12} /> {dateStr}
                              </div>
                              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Clock size={12} /> {timeStr}
                              </div>
                              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Timer size={12} /> {group.duration}m
                              </div>
                            </div>
                          </div>

                          <form
                            action={async (formData) => {
                              if (isSubmitting) return;
                              setIsSubmitting(true);

                              formData.append("student_id", studentId);
                              formData.append("group_class_id", group.id);
                              formData.append("class_date", group.class_date);
                              formData.append(
                                "duration",
                                group.duration.toString(),
                              );
                              formData.append("title", group.title);

                              const result =
                                await joinGroupClassAction(formData);
                              setIsSubmitting(false);

                              if (result?.error) {
                                setAlertState({
                                  isOpen: true,
                                  status: "error",
                                  title: "Enrollment Failed",
                                  message: result.error,
                                });
                              } else {
                                setOpen(false);
                                setAlertState({
                                  isOpen: true,
                                  status: "success",
                                  title: "Successfully Enrolled!",
                                  message: `Joined ${group.title} on ${dateStr}.`,
                                });
                              }
                            }}
                          >
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 shadow-md"
                            >
                              {isSubmitting ? "Joining..." : "Join Class"}
                            </Button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Users
                      size={32}
                      className="text-slate-300 dark:text-slate-600 mb-2"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No group classes are currently scheduled.
                    </p>
                  </div>
                )}

                <div className="w-full pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLessonType(null)}
                    className="h-11 px-6 rounded-xl text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <StatusAlert {...alertState} onClose={closeAlert} />
      </>
    );
  }

  return null;
}
