// src/components/BookingForm.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export default function BookingForm() {
  // This stores the currently selected date in the component's memory
  const [date, setDate] = React.useState<Date>();

  return (
    <div className="mx-auto w-full max-w-md space-y-6 text-left mt-8">
      {/* Task 102.3: Parent & Student Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Parent's Email
          </label>
          <Input placeholder="name@example.com" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Student's Name
          </label>
          <Input placeholder="Jane Doe" />
        </div>
      </div>

      {/* Task 102.4: The Date Picker */}
      <div className="space-y-2 flex flex-col">
        <label className="text-sm font-medium text-slate-700">
          Select First Lesson Date
        </label>
        <Popover>
          {/* Tell TypeScript to ignore the React 19 mismatch for the popup trigger */}
          {/* @ts-ignore */}
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
              /* We removed initialFocus here because the new version doesn't need it */
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        size="lg"
        className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-4"
      >
        Confirm Request
      </Button>
    </div>
  );
}
