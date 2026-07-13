import { createClient } from "@/utils/supabase/server";
import AddStudentDialog from "@/components/AddStudentDialog";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no user, they get kicked back to the Home Page
  if (!user) {
    redirect("/");
  }

  const params = await searchParams;
  const isOnboarding = params.onboarding === "true";

  // Fetch only the students belonging to this parent
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parent Cabinet</h1>
          <p className="text-slate-500 mt-1">
            Manage your students and bookings here.
          </p>
        </div>

        <AddStudentDialog defaultOpen={isOnboarding} />
      </div>

      {/* Student Roster Display */}
      {students && students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm"
            >
              <h3 className="font-bold text-lg text-slate-900">
                {student.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Level: {student.experience_level}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-600 mb-4">
            You haven't added any students yet.
          </p>
          <p className="text-sm text-slate-500">
            Click "Add New Student" to get started!
          </p>
        </div>
      )}
    </div>
  );
}
