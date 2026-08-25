"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertCircle,
  Loader2,
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { softDeleteStudentAction } from "@/actions/students";
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

  const confirmDelete = async () => {
    setIsDeleting(true);
    await softDeleteStudentAction(student.id);
    setIsAlertOpen(false);
    setIsDeleting(false);
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

  // Purely state-driven: If active homework rows exist, the warning is visible.
  const activeHomeworks =
    student.lessons?.filter((l: any) => l.status === "pending_homework") || [];
  const hasHomework = activeHomeworks.length > 0;

  return (
    <>
      <div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 p-5 pt-12 xl:pt-5 border border-border rounded-2xl bg-muted/20 shadow-sm transition-all duration-300">
        {isNavigating && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}

        {/* ABSOLUTE POSITIONED HOMEWORK BADGE IN THE TOP RIGHT */}
        {hasHomework && (
          <button
            onClick={() => setIsHomeworkOpen(true)}
            className="absolute top-4 right-4 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-sm animate-pulse"
          >
            <AlertCircle size={14} /> {activeHomeworks.length} Active Task
            {activeHomeworks.length > 1 ? "s" : ""}
          </button>
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

      {/* HOMEWORK WARNING DIALOG */}
      <Dialog open={isHomeworkOpen} onOpenChange={setIsHomeworkOpen}>
        <DialogContent className="theme-dashboard sm:max-w-md p-6 z-[60] bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xl font-bold">
              <BookOpen size={24} /> Practice Assignments
            </DialogTitle>
          </DialogHeader>
          <div className="p-5 bg-muted/30 border border-border rounded-xl mt-2 flex flex-col items-center justify-center gap-2 text-center">
            <Sparkles size={32} className="text-amber-500 mb-2" />
            <p className="text-base text-foreground font-medium">
              {student.name} has{" "}
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {activeHomeworks.length}
              </span>{" "}
              active assignment(s).
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Head over to their profile's Homework tab to view the details and
              mark them as completed!
            </p>
          </div>
          <div className="flex justify-end mt-2">
            {/* ADDED ?tab=homework to the URL here */}
            <Link
              href={`/dashboard/student/${student.id}?tab=homework`}
              onClick={() => {
                setIsHomeworkOpen(false);
                setIsNavigating(true);
              }}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer h-10 px-5 rounded-lg flex items-center justify-center font-bold"
            >
              Go to Assignments <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
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
