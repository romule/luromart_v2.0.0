import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, FileText, Clock, ArrowLeft } from "lucide-react";
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
      <div className="flex justify-between items-center pb-6 mb-8 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">
            {student.name}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Level:{" "}
            <span className="text-emerald-600">{student.experience_level}</span>
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft size={16} /> Back to Cabinet
        </Link>
      </div>

      {/* MAIN LAYOUT: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: History (3/12) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText size={20} className="text-slate-400" />
            <h2 className="font-bold text-lg text-slate-800">History</h2>
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

        {/* CENTER COLUMN: Calendar (6/12) */}
        <div className="lg:col-span-6 bg-white p-8 border border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-2xl text-slate-900 flex items-center gap-3">
              <Calendar size={24} className="text-indigo-600" /> July 2026
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {/* Simple calendar grid */}
            {Array.from({ length: 31 }).map((_, i) => (
              <LessonDialog
                key={i}
                mode="schedule"
                day={i + 1}
                studentId={student.id}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Upcoming (3/12) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock size={20} className="text-indigo-400" />
            <h2 className="font-bold text-lg text-slate-800">Upcoming</h2>
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
