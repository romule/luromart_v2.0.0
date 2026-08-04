"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Clock, Timer, Users, Plus, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusAlert, { StatusAlertState } from "./StatusAlert";
import {
  generateTimeSlots,
  isDateInPast,
  createUtcTimestamp,
} from "@/lib/time-utils";
import { createGroupClassAction } from "@/actions/admin";

export default function AdminGroupClassForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<StatusAlertState>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [capacity, setCapacity] = useState("10");

  const timeSlots = useMemo(() => generateTimeSlots("09:00", "20:00", 30), []);
  const durationOptions = ["30", "60", "90", "120"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedDate || !selectedTime) {
      setAlertState({
        isOpen: true,
        status: "error",
        title: "Missing Fields",
        message: "Please fill out all fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("duration", duration);
      formData.append("max_capacity", capacity);
      formData.append(
        "utc_timestamp",
        createUtcTimestamp(selectedDate, selectedTime),
      );

      const result = await createGroupClassAction(formData);

      if (result?.error) {
        setAlertState({
          isOpen: true,
          status: "error",
          title: "Conflict Detected",
          message: result.error,
        });
      } else {
        setAlertState({
          isOpen: true,
          status: "success",
          title: "Class Created!",
          message: "The group class is now live and bookable.",
        });
        setTitle("");
        setSelectedDate(undefined);
        setSelectedTime("");
      }
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        status: "error",
        title: "System Error",
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" /> Class Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Watercolor Basics (Ages 8-12)"
            className="bg-background border-input text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center">
              <CalendarPlus className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
              Select Date
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
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Timer className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                  Duration & Capacity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* FIXED: Handles null values to satisfy TypeScript */}
                  <Select
                    value={duration}
                    onValueChange={(val) => val && setDuration(val)}
                  >
                    <SelectTrigger className="h-10 bg-background text-foreground">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((dur) => (
                        <SelectItem key={dur} value={dur}>
                          {dur} mins
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    min="1"
                    className="bg-background border-input text-foreground h-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                  Select Time
                </label>
                <div className="max-h-[160px] overflow-y-scroll pr-2 border border-border p-2 rounded-xl bg-muted/20">
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`w-full h-10 text-sm font-medium rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${selectedTime === slot ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background border-border hover:bg-muted text-foreground"}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !selectedDate || !selectedTime}
          className="w-full flex items-center justify-center gap-2 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg rounded-xl transition-colors cursor-pointer shadow-md"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}{" "}
          {isSubmitting ? "Creating..." : "Schedule Group Class"}
        </Button>
      </form>
      <StatusAlert
        {...alertState}
        onClose={() => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          router.refresh();
        }}
      />
    </>
  );
}
