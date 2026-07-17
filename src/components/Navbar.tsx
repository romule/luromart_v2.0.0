import { createClient } from "@/utils/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeStudents: any[] = [];
  let deletedStudents: any[] = [];
  const firstName = user?.user_metadata?.full_name?.split(" ")[0];
  const label = firstName ? `${firstName} Cabinet` : "Cabinet";

  if (user) {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", user.id);

    if (data) {
      activeStudents = data.filter((s) => !s.is_deleted);
      deletedStudents = data.filter((s) => s.is_deleted);
    }
  }

  // Pass the securely fetched data to the Client Component
  return (
    <NavbarClient
      user={user}
      label={label}
      activeStudents={activeStudents}
      deletedStudents={deletedStudents}
    />
  );
}
