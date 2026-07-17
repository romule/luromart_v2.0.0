import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserX, Trash2 } from "lucide-react";
import TrashCard from "@/components/TrashCard";

export default async function TrashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: deletedStudents } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id)
    .eq("is_deleted", true);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      {/* Standardized Header - Back Button on Right */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 text-2xl md:text-3xl lg:text-4xl">
            <Trash2 className="text-slate-400" size={28} />
            Trash Can
          </h1>
          <p className="text-slate-500 mt-2">
            Manage removed student profiles.
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

      {/* Content */}
      {!deletedStudents || deletedStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
          <UserX className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-xl font-semibold text-slate-900">
            No deleted students
          </p>
          <p className="text-slate-500 mt-2 max-w-sm">
            Your trash can is completely empty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deletedStudents.map((student) => (
            <TrashCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
