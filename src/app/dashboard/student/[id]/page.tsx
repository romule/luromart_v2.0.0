import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, Users, LogOut } from "lucide-react";
import LessonDialog from "@/components/LessonDialog";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const resolvedParams = await params;

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .match({ id: resolvedParams.id, is_deleted: false })
    .single();

  if (!student) redirect("/dashboard");

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("student_id", student.id)
    .order("lesson_date", { ascending: true });

  const lessons = allLessons || [];
  const nowMs = Date.now();

  const history = lessons.filter((l: any) => {
    if (l.status === "declined") return false; // FIX: Hide from history
    if (l.status === "completed") return true;
    const lessonEndMs =
      new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
    return lessonEndMs < nowMs;
  });

  const upcomingAll = lessons.filter((l: any) => {
    // FIX: Hide completed AND declined lessons
    if (l.status === "completed" || l.status === "declined") return false;
    const lessonEndMs =
      new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
    return lessonEndMs >= nowMs;
  });

  const upcomingIndividual = upcomingAll.filter((l: any) => !l.group_class_id);
  const upcomingGroup = upcomingAll.filter((l: any) => l.group_class_id);

  // Dynamic Color Logic for Experience Levels
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

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-0">
        <div className="relative flex-1 min-w-0 w-full">
          <h1
            className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {student.name}
          </h1>
          <p
            className={`text-sm mt-2 flex items-center gap-2 font-medium ${levelStyles.text}`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${levelStyles.dot}`}
            ></span>
            Level: {student.experience_level}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-56">
            <LessonDialog mode="mobile-schedule" studentId={student.id} />
          </div>

          <Link
            href="/dashboard"
            title="Back to Dashboard"
            className="shrink-0 flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors active:scale-95 cursor-pointer"
          >
            {/* LogOut flipped horizontally to create the perfect exit arrow */}
            <LogOut size={22} className="-scale-x-100 pr-0.5" />
          </Link>
        </div>
      </div>

      {/* MAIN LAYOUT with proper Mobile Stacking Order */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMN 1: History (Moved to bottom on mobile, stays on left on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-3 lg:order-1">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FileText
              size={20}
              className="text-slate-400 dark:text-slate-500"
            />
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              Previous Lessons
            </h2>
          </div>
          <div
            className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {history.length > 0 ? (
              history
                .reverse()
                .map((lesson: any) => (
                  <LessonDialog key={lesson.id} lesson={lesson} mode="view" />
                ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                No past lessons yet.
              </p>
            )}
          </div>
        </div>

        {/* COLUMN 2: Individual Classes (Top on mobile, center on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-1 lg:order-2">
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
                <LessonDialog
                  key={lesson.id}
                  lesson={lesson}
                  mode="upcoming"
                  studentId={student.id}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                No individual classes scheduled.
              </p>
            )}
          </div>
        </div>

        {/* COLUMN 3: Group Classes (Middle on mobile, right on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users
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
                <LessonDialog
                  key={lesson.id}
                  lesson={lesson}
                  mode="upcoming"
                  studentId={student.id}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                No group classes scheduled.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
