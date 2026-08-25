import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StudentProfileTabs from "@/components/StudentProfileTabs";

export default async function StudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const initialTab = resolvedSearchParams?.tab || "upcoming";

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .match(
      isAdmin
        ? { id: resolvedParams.id }
        : { id: resolvedParams.id, parent_id: user.id, is_deleted: false },
    )
    .single();

  if (!student) redirect("/dashboard");

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("student_id", student.id)
    .order("lesson_date", { ascending: true });

  const lessons = allLessons || [];
  const nowMs = Date.now();

  const history = lessons.filter((l: any) => {
    if (
      l.status === "declined" ||
      l.status?.includes("canceled") ||
      l.status?.startsWith("notif_") ||
      l.status === "pending_homework"
    )
      return false;
    if (l.status === "completed") return true;
    const lessonEndMs =
      new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
    return lessonEndMs < nowMs;
  });

  const activeHomeworks = lessons.filter(
    (l: any) => l.status === "pending_homework",
  );

  const upcomingAll = lessons.filter((l: any) => {
    if (
      l.status === "completed" ||
      l.status === "declined" ||
      l.status?.includes("canceled") ||
      l.status?.startsWith("notif_") ||
      l.status === "pending_homework"
    )
      return false;
    const lessonEndMs =
      new Date(l.lesson_date).getTime() + (l.duration || 60) * 60000;
    return lessonEndMs >= nowMs;
  });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          className="p-3 bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {student.name}'s History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review past lessons, homework assignments, and upcoming schedule.
          </p>
        </div>
      </div>

      <StudentProfileTabs
        history={history}
        upcoming={upcomingAll}
        activeHomeworks={activeHomeworks}
        student={student}
        isAdmin={isAdmin}
        initialTab={initialTab}
      />
    </div>
  );
}
