import Link from "next/link";
import AuthSheet from "./AuthSheet";
import { createClient } from "@/utils/supabase/server"; // Use the factory function
import { signOutAction } from "@/actions/auth";

export default async function Navbar() {
  // 1. Get the server-side client
  const supabase = await createClient();

  // 2. Fetch the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-slate-900 tracking-tight"
        >
          Luromart Studio
        </Link>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                Parent Cabinet
              </Link>
              {/* Note: Ensure /auth/signout route exists to handle this POST request */}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-sm font-medium text-slate-500 hover:text-red-600"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <AuthSheet />
          )}
        </div>
      </div>
    </nav>
  );
}
