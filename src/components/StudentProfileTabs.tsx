"use client";

import { useState } from "react";
import { Clock, FileText, BookOpen } from "lucide-react";
import LessonDialog from "@/components/LessonDialog";

export default function StudentProfileTabs({
  history,
  upcoming,
  student,
}: any) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const tabs = [
    { id: "upcoming", label: "Upcoming Classes", icon: <Clock size={18} /> },
    { id: "homework", label: "Homework & Notes", icon: <BookOpen size={18} /> },
    { id: "history", label: "Past Lessons", icon: <FileText size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start w-full">
      <div
        className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 w-full bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 min-h-[500px]">
        {activeTab === "upcoming" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h2 className="font-bold text-xl text-foreground pb-4 border-b border-border">
              Scheduled & Pending
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

        {activeTab === "homework" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <BookOpen size={20} className="text-primary" />
              <h2 className="font-bold text-xl text-foreground">
                Assignments & Notes
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <BookOpen size={18} /> Current Practice Assignment
                </h3>
                {student.pending_homework ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {student.pending_homework}
                  </p>
                ) : (
                  <p className="text-sm text-amber-700/70 dark:text-amber-400/70 italic font-medium">
                    No pending assignments right now. You are all caught up!
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg text-foreground mb-4">
                  Past Lesson Notes
                </h3>
                <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
                  {history.filter((l: any) => l.teacher_notes).length > 0 ? (
                    history
                      .filter((l: any) => l.teacher_notes)
                      .reverse()
                      .map((lesson: any) => (
                        <div
                          key={lesson.id}
                          className="p-4 bg-muted/30 border border-border rounded-xl"
                        >
                          <p className="font-bold text-sm text-foreground mb-2">
                            {new Date(lesson.lesson_date).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}{" "}
                            - {lesson.topic || "Art Lesson"}
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {lesson.teacher_notes}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                      No teacher notes from past lessons yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h2 className="font-bold text-xl text-foreground pb-4 border-b border-border">
              Completed Lessons
            </h2>
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
              {history.length > 0 ? (
                history
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
      </div>
    </div>
  );
}
