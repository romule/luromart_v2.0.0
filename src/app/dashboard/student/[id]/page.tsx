import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, FileText, Clock, ArrowLeft, X } from "lucide-react";
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
    .select("*, lessons(*)")
    .match({ id: resolvedParams.id, is_deleted: false })
    .single();

  if (!student) redirect("/dashboard");

  const history = student.lessons.filter((l: any) => l.status === "completed");
  const upcoming = student.lessons.filter((l: any) => l.status === "scheduled");

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col">
      {/* HEADER: Student Info & Back Button */}
      <div className="flex justify-between items-center pb-6 mb-8 border-b border-slate-200 gap-4">
        {/* Left Side: Name with Horizontal Scroll and Gradient Fade */}
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

          {/* The white gradient fade on the right side of the text */}
          <div className="absolute top-0 right-0 h-10 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        {/* Right Side: Simple touch-friendly close button */}
        <Link
          href="/dashboard"
          className="shrink-0 flex items-center justify-center w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors active:scale-95"
        >
          <X size={24} />
        </Link>
      </div>

      {/* MAIN LAYOUT: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: History (3/12) */}
        <div className="order-3 lg:order-1 lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText size={20} className="text-slate-400" />
            <h2 className="font-bold text-lg md:text-xl text-slate-800">
              History
            </h2>
          </div>
          {history.length > 0 ? (
            history.map((lesson: any) => (
              <LessonDialog key={lesson.id} lesson={lesson} mode="view" />
            ))
          ) : (
            <p className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
              No past lessons yet.
            </p>
          )}
        </div>

        {/* Render 2nd on mobile, 1st on desktop */}
        {/* CENTER COLUMN: Calendar (6/12) */}
        <div className="order-2 lg:order-2 lg:col-span-6 flex flex-col gap-4">
          <div className="border border-slate-200 rounded-xl p-6 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg md:text-xl text-slate-900 flex items-center gap-3">
                <Calendar size={24} className="text-indigo-600" /> July 2026
              </h2>
            </div>

            {/* DESKTOP ONLY: The big 31-day grid */}
            <div className="hidden md:grid grid-cols-7 gap-3">
              {Array.from({ length: 31 }).map((_, i) => (
                <LessonDialog
                  key={i}
                  mode="schedule"
                  day={i + 1}
                  studentId={student.id}
                />
              ))}
            </div>

            {/* MOBILE ONLY: The big button that opens the native picker modal */}
            <div className="block md:hidden">
              <LessonDialog mode="mobile-schedule" studentId={student.id} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Upcoming (3/12) */}
        {/* Render 1st on mobile, 2nd on desktop */}
        <div className="order-1 lg:order-3 lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock size={20} className="text-indigo-400" />
            <h2 className="font-bold text-lg md:text-xl text-slate-800">
              Upcoming
            </h2>
          </div>
          {upcoming.length > 0 ? (
            upcoming.map((lesson: any) => (
              // Use the new Dialog mode here!
              <LessonDialog
                key={lesson.id}
                lesson={lesson}
                mode="upcoming"
                studentId={student.id}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
              No upcoming lessons.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
