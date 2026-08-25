"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
  BookOpen,
  Settings,
  CheckCircle2,
  Loader2,
  Sparkles,
  CalendarPlus,
} from "lucide-react";
import LessonDialog from "@/components/LessonDialog";
import StudentSettingsForm from "./StudentSettingsForm";
import { completeHomeworkAction } from "@/actions/lessons";
import { Button } from "@/components/ui/button";

export default function StudentProfileTabs({
  history,
  upcoming,
  activeHomeworks,
  student,
  isAdmin,
  initialTab = "upcoming",
}: any) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const router = useRouter();

  // Ensure tab changes if URL parameter changes without a full page reload
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const tabs = [
    { id: "upcoming", label: "Upcoming Classes", icon: <Clock size={18} /> },
    { id: "homework", label: "Homework & Notes", icon: <BookOpen size={18} /> },
    { id: "history", label: "Past Lessons", icon: <FileText size={18} /> },
    { id: "settings", label: "Profile Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full">
      <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary shadow-sm font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 w-full bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 min-h-[500px]">
        {/* UPCOMING TAB */}
        {activeTab === "upcoming" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h2 className="font-bold text-xl text-foreground pb-4 border-b border-border">
              Scheduled & Pending Classes
            </h2>
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
              {upcoming.length > 0 ? (
                upcoming.map((lesson: any) => (
                  <LessonDialog
                    key={lesson.id}
                    lesson={lesson}
                    mode="upcoming"
                    studentId={student.id}
                    studentName={student.name}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  No upcoming classes scheduled.
                </p>
              )}
            </div>
          </div>
        )}

        {/* HOMEWORK TAB */}
        {activeTab === "homework" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <BookOpen size={20} className="text-primary" />
              <h2 className="font-bold text-xl text-foreground">
                Assignments & Notes
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              {/* CURRENT ACTIVE HOMEWORK LIST */}
              <div className="space-y-4">
                <h3 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 text-base">
                  <Sparkles size={18} /> Active Practice Assignments
                </h3>
                {activeHomeworks?.length > 0 ? (
                  activeHomeworks.map((hw: any) => (
                    <div
                      key={hw.id}
                      className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl shadow-sm relative"
                    >
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <CalendarPlus size={14} /> Assigned:{" "}
                          {new Date(hw.lesson_date).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-sm">
                          In Progress
                        </span>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-background/60 p-5 rounded-xl border border-border">
                          {hw.teacher_notes}
                        </p>
                        <div className="flex justify-end pt-2">
                          <form
                            action={async (formData) => {
                              setCompletingId(hw.id);
                              formData.append("lesson_id", hw.id);
                              formData.append("student_id", student.id);
                              await completeHomeworkAction(formData);
                              setCompletingId(null);
                              router.refresh();
                            }}
                          >
                            <Button
                              type="submit"
                              disabled={completingId === hw.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer rounded-xl h-12 px-6 shadow-md transition-all text-base"
                            >
                              {completingId === hw.id ? (
                                <Loader2
                                  size={18}
                                  className="animate-spin mr-2"
                                />
                              ) : (
                                <CheckCircle2 size={18} className="mr-2" />
                              )}{" "}
                              Mark as Completed
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-amber-700/70 dark:text-amber-400/70 italic font-medium py-4 px-6 bg-amber-500/5 rounded-2xl border border-dashed border-amber-500/20 text-center">
                    No pending assignments right now. You are all caught up!
                  </p>
                )}
              </div>

              {/* PAST ASSIGNMENTS & LESSON NOTES */}
              <div>
                <h3 className="font-bold text-lg text-foreground mb-4">
                  Past Assignments & Lesson Notes
                </h3>
                <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
                  {history.filter((l: any) => l.teacher_notes).length > 0 ? (
                    history
                      .filter((l: any) => l.teacher_notes)
                      .slice()
                      .reverse()
                      .map((lesson: any) => {
                        const isFinishedHomework =
                          lesson.topic === "Completed Practice Assignment" ||
                          lesson.lesson_type === "homework";
                        return (
                          <div
                            key={lesson.id}
                            className={`p-5 rounded-xl border ${isFinishedHomework ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/30 border-border"}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-sm text-foreground flex items-center gap-2">
                                {isFinishedHomework ? (
                                  <CheckCircle2
                                    size={16}
                                    className="text-emerald-500"
                                  />
                                ) : (
                                  <FileText
                                    size={16}
                                    className="text-primary"
                                  />
                                )}
                                {new Date(
                                  lesson.lesson_date,
                                ).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${isFinishedHomework ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground border border-border"}`}
                              >
                                {lesson.topic || "Lesson Notes"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-6">
                              {lesson.teacher_notes}
                            </p>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                      No previous notes or completed assignments yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY & SETTINGS TABs */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h2 className="font-bold text-xl text-foreground pb-4 border-b border-border">
              Completed Lessons
            </h2>
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
              {history.length > 0 ? (
                history
                  .slice()
                  .reverse()
                  .map((lesson: any) => (
                    <LessonDialog key={lesson.id} lesson={lesson} mode="view" />
                  ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  No past lessons yet.
                </p>
              )}
            </div>
          </div>
        )}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Settings size={20} className="text-primary" />
              <h2 className="font-bold text-xl text-foreground">
                Edit Profile & Level
              </h2>
            </div>
            <StudentSettingsForm student={student} isAdmin={isAdmin} />
          </div>
        )}
      </div>
    </div>
  );
}
