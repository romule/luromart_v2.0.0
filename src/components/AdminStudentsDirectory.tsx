"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Loader2,
  Trash2,
  CheckCircle2,
  FileText,
  CalendarPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignHomeworkAction, deleteHomeworkAction } from "@/actions/lessons";
import StudentSettingsForm from "./StudentSettingsForm";
import StatusAlert from "./StatusAlert";

export default function AdminStudentsDirectory({
  students,
}: {
  students: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParent, setFilterParent] = useState("ALL");
  const [filterLevel, setFilterLevel] = useState("ALL");

  const uniqueParents = Array.from(
    new Set(students.map((s) => s.parents?.name).filter(Boolean)),
  );

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParent =
      filterParent === "ALL" || s.parents?.name === filterParent;
    const matchesLevel =
      filterLevel === "ALL" || s.experience_level === filterLevel;
    return matchesSearch && matchesParent && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-background border border-border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search name..."
            className="pl-10 bg-muted/50 border-transparent focus-visible:bg-background h-11 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterParent}
          onValueChange={(val) => val && setFilterParent(val)}
        >
          <SelectTrigger className="w-full sm:w-[200px] h-11 bg-muted/50 border-transparent focus:ring-primary rounded-lg font-medium text-foreground">
            <SelectValue placeholder="All Parents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Parents</SelectItem>
            {uniqueParents.map((p: any) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterLevel}
          onValueChange={(val) => val && setFilterLevel(val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-11 bg-muted/50 border-transparent focus:ring-primary rounded-lg font-medium text-foreground">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const pastLessons =
              student.lessons
                ?.filter((l: any) => l.status === "completed")
                .slice()
                .reverse() || [];
            const activeHomeworks =
              student.lessons?.filter(
                (l: any) => l.status === "pending_homework",
              ) || [];

            return (
              <div
                key={student.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-xl bg-card shadow-sm hover:border-primary/50 transition-colors gap-4"
              >
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {student.name} {student.surname}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Parent: {student.parents?.name || "Unknown"} | Level:{" "}
                    <span className="font-semibold text-primary">
                      {student.experience_level}
                    </span>
                  </p>
                  {activeHomeworks.length > 0 && (
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2 bg-amber-500/10 inline-block px-2.5 py-1 rounded-md border border-amber-500/20">
                      {activeHomeworks.length} Active Assignment(s)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Dialog>
                    <DialogTrigger className="flex-1 sm:flex-none px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-lg transition-colors cursor-pointer border border-border">
                      Edit Info
                    </DialogTrigger>
                    <DialogContent className="theme-dashboard sm:max-w-md bg-background border-border">
                      <DialogHeader>
                        <DialogTitle>Edit Profile & Level</DialogTitle>
                      </DialogHeader>
                      <StudentSettingsForm student={student} isAdmin={true} />
                    </DialogContent>
                  </Dialog>
                  <HomeworkDialog
                    student={student}
                    activeHomeworks={activeHomeworks}
                    pastLessons={pastLessons}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">
            No students match your search.
          </div>
        )}
      </div>
    </div>
  );
}

function HomeworkDialog({
  student,
  activeHomeworks,
  pastLessons,
}: {
  student: any;
  activeHomeworks: any[];
  pastLessons: any[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [homeworkInput, setHomeworkInput] = useState("");
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
    router.refresh();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2">
          <BookOpen size={16} /> Homework
        </DialogTrigger>
        <DialogContent className="theme-dashboard sm:max-w-lg bg-background border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Homework for {student.name} {student.surname || ""}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 border-b border-border pb-2">
                <BookOpen size={16} /> Active Assignments
              </h3>
              <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3">
                {activeHomeworks.length > 0 ? (
                  activeHomeworks.map((hw: any) => (
                    <div
                      key={hw.id}
                      className="relative bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <CalendarPlus size={13} /> Assigned:{" "}
                          {new Date(hw.lesson_date).toLocaleDateString()}
                        </span>
                        <form
                          action={async (formData) => {
                            setDeletingId(hw.id);
                            await deleteHomeworkAction(formData);
                            setDeletingId(null);
                            router.refresh();
                          }}
                        >
                          <input type="hidden" name="lesson_id" value={hw.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === hw.id}
                            className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs font-bold"
                          >
                            {deletingId === hw.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <span className="flex items-center gap-1">
                                <Trash2 size={12} /> Clear
                              </span>
                            )}
                          </Button>
                        </form>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-background/50 p-3 rounded-lg border border-border">
                        {hw.teacher_notes}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-amber-700/70 dark:text-amber-400/70 italic font-medium p-4 bg-amber-500/5 rounded-xl border border-dashed border-amber-500/20 text-center">
                    No assignments currently active.
                  </p>
                )}
              </div>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                const result = await assignHomeworkAction(formData);
                setIsSubmitting(false);
                if (result?.error) {
                  setAlert({
                    isOpen: true,
                    status: "error",
                    title: "Failed",
                    message: result.error,
                  });
                } else {
                  setHomeworkInput("");
                  router.refresh();
                }
              }}
              className="space-y-3 p-4 bg-muted/30 border border-border rounded-xl"
            >
              <label className="text-sm font-bold text-foreground block">
                Assign New Homework
              </label>
              <input type="hidden" name="student_id" value={student.id} />
              <Textarea
                name="homework"
                value={homeworkInput}
                onChange={(e) => setHomeworkInput(e.target.value)}
                required
                placeholder="Describe the new practice exercise here..."
                className="bg-background min-h-[100px]"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !homeworkInput.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}{" "}
                Send Assignment
              </Button>
            </form>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">
                Past Completed Lessons & Assignments
              </h4>
              <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2">
                {pastLessons.length > 0 ? (
                  pastLessons.map((l: any) => {
                    const isHomework =
                      l.topic === "Completed Practice Assignment" ||
                      l.lesson_type === "homework";
                    return (
                      <div
                        key={l.id}
                        className={`p-3 rounded-lg border text-sm ${isHomework ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/50 border-border"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            {isHomework ? (
                              <CheckCircle2
                                size={13}
                                className="text-emerald-500"
                              />
                            ) : (
                              <FileText size={13} className="text-primary" />
                            )}
                            {new Date(l.lesson_date).toLocaleDateString()}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isHomework ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
                          >
                            {l.topic || "Lesson"}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs whitespace-pre-wrap pl-4">
                          {l.teacher_notes || "No notes."}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No completed lessons or assignments yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <StatusAlert {...(alert as any)} onClose={handleCloseAlert} />
    </>
  );
}
