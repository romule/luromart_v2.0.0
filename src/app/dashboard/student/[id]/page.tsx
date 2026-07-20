import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, FileText, Clock, X } from "lucide-react";
import LessonDialog from "@/components/LessonDialog";
import { format } from "date-fns";

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

  // 1. Fetch Student Details
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .match({ id: resolvedParams.id, is_deleted: false })
    .single();

  if (!student) redirect("/dashboard");

  // --- NEW BACKEND LOGIC: Current Month Boundaries ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentMonthName = format(now, "MMMM yyyy");
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  // Create ISO strings for the absolute start and end of the current month
  const firstDayOfMonth = new Date(
    currentYear,
    currentMonthIndex,
    1,
  ).toISOString();
  const lastDayOfMonth = new Date(
    currentYear,
    currentMonthIndex + 1,
    0,
    23,
    59,
    59,
  ).toISOString();

  // 2. Fetch ONLY this month's lessons directly from Supabase
  const { data: monthLessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("student_id", student.id)
    .gte("lesson_date", firstDayOfMonth)
    .lte("lesson_date", lastDayOfMonth)
    .order("lesson_date", { ascending: true }); // Let the database sort it too!

  const lessons = monthLessons || [];

  // 3. Server-Side Time-Shift Filter
  const nowMs = Date.now();

  const history = lessons.filter((l: any) => {
    if (l.status === "completed") return true;
    const lessonEndMs =
      new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
    return lessonEndMs < nowMs;
  });

  const upcoming = lessons.filter((l: any) => {
    if (l.status === "completed") return false;
    const lessonEndMs =
      new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
    return lessonEndMs >= nowMs;
  });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-6 mb-8 border-b border-slate-200 gap-4">
        <div className="relative flex-1 min-w-0">
          <h1
            className="text-3xl md:text-4xl font-extrabold text-slate-900 whitespace-nowrap overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {student.name}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Level:{" "}
            <span className="text-emerald-600">{student.experience_level}</span>
          </p>
          <div className="absolute top-0 right-0 h-10 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        <Link
          href="/dashboard"
          className="shrink-0 flex items-center justify-center w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors active:scale-95"
        >
          <X size={24} />
        </Link>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: History (WITH UI SCROLL) */}
        <div className="order-3 lg:order-1 lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText size={20} className="text-slate-400" />
            <h2 className="font-bold text-lg md:text-xl text-slate-800">
              History
            </h2>
          </div>
          <div
            className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {history.length > 0 ? (
              // Reversing so the most recent past lesson is at the top
              history
                .reverse()
                .map((lesson: any) => (
                  <LessonDialog key={lesson.id} lesson={lesson} mode="view" />
                ))
            ) : (
              <p className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                No past lessons this month.
              </p>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Calendar */}
        <div className="order-2 lg:order-2 lg:col-span-6 flex flex-col gap-4">
          <div className="border border-slate-200 rounded-xl p-6 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg md:text-xl text-slate-900 flex items-center gap-3">
                <Calendar size={24} className="text-indigo-600" />{" "}
                {currentMonthName}
              </h2>
            </div>

            <div className="hidden md:grid grid-cols-7 gap-3">
              {Array.from({ length: daysInMonth }).map((_, i) => (
                <LessonDialog
                  key={i}
                  mode="schedule"
                  day={i + 1}
                  month={currentMonthIndex}
                  year={currentYear}
                  studentId={student.id}
                />
              ))}
            </div>

            <div className="block md:hidden">
              <LessonDialog mode="mobile-schedule" studentId={student.id} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Upcoming (WITH UI SCROLL) */}
        <div className="order-1 lg:order-3 lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock size={20} className="text-indigo-400" />
            <h2 className="font-bold text-lg md:text-xl text-slate-800">
              Upcoming
            </h2>
          </div>
          <div
            className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {upcoming.length > 0 ? (
              upcoming.map((lesson: any) => (
                <LessonDialog
                  key={lesson.id}
                  lesson={lesson}
                  mode="upcoming"
                  studentId={student.id}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                No upcoming lessons this month.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
