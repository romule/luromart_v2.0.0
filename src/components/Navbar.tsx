import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Users, ChevronDown, Trash2, Library } from "lucide-react";
import AuthSheet from "@/components/AuthSheet";

// 1. Sub-component to keep the main Navbar clean
const StudentMenu = ({ students }: { students: any[] }) => (
  <div className="relative group">
    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-md hover:bg-slate-50">
      <Users size={16} />
      Students
      <ChevronDown
        size={14}
        className="group-hover:rotate-180 transition-transform duration-200"
      />
    </button>
    <div className="absolute top-full left-0 w-full h-2"></div>
    <div className="absolute top-[calc(100%+0.5rem)] left-0 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
      <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Active Roster
      </div>
      {students.map((s) => (
        <Link
          key={s.id}
          href={`/dashboard/student/${s.id}`}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95 px-3 py-2 rounded-md hover:bg-slate-50"
        >
          {s.name}
        </Link>
      ))}
    </div>
  </div>
);

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Clean Data Initialization
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

  // 3. Clean Render
  return (
    <nav className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-slate-900"
          >
            Luromart Studio
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 text-sm font-medium text-slate-600">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95 px-3 py-2 rounded-md hover:bg-slate-50"
                >
                  <Library size={16} /> {label}
                </Link>

                {activeStudents.length > 0 && (
                  <StudentMenu students={activeStudents} />
                )}

                <div className="h-5 w-px bg-slate-300 mx-1 hidden sm:block"></div>

                <Link
                  href="/dashboard/trash"
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95 px-3 py-2 rounded-md hover:bg-slate-50"
                >
                  <Trash2 size={16} /> Trash{" "}
                  {deletedStudents.length > 0 && `(${deletedStudents.length})`}
                </Link>

                <form action="/auth/signout" method="post" className="ml-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95 px-3 py-2 rounded-md hover:bg-slate-50"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <AuthSheet />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
