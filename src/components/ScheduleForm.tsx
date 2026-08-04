"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { scheduleLessonAction } from "@/actions/lessons";
import { generateTimeSlots, createUtcTimestamp } from "@/lib/time-utils";
import { Clock, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";

export default function ScheduleForm({ lesson, mode, day, studentId }: any) {
  const [open, setOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate our clickable 30-minute intervals
  const timeSlots = useMemo(() => generateTimeSlots("09:00", "20:00", 30), []);

  if (mode === "view") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted transition-all text-foreground">
          <p className="font-bold text-sm">{lesson.topic}</p>
        </DialogTrigger>
        <DialogContent className="theme-dashboard bg-background border-border text-foreground">
          <DialogTitle>Lesson Details</DialogTitle>
          <p className="text-muted-foreground">
            {lesson.teacher_notes || "No notes provided."}
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // Calendar Schedule Mode
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setSelectedTime("");
      }}
    >
      <DialogTrigger className="h-20 border border-border rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center justify-center font-bold text-foreground">
        {day}
      </DialogTrigger>
      <DialogContent className="theme-dashboard bg-background border-border text-foreground">
        <DialogTitle>Schedule for July {day}</DialogTitle>
        <form
          action={async (formData) => {
            if (!selectedTime) return;
            setIsSubmitting(true);

            // Generate the date based on the legacy day prop
            const mockDate = new Date(`2026-07-${day}T12:00:00`);

            formData.append("date", `2026-07-${day}`);
            formData.append("time", selectedTime);
            formData.append("student_id", studentId);
            formData.append(
              "utc_timestamp",
              createUtcTimestamp(mockDate, selectedTime),
            );

            await scheduleLessonAction(formData);

            setIsSubmitting(false);
            setOpen(false);
          }}
          className="space-y-6 pt-2"
        >
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center text-foreground">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> Select
              Time
            </label>
            <div className="max-h-[200px] overflow-y-scroll pr-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`w-full h-11 text-sm font-medium rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedTime === slot
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-background border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {format(parse(slot, "HH:mm", new Date()), "h:mm a")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !selectedTime}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : null}
            Confirm Schedule
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
