"use client";

import { useState } from "react";
import { User, Users, Clock, Trash2 } from "lucide-react";
import AddStudentDialog from "@/components/AddStudentDialog";
import StudentCard from "@/components/StudentCard";
import LessonDialog from "@/components/LessonDialog";
import TrashCard from "@/components/TrashCard";

export default function ParentTabs({
  activeStudents,
  deletedStudents,
  upcomingIndividual,
  upcomingGroup,
  isOnboarding,
  parentSurname,
}: any) {
  const [activeTab, setActiveTab] = useState("children");

  const tabs = [
    { id: "children", label: "My Children", icon: <User size={18} /> },
    { id: "individual", label: "1-on-1 Classes", icon: <Clock size={18} /> },
    { id: "groups", label: "Group Classes", icon: <Users size={18} /> },
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
        {activeTab === "children" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <User size={20} className="text-primary" />
                <h2 className="font-bold text-lg text-foreground">
                  Registered Profiles
                </h2>
              </div>
              <AddStudentDialog
                defaultOpen={isOnboarding}
                defaultSurname={parentSurname}
              />
            </div>
            <div
              className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {activeStudents.map((student: any) => (
                <StudentCard key={student.id} student={student} />
              ))}
              {activeStudents.length === 0 && (
                <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  No children registered yet. Add a student to begin booking
                  classes!
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "individual" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                <h2 className="font-bold text-lg text-foreground">
                  Pending & Scheduled
                </h2>
              </div>
              <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-md">
                {upcomingIndividual.length}
              </span>
            </div>
            <div
              className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {upcomingIndividual.length > 0 ? (
                upcomingIndividual.map((lesson: any) => (
                  <LessonDialog
                    key={lesson.id}
                    lesson={lesson}
                    mode="upcoming"
                    studentId={lesson.student_id}
                    studentName={lesson.student_name}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  No individual classes scheduled.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <h2 className="font-bold text-lg text-foreground">
                  Enrolled Groups
                </h2>
              </div>
              <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-md">
                {upcomingGroup.length}
              </span>
            </div>
            <div
              className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {upcomingGroup.length > 0 ? (
                upcomingGroup.map((lesson: any) => (
                  <LessonDialog
                    key={lesson.id}
                    lesson={lesson}
                    mode="upcoming"
                    studentId={lesson.student_id}
                    studentName={lesson.student_name}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  No group classes scheduled.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "trash" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Trash2 size={20} className="text-destructive" />
                <h2 className="font-bold text-lg text-foreground">Trash Can</h2>
              </div>
              <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded-md">
                {deletedStudents?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
              {deletedStudents?.length > 0 ? (
                deletedStudents.map((student: any) => (
                  <TrashCard key={student.id} student={student} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-6 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  Trash is empty.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
