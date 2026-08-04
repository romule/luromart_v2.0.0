import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminTabs from "@/components/AdminTabs";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    redirect("/dashboard");
  }

  const now = new Date().toISOString();

  const { data: pendingLessons } = await supabase
    .from("lessons")
    .select(
      `id, lesson_date, duration, student_id, status, students (name, experience_level, parents (name))`,
    )
    .eq("status", "pending")
    .order("lesson_date", { ascending: true });
  const requests = pendingLessons || [];

  const { data: upcomingIndividual } = await supabase
    .from("lessons")
    .select(
      `id, lesson_date, duration, student_id, status, students (name, experience_level, parents (name))`,
    )
    .eq("status", "scheduled")
    .is("group_class_id", null)
    .gte("lesson_date", now)
    .order("lesson_date", { ascending: true });
  const scheduledIndividual = upcomingIndividual || [];

  const { data: upcomingGroupClasses } = await supabase
    .from("group_classes")
    .select(`*, lessons (students (name, parents (name)))`)
    .gt("class_date", now)
    .order("class_date", { ascending: true });
  const groupClasses = upcomingGroupClasses || [];

  const { data: canceledData } = await supabase
    .from("lessons")
    .select(
      `id, lesson_date, duration, student_id, status, students (name, experience_level, parents (name))`,
    )
    .in("status", [
      "canceled",
      "canceled_acknowledged",
      "admin_canceled_in_trash",
    ])
    .order("lesson_date", { ascending: false });
  const canceledLessons = canceledData || [];

  // Add this query right above your return statement in app/admin/page.tsx:

  const { data: allStudents } = await supabase
    .from("students")
    .select(`*, parents (name), lessons (*)`)
    .eq("is_deleted", false)
    .order("name", { ascending: true });

  const studentDirectory = allStudents || [];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Luromart Management Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming lesson requests and schedule group classes.
          </p>
        </div>
      </div>
      <AdminTabs
        requests={requests}
        scheduledIndividual={scheduledIndividual}
        groupClasses={groupClasses}
        canceledLessons={canceledLessons}
        studentDirectory={studentDirectory} // NEW
      />
      ;
    </div>
  );
}
