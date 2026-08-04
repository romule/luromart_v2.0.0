"use client";

import { useActionState } from "react";
import { createLessonAction } from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function LessonLogForm({ studentId }: { studentId: string }) {
  const [state, action, isPending] = useActionState(createLessonAction, null);

  return (
    <form
      action={action}
      className="space-y-4 p-6 border border-border rounded-xl bg-card shadow-sm mt-6 text-foreground"
    >
      <input type="hidden" name="student_id" value={studentId} />
      <h3 className="font-semibold text-lg md:text-xl text-foreground">
        Log New Lesson
      </h3>

      <Input
        name="topic"
        placeholder="Lesson Topic"
        required
        className="bg-background border-input text-foreground"
      />
      <Textarea
        name="notes"
        placeholder="Teacher notes..."
        className="bg-background border-input text-foreground"
      />
      <Input
        name="homework"
        placeholder="Homework URL"
        className="bg-background border-input text-foreground"
      />

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
      >
        {isPending ? <Loader2 className="animate-spin mr-2" /> : null} Save
        Lesson
      </Button>
    </form>
  );
}
