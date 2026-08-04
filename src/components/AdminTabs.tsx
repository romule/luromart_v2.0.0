"use client";

import { useState } from "react";
// FIXED: Users is back in the import list!
import {
  User,
  Users,
  Clock,
  Calendar,
  Timer,
  PlusCircle,
  ListTodo,
  Trash2,
  FolderOpen,
} from "lucide-react";
import {
  ApproveDeclineButtons,
  DeleteGroupButton,
  AdminCancelLessonButton,
  AdminTrashButtons,
} from "@/components/AdminActionButtons";
import AdminGroupClassForm from "@/components/AdminGroupClassForm";
import AdminStudentsDirectory from "@/components/AdminStudentsDirectory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminTabs({
  requests,
  scheduledIndividual,
  groupClasses,
  canceledLessons,
  studentDirectory,
}: any) {
  const [activeTab, setActiveTab] = useState("individual");

  const tabs = [
    { id: "individual", label: "Individual Classes", icon: <User size={18} /> },
    { id: "groups", label: "Group Classes", icon: <ListTodo size={18} /> },
    {
      id: "directory",
      label: "Student Directory",
      icon: <FolderOpen size={18} />,
    },
    { id: "trash", label: "Trash Can", icon: <Trash2 size={18} /> },
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 w-full bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 min-h-[500px]">
        {activeTab === "individual" && (
          <div className="flex flex-col gap-10 animate-in fade-in duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-amber-500" />
                  <h2 className="font-bold text-lg text-foreground">
                    Pending Requests
                  </h2>
                </div>
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-md">
                  {requests.length}
                </span>
              </div>
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
                {requests.length > 0 ? (
                  requests.map((lesson: any) => {
                    const d = new Date(lesson.lesson_date);
                    const dateStr = d.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const studentObj = Array.isArray(lesson.students)
                      ? lesson.students[0]
                      : lesson.students;
                    const parentObj = studentObj?.parents
                      ? Array.isArray(studentObj.parents)
                        ? studentObj.parents[0]
                        : studentObj.parents
                      : null;

                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl shadow-sm gap-4 transition-all"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <User
                              size={14}
                              className="text-amber-600 dark:text-amber-500"
                            />
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">
                              {studentObj?.name || "Unknown Student"}{" "}
                              <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-sm">
                                (Child of {parentObj?.name || "Unknown Parent"})
                              </span>
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} /> {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} /> {timeStr}
                            </span>
                            <span className="font-medium text-amber-700 dark:text-amber-500">
                              ({lesson.duration}m)
                            </span>
                          </div>
                        </div>
                        <ApproveDeclineButtons
                          lessonId={lesson.id}
                          studentId={lesson.student_id}
                        />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                    No pending requests right now.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-500" />
                  <h2 className="font-bold text-lg text-foreground">
                    Scheduled Classes
                  </h2>
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-md">
                  {scheduledIndividual.length}
                </span>
              </div>
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
                {scheduledIndividual.length > 0 ? (
                  scheduledIndividual.map((lesson: any) => {
                    const d = new Date(lesson.lesson_date);
                    const dateStr = d.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const studentObj = Array.isArray(lesson.students)
                      ? lesson.students[0]
                      : lesson.students;
                    const parentObj = studentObj?.parents
                      ? Array.isArray(studentObj.parents)
                        ? studentObj.parents[0]
                        : studentObj.parents
                      : null;

                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl shadow-sm gap-4 transition-all"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <User
                              size={14}
                              className="text-emerald-600 dark:text-emerald-500"
                            />
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">
                              {studentObj?.name || "Unknown Student"}{" "}
                              <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-sm">
                                (Child of {parentObj?.name || "Unknown Parent"})
                              </span>
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} /> {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} /> {timeStr}
                            </span>
                            <span className="font-medium text-emerald-700 dark:text-emerald-500">
                              ({lesson.duration}m)
                            </span>
                          </div>
                        </div>
                        <AdminCancelLessonButton lessonId={lesson.id} />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                    No scheduled individual classes.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-border gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-xl text-foreground">
                  Scheduled Groups
                </h2>
                <span className="bg-primary/10 text-primary text-sm font-bold px-2.5 py-1 rounded-md">
                  {groupClasses.length} Active
                </span>
              </div>
              <Dialog>
                <DialogTrigger className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer">
                  <PlusCircle size={18} /> Launch New Group
                </DialogTrigger>
                <DialogContent className="theme-dashboard sm:max-w-2xl bg-background border-border max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      Create Group Schedule
                    </DialogTitle>
                  </DialogHeader>
                  <AdminGroupClassForm />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
              {groupClasses.length > 0 ? (
                groupClasses.map((group: any) => {
                  const d = new Date(group.class_date);
                  const dateStr = d.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = d.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const enrolledCount = group.lessons?.length || 0;

                  return (
                    <div
                      key={group.id}
                      className="flex flex-col p-5 bg-background border border-border rounded-xl shadow-sm gap-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between w-full gap-4">
                        <div>
                          <h4 className="font-bold text-lg text-foreground">
                            {group.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-primary/70" />{" "}
                              {dateStr}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-primary/70" />{" "}
                              {timeStr}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Timer size={14} className="text-primary/70" />{" "}
                              {group.duration}m
                            </span>
                          </div>
                        </div>
                        <DeleteGroupButton classId={group.id} />
                      </div>
                      <div className="w-full pt-2">
                        <Dialog>
                          <DialogTrigger className="w-full text-sm font-bold bg-primary/10 text-primary px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20">
                            <Users size={16} /> View Roster ({enrolledCount}/
                            {group.max_capacity})
                          </DialogTrigger>
                          <DialogContent className="theme-dashboard sm:max-w-md bg-background border-border">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-foreground">
                                Class Roster
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-2 space-y-4">
                              <h4 className="font-semibold text-primary pb-2 border-b border-border">
                                {group.title}
                              </h4>
                              {enrolledCount > 0 ? (
                                <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                  {group.lessons.map((l: any, i: number) => {
                                    const s = Array.isArray(l.students)
                                      ? l.students[0]
                                      : l.students;
                                    const p = s?.parents
                                      ? Array.isArray(s.parents)
                                        ? s.parents[0]
                                        : s.parents
                                      : null;
                                    return (
                                      <li
                                        key={i}
                                        className="p-3 bg-muted/50 rounded-lg border border-border flex flex-col gap-1"
                                      >
                                        <span className="font-bold text-foreground text-sm flex items-center gap-2">
                                          <User
                                            size={14}
                                            className="text-primary"
                                          />{" "}
                                          {s?.name || "Unknown Student"}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium pl-5">
                                          Parent: {p?.name || "Unknown"}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-6 bg-muted/50 rounded-xl border border-dashed border-border">
                                  <Users
                                    size={24}
                                    className="text-muted-foreground mb-2"
                                  />
                                  <p className="text-sm text-muted-foreground italic">
                                    No students are enrolled yet.
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                  <ListTodo
                    size={32}
                    className="text-muted-foreground/50 mb-3"
                  />
                  <p className="text-base font-medium text-muted-foreground">
                    No active groups.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "directory" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderOpen size={20} className="text-primary" />
                <h2 className="font-bold text-xl text-foreground">
                  Student Directory
                </h2>
              </div>
            </div>
            <AdminStudentsDirectory students={studentDirectory} />
          </div>
        )}

        {activeTab === "trash" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Trash2 size={20} className="text-destructive" />
                <h2 className="font-bold text-xl text-foreground">
                  Canceled Lessons
                </h2>
              </div>
              <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded-md">
                {canceledLessons?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
              {canceledLessons?.length > 0 ? (
                canceledLessons.map((lesson: any) => {
                  const d = new Date(lesson.lesson_date);
                  const dateStr = d.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = d.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const studentObj = Array.isArray(lesson.students)
                    ? lesson.students[0]
                    : lesson.students;
                  const parentObj = studentObj?.parents
                    ? Array.isArray(studentObj.parents)
                      ? studentObj.parents[0]
                      : studentObj.parents
                    : null;

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col xl:flex-row xl:items-center justify-between p-4 bg-muted/30 border border-border border-dashed rounded-xl shadow-sm gap-4 transition-all opacity-80 hover:opacity-100"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <User size={14} className="text-muted-foreground" />
                          <h3 className="font-bold text-foreground line-through decoration-destructive/50">
                            {studentObj?.name || "Unknown Student"}
                          </h3>
                          <span className="font-normal text-muted-foreground ml-1 text-sm">
                            (Child of {parentObj?.name || "Unknown Parent"})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {timeStr}
                          </span>
                          <span className="font-medium text-destructive">
                            ({lesson.duration}m)
                          </span>
                        </div>
                      </div>
                      <AdminTrashButtons
                        lessonId={lesson.id}
                        status={lesson.status}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                  <Trash2 size={32} className="text-muted-foreground/50 mb-3" />
                  <p className="text-base font-medium text-muted-foreground">
                    Trash is empty.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
