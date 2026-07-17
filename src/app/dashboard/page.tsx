import { createClient } from "@/utils/supabase/server";
import AddStudentDialog from "@/components/AddStudentDialog";
import StudentCard from "@/components/StudentCard";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

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

  // Fetch all students for this parent
  const { data: allStudents } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id);

  // Filter them into Active and Deleted arrays
  const activeStudents = allStudents?.filter((s) => !s.is_deleted) || [];
  const deletedStudents = allStudents?.filter((s) => s.is_deleted) || [];
  const hasActiveStudents = activeStudents.length > 0;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Parent Cabinet
            </h1>
          </div>
          <p className="text-slate-500 mt-1">
            Manage your students and art class bookings here.
          </p>
        </div>
        {/* The AddStudentDialog was removed from here to move it to the bottom */}
      </div>

      {/* Dashboard Content */}
      {hasActiveStudents ? (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>

          {/* MOVED HERE: Add Student button now sits under the grid */}
          <div className="flex justify-center sm:justify-start">
            <AddStudentDialog defaultOpen={false} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[50vh] shadow-sm">
          <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Users size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
            No active students
          </h2>
          <p className="text-slate-500 mb-8 text-center max-w-md">
            Your active roster is empty. Register a student profile to easily
            book and manage their upcoming art lessons.
          </p>
          <AddStudentDialog defaultOpen={isOnboarding} />
        </div>
      )}
    </div>
  );
}
