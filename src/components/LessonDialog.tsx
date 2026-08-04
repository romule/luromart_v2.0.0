"use client";

import { useState, useMemo } from "react";
import { format, parse } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
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

const colorPalettes = [
  {
    bg: "bg-blue-50/80 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/30",
    text: "text-blue-900 dark:text-blue-200",
    accent: "text-blue-500 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-200",
  },
  {
    bg: "bg-emerald-50/80 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    text: "text-emerald-900 dark:text-emerald-200",
    accent: "text-emerald-500 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-200",
  },
  {
    bg: "bg-amber-50/80 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    text: "text-amber-900 dark:text-amber-200",
    accent: "text-amber-500 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-500/30 text-amber-700 dark:text-amber-200",
  },
  {
    bg: "bg-fuchsia-50/80 dark:bg-fuchsia-500/10",
    border: "border-fuchsia-200 dark:border-fuchsia-500/30",
    text: "text-fuchsia-900 dark:text-fuchsia-200",
    accent: "text-fuchsia-500 dark:text-fuchsia-400",
    badge:
      "bg-fuchsia-100 dark:bg-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-200",
  },
  {
    bg: "bg-cyan-50/80 dark:bg-cyan-500/10",
    border: "border-cyan-200 dark:border-cyan-500/30",
    text: "text-cyan-900 dark:text-cyan-200",
    accent: "text-cyan-500 dark:text-cyan-400",
    badge: "bg-cyan-100 dark:bg-cyan-500/30 text-cyan-700 dark:text-cyan-200",
  },
  {
    bg: "bg-rose-50/80 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/30",
    text: "text-rose-900 dark:text-rose-200",
    accent: "text-rose-500 dark:text-rose-400",
    badge: "bg-rose-100 dark:bg-rose-500/30 text-rose-700 dark:text-rose-200",
  },
];

export default function LessonDialog({
  lesson,
  mode,
  studentId,
  studentName,
}: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lessonType, setLessonType] = useState<"individual" | "group" | null>(
    null,
  );
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertState, setAlertState] = useState<StatusAlertState>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    setOpen(false);
    router.refresh();
  };

  const handleSelectGroupPath = async () => {
    setLessonType("group");
    setIsLoadingGroups(true);
    const result = await getAvailableGroupClassesAction();
    if (result?.data) setAvailableGroups(result.data);
    setIsLoadingGroups(false);
  };

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("60");

  const durationOptions = ["30", "60", "90", "120"];
  const timeSlots = useMemo(() => generateTimeSlots("09:00", "20:00", 30), []);

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
        <DialogTrigger className="w-full p-4 text-left border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm bg-slate-50 dark:bg-slate-900 group cursor-pointer flex justify-between items-center">
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
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {lesson.duration}m
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Done
            </span>
          </div>
        </DialogTrigger>
        <DialogContent className="theme-dashboard sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl border-b border-border pb-4">
              Lesson Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Date & Time
                </h4>
                <p className="text-sm font-medium">
                  {lessonDate}
                  <br />
                  {lessonTime}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Duration
                </h4>
                <p className="text-sm font-medium">
                  {lesson.duration
                    ? `${lesson.duration} minutes`
                    : "60 minutes"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
    const isPending = lesson.status === "pending";

    const persistentColorId =
      lesson.color_id !== undefined && lesson.color_id !== null
        ? lesson.color_id
        : 0;
    const palette = colorPalettes[persistentColorId % colorPalettes.length];

    const pendingPalette = {
      bg: "bg-slate-50 dark:bg-slate-900/50",
      border: "border-slate-300 dark:border-slate-700 border-dashed",
      text: "text-slate-600 dark:text-slate-300",
      accent: "text-slate-400 dark:text-slate-500",
      badge:
        "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    };

    const activePalette = isPending ? pendingPalette : palette;
    const cardClasses = isOngoing
      ? "w-full text-left rounded-xl transition-all cursor-pointer shadow-md group border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/20 overflow-hidden"
      : `w-full text-left border rounded-xl transition-all cursor-pointer shadow-sm group overflow-hidden ${activePalette.bg} ${activePalette.border} hover:opacity-80`;

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
            {studentName ? (
              <div className="flex items-stretch w-full">
                <div
                  className={`w-1/4 min-w-[80px] p-3 flex flex-col justify-center items-center border-r ${isOngoing ? "border-indigo-200 dark:border-indigo-500/30" : isPending ? "border-slate-200 dark:border-slate-700 bg-slate-100/30 dark:bg-slate-800/30" : palette.border + " bg-black/5 dark:bg-white/5"}`}
                >
                  <p
                    className={`font-extrabold text-xs sm:text-sm text-center truncate w-full ${isOngoing ? "text-indigo-800 dark:text-indigo-200" : activePalette.text}`}
                    title={studentName}
                  >
                    {studentName}
                  </p>
                </div>
                <div className="flex-1 flex justify-between items-center w-3/4 p-3 sm:p-4">
                  <div className="flex flex-col">
                    <p
                      className={`font-bold text-sm ${isOngoing ? "text-indigo-700 dark:text-indigo-300" : activePalette.text}`}
                    >
                      {isOngoing ? "ONGOING" : lessonDateStr}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 mb-1">
                      <Clock
                        size={12}
                        className={`${isOngoing ? "text-indigo-500 dark:text-indigo-400 animate-pulse" : activePalette.accent}`}
                      />
                      <p
                        className={`text-xs font-medium ${isOngoing ? "text-indigo-700 dark:text-indigo-300" : activePalette.text}`}
                      >
                        {lessonTimeStr}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {lesson.duration && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOngoing ? "bg-indigo-200 dark:bg-indigo-500/30 text-indigo-800 dark:text-indigo-200" : activePalette.badge}`}
                      >
                        {lesson.duration}m
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPending ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" : "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-200"}`}
                    >
                      {isPending ? "Pending" : "Scheduled"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center w-full p-4">
                <div className="flex flex-col gap-1 text-left">
                  <p
                    className={`font-bold text-sm ${isOngoing ? "text-indigo-700 dark:text-indigo-300" : activePalette.text}`}
                  >
                    {isOngoing ? "ONGOING" : lessonDateStr}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock
                      size={12}
                      className={`${isOngoing ? "text-indigo-500 dark:text-indigo-400 animate-pulse" : activePalette.accent}`}
                    />
                    <p
                      className={`text-xs font-medium ${isOngoing ? "text-indigo-700 dark:text-indigo-300" : activePalette.text}`}
                    >
                      {lessonTimeStr}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {lesson.duration && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOngoing ? "bg-indigo-200 dark:bg-indigo-500/30 text-indigo-800 dark:text-indigo-200" : activePalette.badge}`}
                    >
                      {lesson.duration}m
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPending ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" : "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-200"}`}
                  >
                    {isPending ? "Pending" : "Scheduled"}
                  </span>
                </div>
              </div>
            )}
          </DialogTrigger>

          <DialogContent className="theme-dashboard sm:max-w-2xl w-[95%] p-6 max-h-[90vh] overflow-y-auto rounded-xl bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-2">
                Manage Lesson
              </DialogTitle>
            </DialogHeader>
            <div className="flex gap-3 pb-4 mb-2 border-b border-border">
              <Button
                type="submit"
                form={`update-form-${lesson.id}`}
                disabled={isSubmitting || !selectedDate || !selectedTime}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl shadow-md cursor-pointer"
              >
                {isSubmitting ? "Wait..." : "Update Details"}
              </Button>
              <form
                action={async (formData) => {
                  if (isSubmitting) return;
                  setIsSubmitting(true);
                  formData.append("lesson_id", lesson.id);
                  formData.append("student_id", studentId);
                  const result = await cancelLessonAction(formData);
                  setIsSubmitting(false);
                  if (result?.error)
                    setAlertState({
                      isOpen: true,
                      status: "error",
                      title: "Error",
                      message: result.error,
                    });
                  else
                    setAlertState({
                      isOpen: true,
                      status: "canceled",
                      title: "Canceled",
                      message: "Lesson has been canceled.",
                    });
                }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl cursor-pointer"
                >
                  <CalendarX2 size={16} className="mr-2" /> Cancel
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
                  formData.append(
                    "date_part",
                    format(selectedDate, "yyyy-MM-dd"),
                  );
                  formData.append("time", selectedTime);
                  formData.append("duration", selectedDuration);
                  formData.append(
                    "utc_timestamp",
                    createUtcTimestamp(selectedDate, selectedTime),
                  );
                  const result = await updateLessonTimeAction(formData);
                  if (result?.error)
                    setAlertState({
                      isOpen: true,
                      status: "error",
                      title: "Conflict",
                      message: result.error,
                    });
                  else
                    setAlertState({
                      isOpen: true,
                      status: "success",
                      title: "Updated!",
                      message: "Schedule changed.",
                    });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-6 pt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center text-foreground">
                    <CalendarPlus className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                    Update Date
                  </label>
                  <div className="flex justify-center border border-border rounded-xl p-2 bg-muted/50 shadow-sm">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateInPast}
                      className="bg-transparent cursor-pointer text-foreground"
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div className="space-y-6 animate-in fade-in transition-all duration-300">
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center text-foreground">
                        <Timer className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                        Update Duration
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {durationOptions.map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setSelectedDuration(dur)}
                            className={`w-full h-10 text-sm font-medium rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${selectedDuration === dur ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background border-border hover:bg-muted text-foreground"}`}
                          >
                            {dur}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center text-foreground">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                        Update Time
                      </label>
                      <div className="max-h-[160px] overflow-y-scroll pr-2 border border-border bg-muted/20 p-2 rounded-xl">
                        <div className="grid grid-cols-2 gap-2 pb-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`w-full h-10 text-sm font-medium rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${selectedTime === slot ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background border-border hover:bg-muted text-foreground"}`}
                            >
                              {format(
                                parse(slot, "HH:mm", new Date()),
                                "h:mm a",
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <StatusAlert {...alertState} onClose={closeAlert} />
      </>
    );
  }

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
          <DialogTrigger className="w-full sm:w-auto h-11 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap">
            <CalendarPlus size={18} /> Schedule Lesson
          </DialogTrigger>

          <DialogContent className="theme-dashboard sm:max-w-3xl w-[95%] max-h-[90vh] overflow-y-auto rounded-xl bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Select Lesson Type
              </DialogTitle>
            </DialogHeader>
            {!lessonType && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setLessonType("individual")}
                  className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-border rounded-2xl hover:border-primary hover:bg-muted group cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User
                      className="text-muted-foreground group-hover:text-primary"
                      size={24}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-foreground">1-on-1 Lesson</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Book a private session
                    </p>
                  </div>
                </button>
                <button
                  onClick={handleSelectGroupPath}
                  className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-border rounded-2xl hover:border-primary hover:bg-muted group cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users
                      className="text-muted-foreground group-hover:text-primary"
                      size={24}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-foreground">Group Class</h3>
                    <p className="text-xs text-muted-foreground mt-1">
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
                  try {
                    formData.append("student_id", studentId);
                    formData.append("date", format(selectedDate, "yyyy-MM-dd"));
                    formData.append("time", selectedTime);
                    formData.append("duration", selectedDuration);
                    formData.append(
                      "utc_timestamp",
                      createUtcTimestamp(selectedDate, selectedTime),
                    );
                    const result = await scheduleLessonAction(formData);
                    if (result?.error)
                      setAlertState({
                        isOpen: true,
                        status: "error",
                        title: "Conflict",
                        message: result.error,
                      });
                    else
                      setAlertState({
                        isOpen: true,
                        status: "success",
                        title: "Request Sent!",
                        message: "The lesson is pending admin approval.",
                      });
                  } catch (err: any) {
                    setAlertState({
                      isOpen: true,
                      status: "error",
                      title: "System Error",
                      message: err.message || "An error occurred.",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-6 pt-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Step 1: Select Date
                    </label>
                    <div className="flex justify-center border border-border rounded-xl p-2 bg-muted/50 shadow-sm">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateInPast}
                        className="bg-transparent cursor-pointer text-foreground"
                      />
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="space-y-6 animate-in fade-in transition-all duration-300">
                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center text-foreground">
                          <Timer className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                          Step 2: Select Duration
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {durationOptions.map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setSelectedDuration(dur)}
                              className={`w-full h-10 text-sm font-medium rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${selectedDuration === dur ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background border-border hover:bg-muted text-foreground"}`}
                            >
                              {dur}m
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center text-foreground">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                          Step 3: Select Time
                        </label>
                        <div className="max-h-[160px] overflow-y-scroll pr-2 border border-border bg-muted/20 p-2 rounded-xl">
                          <div className="grid grid-cols-2 gap-2 pb-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTime(slot)}
                                className={`w-full h-10 text-sm font-medium rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${selectedTime === slot ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background border-border hover:bg-muted text-foreground"}`}
                              >
                                {format(
                                  parse(slot, "HH:mm", new Date()),
                                  "h:mm a",
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4 border-t border-border mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLessonType(null)}
                    className="h-12 px-6 rounded-xl border-border hover:bg-muted cursor-pointer text-foreground"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedDate || !selectedTime}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg rounded-xl shadow-md cursor-pointer"
                  >
                    {isSubmitting ? "Sending..." : "Request Schedule"}
                  </Button>
                </div>
              </form>
            )}

            {lessonType === "group" && (
              <div className="flex flex-col py-4 space-y-4">
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  Available Classes
                </h3>
                {isLoadingGroups ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-muted-foreground mt-4 font-medium">
                      Fetching schedule...
                    </p>
                  </div>
                ) : availableGroups.length > 0 ? (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {availableGroups.map((group) => {
                      const d = new Date(group.class_date);
                      return (
                        <div
                          key={group.id}
                          className="p-4 border border-border rounded-xl bg-background shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary transition-colors"
                        >
                          <div>
                            <h4 className="font-bold text-foreground">
                              {group.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarPlus size={12} />{" "}
                                {d.toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />{" "}
                                {d.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Timer size={12} /> {group.duration}m
                              </span>
                            </div>
                          </div>
                          <form
                            action={async (formData) => {
                              if (isSubmitting) return;
                              setIsSubmitting(true);
                              try {
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
                                if (result?.error)
                                  setAlertState({
                                    isOpen: true,
                                    status: "error",
                                    title: "Enrollment Failed",
                                    message: result.error,
                                  });
                                else
                                  setAlertState({
                                    isOpen: true,
                                    status: "success",
                                    title: "Successfully Enrolled!",
                                    message: `Joined ${group.title}.`,
                                  });
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                          >
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 shadow-md cursor-pointer"
                            >
                              {isSubmitting ? "Joining..." : "Join Class"}
                            </Button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-muted/50 rounded-xl border border-dashed border-border">
                    <Users
                      size={32}
                      className="text-muted-foreground/50 mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      No group classes are currently scheduled.
                    </p>
                  </div>
                )}
                <div className="w-full pt-4 mt-2 border-t border-border flex justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLessonType(null)}
                    className="h-11 px-6 rounded-xl border-border hover:bg-muted cursor-pointer text-foreground"
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
