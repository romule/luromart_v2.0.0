"use client";

import { useActionState } from "react";
import { createLessonAction } from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function LessonLogForm({ studentId }: { studentId: string }) {
  const [state, action, isPending] = useActionState(createLessonAction, null);

  return (
    <form
      action={action}
      className="space-y-4 p-6 border border-slate-200 rounded-xl bg-white shadow-sm mt-6"
    >
      <input type="hidden" name="student_id" value={studentId} />
      <h3 className="font-semibold text-lg text-slate-900">Log New Lesson</h3>

      <Input name="topic" placeholder="Lesson Topic" required />
      <Textarea name="notes" placeholder="Teacher notes..." />
      <Input name="homework" placeholder="Homework URL" />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Logging..." : "Save Lesson"}
      </Button>
    </form>
  );
}
