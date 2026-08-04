import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ParentTabs from "@/components/ParentTabs";

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

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail) {
    redirect("/admin");
  }

  const fullName =
    user.user_metadata?.full_name || user.user_metadata?.name || "";
  const nameParts = fullName.trim().split(" ");
  let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  if (lastName) lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

  const params = await searchParams;
  const isOnboarding = params.onboarding === "true";

  const { data: allStudents } = await supabase
    .from("students")
    .select("*, lessons(*)")
    .eq("parent_id", user.id);

  const activeStudents = (allStudents || []).filter((s) => !s.is_deleted);
  const deletedStudents = (allStudents || []).filter((s) => s.is_deleted);

  let allLessons: any[] = [];
  activeStudents.forEach((student) => {
    if (student.lessons) {
      const studentLessons = student.lessons.map((l: any) => ({
        ...l,
        student_name: student.name,
      }));
      allLessons = [...allLessons, ...studentLessons];
    }
  });

  const nowMs = Date.now();
  const upcomingAll = allLessons
    .filter((l: any) => {
      if (
        l.status === "completed" ||
        l.status === "declined" ||
        l.status.includes("canceled") ||
        l.status.startsWith("notif_")
      )
        return false;
      const lessonEndMs =
        new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
      return lessonEndMs >= nowMs;
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime(),
    );

  const upcomingIndividual = upcomingAll.filter((l: any) => !l.group_class_id);
  const upcomingGroup = upcomingAll.filter((l: any) => l.group_class_id);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {lastName ? `${lastName} Family Dashboard` : "Family Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your children and art class bookings here.
          </p>
        </div>
      </div>
      <ParentTabs
        activeStudents={activeStudents}
        deletedStudents={deletedStudents}
        upcomingIndividual={upcomingIndividual}
        upcomingGroup={upcomingGroup}
        isOnboarding={isOnboarding}
        parentSurname={lastName}
      />
    </div>
  );
}
