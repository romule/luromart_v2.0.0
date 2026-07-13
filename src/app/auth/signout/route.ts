import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Clears the cache and sends them back to the home page
  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/", req.url), { status: 302 });
}
