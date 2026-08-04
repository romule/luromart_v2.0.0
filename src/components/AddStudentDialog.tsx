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
import { Plus, Loader2 } from "lucide-react";

export default function AddStudentDialog({
  defaultOpen = false,
  defaultSurname = "",
}: {
  defaultOpen?: boolean;
  defaultSurname?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAction(formData: FormData) {
    setIsSubmitting(true);
    await addStudentAction(formData);
    setIsSubmitting(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm cursor-pointer">
        <Plus className="w-4 h-4 mr-2" />
        Add Child
      </DialogTrigger>

      <DialogContent className="theme-dashboard bg-background border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register your Child</DialogTitle>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/90">
                First Name
              </label>
              <Input
                name="name"
                placeholder="E.g. Alex"
                required
                className="mt-1 bg-background border-input text-foreground focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/90">
                Last Name (Surname)
              </label>
              {/* Pre-fills with the parent's last name automatically */}
              <Input
                name="surname"
                defaultValue={defaultSurname}
                placeholder="E.g. Smith"
                required
                className="mt-1 bg-background border-input text-foreground focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/90">
              Date of Birth
            </label>
            <Input
              type="date"
              name="date_of_birth"
              required
              className="mt-1 bg-background border-input text-foreground focus-visible:ring-ring cursor-pointer"
            />
          </div>

          <input type="hidden" name="experience_level" value="Beginner" />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer mt-4"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : null}
            Register Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
