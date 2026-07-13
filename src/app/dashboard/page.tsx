import { createClient } from "@/utils/supabase/server";
import AddStudentDialog from "@/components/AddStudentDialog";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const params = await searchParams;
  const isOnboarding = params.onboarding === "true";

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id);

  const hasStudents = students && students.length > 0;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parent Cabinet</h1>
          <p className="text-slate-500 mt-1">
            Manage your students and art class bookings here.
          </p>
        </div>

        {/* Only show the top button if they already have students */}
        {hasStudents && <AddStudentDialog defaultOpen={false} />}
      </div>

      {/* Dashboard Content */}
      {hasStudents ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            /* Prepared for Tkt 106 - Wrapping the card in a Link */
            <Link href={`/dashboard/student/${student.id}`} key={student.id}>
              <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {student.name}
                </h3>
                <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  Level: {student.experience_level}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State with the embedded button */
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[50vh] shadow-sm">
          <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Users size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            No students added yet
          </h2>
          <p className="text-slate-500 mb-8 text-center max-w-md">
            Your cabinet is empty. Get started by registering a student profile
            to easily book and manage their upcoming art lessons.
          </p>
          <AddStudentDialog defaultOpen={isOnboarding} />
        </div>
      )}
    </div>
  );
}
