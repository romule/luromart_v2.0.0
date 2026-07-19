"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Clock } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import { submitBookingRequest } from "@/actions/booking";

// 1. Import our new bulletproof Time Engine tools
import {
  generateTimeSlots,
  isDateInPast,
  createUtcTimestamp,
} from "@/lib/time-utils";

export default function BookingForm() {
  const [date, setDate] = React.useState<Date>();
  const [time, setTime] = React.useState<string>(""); // Added state for the slot grid

  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  // 2. Generate our clickable 30-minute intervals
  const timeSlots = React.useMemo(
    () => generateTimeSlots("09:00", "20:00", 30),
    [],
  );

  async function handleSubmit() {
    // Require the time slot to be selected
    if (!email || !phone || !name || !date || !time) {
      setMessage("Please fill out all fields and select a time.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    // 3. Combine the calendar Date and the Grid time into a strict Atlantic->UTC string
    const safeUtcTimestamp = createUtcTimestamp(date, time);

    const result = await submitBookingRequest(
      email,
      phone,
      name,
      safeUtcTimestamp, // Pass the drift-proof timestamp
    );

    setMessage(result.message);
    setIsSubmitting(false);

    if (result.success) {
      setEmail("");
      setPhone("");
      setName("");
      setDate(undefined);
      setTime(""); // Reset time state
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 text-left mt-8">
      {message && (
        <div
          className={`p-3 text-sm rounded-md ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Parent's Email
          </label>
          <Input
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Parent's Phone
          </label>
          <Input
            placeholder="(902) 555-0123"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Student's Name
          </label>
          <Input
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="space-y-2 flex flex-col">
        <label className="text-sm font-medium text-slate-700">
          Select First Lesson Date
        </label>
        <Popover>
          <PopoverTrigger
            className={buttonVariants({
              variant: "outline",
              className: `w-full justify-start text-left font-normal ${!date ? "text-slate-500" : ""}`,
            })}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={isDateInPast} // 4. Automatically blocks all past dates!
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* 5. Custom Slot Grid UI - Only renders after a date is picked */}
      {date && (
        <div className="space-y-3 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-sm font-medium text-slate-700 flex items-center">
            <Clock className="mr-2 h-4 w-4 text-slate-500" />
            Select Time
          </label>

          {/* Scrollable grid for mobile friendliness */}
          <div className="max-h-60 overflow-y-auto pr-2 rounded-md">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={time === slot ? "default" : "outline"}
                  className={`w-full transition-all ${
                    time === slot
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-600 ring-offset-1"
                      : "text-slate-600 hover:text-slate-900 hover:border-slate-400"
                  }`}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 mt-4"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Confirm Request"
        )}
      </Button>
    </div>
  );
}
