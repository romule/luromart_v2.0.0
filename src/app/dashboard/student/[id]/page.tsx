import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, FileText } from "lucide-react";

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
  const studentId = resolvedParams.id;

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .match({ id: studentId, parent_id: user.id, is_deleted: false })
    .single();

  if (!student) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      {/* Standardized Header - Back Button on Right */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">
            {student.name}
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2 text-lg">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {student.experience_level} Level
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 bg-white hover:bg-indigo-50 rounded-lg border border-slate-200 shadow-sm"
        >
          Back to Cabinet
          <ArrowRight size={16} className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm min-h-[300px]">
            <div className="flex items-center gap-3 mb-4 text-slate-900 pb-4 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText size={24} />
              </div>
              <h2 className="text-xl font-bold">Teacher Notes & Homework</h2>
            </div>
            <p className="text-slate-500 text-center mt-12">
              Lesson feedback and homework assignments will appear here.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 border border-slate-200 rounded-2xl bg-white shadow-sm min-h-[300px]">
            <div className="flex items-center gap-3 mb-4 text-slate-900 pb-4 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Calendar size={24} />
              </div>
              <h2 className="text-xl font-bold">Schedule</h2>
            </div>
            <p className="text-slate-500 text-center mt-12 text-sm">
              No upcoming lessons scheduled yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
