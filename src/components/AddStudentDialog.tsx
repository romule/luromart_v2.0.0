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
import { Plus } from "lucide-react";

export default function AddStudentDialog({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  async function handleAction(formData: FormData) {
    await addStudentAction(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2">
        <Plus className="w-4 h-4 mr-2" />
        Add Student
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
            {/* Replaced Input with a native Select dropdown to protect data integrity */}
            <select
              name="experience_level"
              defaultValue="Beginner"
              required
              className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Save Student
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
