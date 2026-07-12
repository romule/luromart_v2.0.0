// src/components/BookingForm.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import { submitBookingRequest } from "@/actions/booking";

export default function BookingForm() {
  const [date, setDate] = React.useState<Date>();
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState(""); // 1. Added phone state
  const [name, setName] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  async function handleSubmit() {
    // 2. Updated validation to require the phone number
    if (!email || !phone || !name || !date) {
      setMessage("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    // 3. Passing all 4 arguments to the server action!
    const result = await submitBookingRequest(
      email,
      phone,
      name,
      date.toISOString(),
    );

    setMessage(result.message);
    setIsSubmitting(false);

    if (result.success) {
      setEmail("");
      setPhone("");
      setName("");
      setDate(undefined);
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

        {/* 4. Added the new Phone Input Field */}
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
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        size="lg"
        className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-4"
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
