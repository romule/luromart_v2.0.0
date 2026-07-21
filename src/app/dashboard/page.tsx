import { createClient } from "@/utils/supabase/server";
import AddStudentDialog from "@/components/AddStudentDialog";
import StudentCard from "@/components/StudentCard";
import LessonDialog from "@/components/LessonDialog";
import { redirect } from "next/navigation";
import { Users, Clock, UsersRound } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const params = await searchParams;
  const isOnboarding = params.onboarding === "true";

  const { data: allStudents } = await supabase
    .from("students")
    .select("*, lessons(*)")
    .eq("parent_id", user.id)
    .eq("is_deleted", false);

  const activeStudents = allStudents || [];
  const hasActiveStudents = activeStudents.length > 0;

  let allLessons: any[] = [];
  activeStudents.forEach((student) => {
    if (student.lessons) {
      const studentLessons = student.lessons.map((l: any) => ({
        ...l,
        student_name: student.name,
      }));
      allLessons = [...allLessons, ...studentLessons];
    }
  });

  const nowMs = Date.now();

  const upcomingAll = allLessons
    .filter((l: any) => {
      if (l.status === "completed") return false;
      const lessonEndMs =
        new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
      return lessonEndMs >= nowMs;
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime(),
    );

  const upcomingIndividual = upcomingAll.filter((l: any) => !l.group_class_id);
  const upcomingGroup = upcomingAll.filter((l: any) => l.group_class_id);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Parent Cabinet
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your students and art class bookings here.
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      {hasActiveStudents ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Students List & Add Button */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Users size={20} className="text-slate-400 dark:text-slate-500" />
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                My Students
              </h2>
            </div>

            <div
              className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {activeStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <AddStudentDialog defaultOpen={false} />
            </div>
          </div>

          {/* CENTER COLUMN: Individual Classes */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock
                  size={20}
                  className="text-emerald-500 dark:text-emerald-400"
                />
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  Individual Classes
                </h2>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-md">
                {upcomingIndividual.length}
              </span>
            </div>

            <div
              className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {upcomingIndividual.length > 0 ? (
                upcomingIndividual.map((lesson: any) => (
                  <div key={lesson.id} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                      • {lesson.student_name}
                    </span>
                    <LessonDialog
                      lesson={lesson}
                      mode="upcoming"
                      studentId={lesson.student_id}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  No individual classes scheduled.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Group Classes */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UsersRound
                  size={20}
                  className="text-indigo-500 dark:text-indigo-400"
                />
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  Group Classes
                </h2>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-md">
                {upcomingGroup.length}
              </span>
            </div>

            <div
              className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {upcomingGroup.length > 0 ? (
                upcomingGroup.map((lesson: any) => (
                  <div key={lesson.id} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                      • {lesson.student_name}
                    </span>
                    <LessonDialog
                      lesson={lesson}
                      mode="upcoming"
                      studentId={lesson.student_id}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  No group classes scheduled.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Empty State (Onboarding)
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 min-h-[50vh] shadow-sm">
          <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
            <Users size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No active students
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
            Your active roster is empty. Register a student profile to easily
            book and manage their upcoming art lessons.
          </p>
          <AddStudentDialog defaultOpen={isOnboarding} />
        </div>
      )}
    </div>
  );
}
