"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle,
  BookOpen,
} from "lucide-react";
import { softDeleteStudentAction } from "@/actions/students";
import { dismissHomeworkNotifAction } from "@/actions/lessons";
import LessonDialog from "@/components/LessonDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function StudentCard({ student }: { student: any }) {
  const router = useRouter();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHomeworkOpen, setIsHomeworkOpen] = useState(false);
  const [isDismissingHomework, setIsDismissingHomework] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    await softDeleteStudentAction(student.id);
    setIsAlertOpen(false);
    setIsDeleting(false);
    router.refresh();
  };

  const dismissHomework = async () => {
    setIsDismissingHomework(true);
    const formData = new FormData();
    formData.append("student_id", student.id);
    await dismissHomeworkNotifAction(formData);
    setIsDismissingHomework(false);
    setIsHomeworkOpen(false);
    router.refresh();
  };

  const getLevelStyles = (level: string) => {
    const l = (level || "").toLowerCase();
    if (l.includes("beginner"))
      return {
        dot: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
      };
    if (l.includes("intermedia"))
      return {
        dot: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
      };
    if (l.includes("advanced"))
      return { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" };
    return { dot: "bg-slate-500", text: "text-slate-600 dark:text-slate-400" };
  };

  const levelStyles = getLevelStyles(student.experience_level);
  let ageString = "";
  if (student.date_of_birth) {
    const ageDiffMs = Date.now() - new Date(student.date_of_birth).getTime();
    ageString = ` • ${Math.abs(new Date(ageDiffMs).getUTCFullYear() - 1970)} yrs old`;
  }

  const hasHomework = student.pending_homework && !student.homework_notified;

  return (
    <>
      <div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 p-5 border border-border rounded-2xl bg-muted/20 shadow-sm transition-all duration-300">
        {isNavigating && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}

        <div className="w-full xl:w-auto pr-12">
          <h3 className="font-bold text-xl text-foreground">
            {student.name} {student.surname}
          </h3>
          <p
            className={`text-sm mt-1 flex items-center gap-2 font-medium ${levelStyles.text}`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${levelStyles.dot}`}
            ></span>
            Level: {student.experience_level} {ageString}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
          {hasHomework && (
            <button
              onClick={() => setIsHomeworkOpen(true)}
              className="flex items-center justify-center gap-2 h-11 px-5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm animate-pulse"
            >
              <AlertCircle size={18} /> New Homework!
            </button>
          )}

          <LessonDialog
            mode="mobile-schedule"
            studentId={student.id}
            studentName={student.name}
          />

          <Link
            href={`/dashboard/student/${student.id}`}
            onClick={() => setIsNavigating(true)}
            className="flex items-center justify-center gap-2 h-11 px-5 bg-background hover:bg-muted text-foreground border border-border transition-colors rounded-xl cursor-pointer shadow-sm text-sm font-bold whitespace-nowrap"
          >
            <FileText size={18} /> History & Info
          </Link>

          <button
            onClick={() => setIsAlertOpen(true)}
            className="flex items-center justify-center gap-2 h-11 px-5 bg-background hover:bg-destructive/10 text-destructive border border-border transition-colors rounded-xl cursor-pointer shadow-sm text-sm font-bold whitespace-nowrap"
          >
            <Trash2 size={18} /> Remove
          </button>
        </div>
      </div>

      <Dialog open={isHomeworkOpen} onOpenChange={setIsHomeworkOpen}>
        <DialogContent className="theme-dashboard sm:max-w-md p-6 z-[60] bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xl font-bold">
              <BookOpen size={24} /> Practice Assignment
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-muted/30 border border-border rounded-xl mt-2">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {student.pending_homework}
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic mt-4 text-center">
            This assignment will remain in your Homework tab until reviewed by
            the teacher.
          </p>
          <div className="flex justify-end mt-2">
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              onClick={dismissHomework}
              disabled={isDismissingHomework}
            >
              {isDismissingHomework ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <CheckCircle className="mr-2" size={16} />
              )}{" "}
              Mark as Read
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="theme-dashboard sm:max-w-md p-6 z-[60] bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-xl font-bold">
              <AlertCircle size={24} /> Remove Profile?
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-muted-foreground">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{student.name}</strong> from
              your active roster? This will cancel their upcoming classes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 w-full">
            <Button
              variant="outline"
              onClick={() => setIsAlertOpen(false)}
              disabled={isDeleting}
              className="w-full sm:flex-1 border-border hover:bg-muted text-foreground cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors cursor-pointer"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : null}{" "}
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
