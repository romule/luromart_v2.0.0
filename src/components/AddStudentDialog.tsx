"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addStudentAction } from "@/actions/students";

export default function AddStudentDialog({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  async function handleAction(formData: FormData) {
    await addStudentAction(formData);
    setOpen(false); // Close the modal on success
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* FIX: Removed 'asChild' and the nested <Button>. 
        We pass the standard button classes directly to the Trigger so it handles its own refs securely. 
      */}
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2">
        Add New Student
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register a Student</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Student's Full Name
            </label>
            <Input
              name="name"
              placeholder="E.g. Alex"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Experience Level
            </label>
            <Input
              name="experience_level"
              defaultValue="Beginner"
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Student
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
