import { createClient } from "@/utils/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeStudents: any[] = [];
  let deletedStudents: any[] = [];
  let declinedLessons: any[] = [];
  const firstName = user?.user_metadata?.full_name?.split(" ")[0];
  const label = firstName ? `${firstName} Cabinet` : "Cabinet";

  if (user) {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", user.id);

    if (data && data.length > 0) {
      activeStudents = data.filter((s) => !s.is_deleted);
      deletedStudents = data.filter((s) => s.is_deleted);

      // Fetch declined lessons to feed the notification bell
      const studentIds = data.map((s) => s.id);
      const { data: declinedData } = await supabase
        .from("lessons")
        .select("id, lesson_date, duration, student_id, students(name)")
        .in("student_id", studentIds)
        .eq("status", "declined")
        .order("lesson_date", { ascending: true });

      if (declinedData) {
        declinedLessons = declinedData;
      }
    }
  }

  return (
    <NavbarClient
      user={user}
      label={label}
      activeStudents={activeStudents}
      deletedStudents={deletedStudents}
      declinedLessons={declinedLessons}
    />
  );
}
