import { createClient } from "@/utils/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeStudents: any[] = [];
  let deletedStudents: any[] = [];
  let notifications: any[] = [];
  let isAdmin = false;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0];
  const label = firstName ? `${firstName} Cabinet` : "Cabinet";

  if (user) {
    isAdmin = user.email === process.env.ADMIN_EMAIL;
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", user.id);

    if (data && data.length > 0) {
      activeStudents = data.filter((s) => !s.is_deleted);
      deletedStudents = data.filter((s) => s.is_deleted);
      const studentIds = data.map((s) => s.id);

      // PARENT NOTIFICATIONS
      if (!isAdmin) {
        const { data: parentNotifs } = await supabase
          .from("lessons")
          .select(
            "id, lesson_date, duration, student_id, status, students(name)",
          )
          .in("student_id", studentIds)
          .in("status", [
            "declined",
            "notif_approved",
            "notif_admin_rescheduled",
            "notif_admin_deleted_final",
          ])
          .order("lesson_date", { ascending: true });
        if (parentNotifs) notifications = parentNotifs;
      }
    }

    // ADMIN NOTIFICATIONS
    if (isAdmin) {
      const { data: adminNotifs } = await supabase
        .from("lessons")
        .select("id, lesson_date, duration, student_id, status, students(name)")
        .in("status", ["canceled", "notif_parent_rescheduled"])
        .order("lesson_date", { ascending: true });
      if (adminNotifs) notifications = adminNotifs;
    }
  }

  return (
    <NavbarClient
      user={user}
      label={label}
      activeStudents={activeStudents}
      deletedStudents={deletedStudents}
      declinedLessons={notifications}
      isAdmin={isAdmin}
    />
  );
}
