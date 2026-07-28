import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Check,
  X,
  Clock,
  Calendar,
  User,
  Users,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import {
  approveLessonAction,
  declineLessonAction,
  createGroupClassAction,
  deleteGroupClassAction,
} from "@/actions/admin";
import { cancelLessonAction } from "@/actions/lessons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // SECURITY PROTOCOL: Strict Admin Lock using .env
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    redirect("/dashboard");
  }

  const now = new Date().toISOString();

  // 1. Fetch PENDING Individual requests
  const { data: pendingLessons } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      duration,
      student_id,
      students (
        name,
        experience_level,
        parents (name)
      )
    `,
    )
    .eq("status", "pending")
    .order("lesson_date", { ascending: true });

  const requests = pendingLessons || [];

  // 2. Fetch SCHEDULED Individual Lessons
  const { data: upcomingIndividual } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      duration,
      student_id,
      students (
        name,
        experience_level,
        parents (name)
      )
    `,
    )
    .eq("status", "scheduled")
    .is("group_class_id", null)
    .gte("lesson_date", now)
    .order("lesson_date", { ascending: true });

  const scheduledIndividual = upcomingIndividual || [];

  // 3. Fetch upcoming Group Classes
  const { data: upcomingGroupClasses } = await supabase
    .from("group_classes")
    .select(
      `
      *,
      lessons (
        students (
          name,
          parents (name)
        )
      )
    `,
    )
    .gt("class_date", now)
    .order("class_date", { ascending: true });

  const groupClasses = upcomingGroupClasses || [];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming lesson requests and schedule group classes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMN 1: INDIVIDUAL CLASSES (PENDING & SCHEDULED) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Section A: Pending Individual Requests */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock
                  size={20}
                  className="text-amber-500 dark:text-amber-400"
                />
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  Pending Individual Requests
                </h2>
              </div>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-md">
                {requests.length}
              </span>
            </div>

            <div
              className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {requests.length > 0 ? (
                requests.map((lesson: any) => {
                  const d = new Date(lesson.lesson_date);
                  const dateStr = d.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = d.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const studentObj = Array.isArray(lesson.students)
                    ? lesson.students[0]
                    : lesson.students;
                  const parentObj = studentObj?.parents
                    ? Array.isArray(studentObj.parents)
                      ? studentObj.parents[0]
                      : studentObj.parents
                    : null;
                  const parentName = parentObj?.name || "Unknown Parent";

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl shadow-sm gap-4 transition-all"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <User
                            size={14}
                            className="text-amber-600 dark:text-amber-500"
                          />
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">
                            {studentObj?.name || "Unknown Student"}
                            <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-sm">
                              (Child of {parentName})
                            </span>
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {studentObj?.experience_level || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {timeStr}
                          </span>
                          <span className="font-medium text-amber-700 dark:text-amber-500">
                            ({lesson.duration}m)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto">
                        <form
                          action={async (formData) => {
                            "use server";
                            await declineLessonAction(formData);
                          }}
                          className="flex-1 xl:flex-none"
                        >
                          <input
                            type="hidden"
                            name="lesson_id"
                            value={lesson.id}
                          />
                          <input
                            type="hidden"
                            name="student_id"
                            value={lesson.student_id}
                          />
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm cursor-pointer shadow-sm"
                          >
                            <X size={16} /> Decline
                          </button>
                        </form>
                        <form
                          action={async (formData) => {
                            "use server";
                            await approveLessonAction(formData);
                          }}
                          className="flex-1 xl:flex-none"
                        >
                          <input
                            type="hidden"
                            name="lesson_id"
                            value={lesson.id}
                          />
                          <input
                            type="hidden"
                            name="student_id"
                            value={lesson.student_id}
                          />
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm shadow-md cursor-pointer"
                          >
                            <Check size={16} /> Approve
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  No pending requests right now.
                </p>
              )}
            </div>
          </div>

          {/* Section B: Scheduled Individual Classes */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar
                  size={20}
                  className="text-emerald-500 dark:text-emerald-400"
                />
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  Scheduled Individual Classes
                </h2>
              </div>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-md">
                {scheduledIndividual.length}
              </span>
            </div>

            <div
              className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {scheduledIndividual.length > 0 ? (
                scheduledIndividual.map((lesson: any) => {
                  const d = new Date(lesson.lesson_date);
                  const dateStr = d.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = d.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const studentObj = Array.isArray(lesson.students)
                    ? lesson.students[0]
                    : lesson.students;
                  const parentObj = studentObj?.parents
                    ? Array.isArray(studentObj.parents)
                      ? studentObj.parents[0]
                      : studentObj.parents
                    : null;
                  const parentName = parentObj?.name || "Unknown Parent";

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm gap-4 transition-all"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <User
                            size={14}
                            className="text-emerald-600 dark:text-emerald-500"
                          />
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">
                            {studentObj?.name || "Unknown Student"}
                            <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-sm">
                              (Child of {parentName})
                            </span>
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {timeStr}
                          </span>
                          <span className="font-medium text-emerald-700 dark:text-emerald-500">
                            ({lesson.duration}m)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <form
                          action={async (formData) => {
                            "use server";
                            await cancelLessonAction(formData);
                          }}
                        >
                          <input
                            type="hidden"
                            name="lesson_id"
                            value={lesson.id}
                          />
                          <input
                            type="hidden"
                            name="student_id"
                            value={lesson.student_id}
                          />
                          <button
                            type="submit"
                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-md transition-colors cursor-pointer"
                            title="Cancel Scheduled Lesson"
                          >
                            <Trash2 size={18} />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  No scheduled individual classes.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: GROUP CLASS GENERATOR & LIST */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Users size={20} className="text-indigo-500 dark:text-indigo-400" />
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              Manage Group Classes
            </h2>
          </div>

          <form
            action={async (formData) => {
              "use server";
              await createGroupClassAction(formData);
            }}
            className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Class Title
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Watercolor Basics (Ages 8-12)"
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Duration (mins)
                </label>
                <select
                  name="duration"
                  defaultValue="60"
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Max Capacity
                </label>
                <input
                  type="number"
                  name="max_capacity"
                  defaultValue="10"
                  min="1"
                  required
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer shadow-md"
            >
              <Plus size={18} /> Schedule Group Class
            </button>
          </form>

          {/* Scheduled Group Classes List with View Roster Modal */}
          <div className="flex flex-col gap-3 mt-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-300">
              Currently Scheduled Groups
            </h3>
            <div
              className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {groupClasses.length > 0 ? (
                groupClasses.map((group) => {
                  const d = new Date(group.class_date);
                  const dateStr = d.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const timeStr = d.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const enrolledCount = group.lessons?.length || 0;

                  return (
                    <div
                      key={group.id}
                      className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm gap-2"
                    >
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">
                            {group.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {timeStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer size={12} /> {group.duration}m
                            </span>
                          </div>
                        </div>
                        <form
                          action={async (formData) => {
                            "use server";
                            await deleteGroupClassAction(formData);
                          }}
                        >
                          <input
                            type="hidden"
                            name="class_id"
                            value={group.id}
                          />
                          <button
                            type="submit"
                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-md transition-colors cursor-pointer"
                            title="Delete Group Class"
                          >
                            <Trash2 size={18} />
                          </button>
                        </form>
                      </div>

                      {/* VIEW ROSTER MODAL COMPONENT */}
                      <div className="mt-2 w-full">
                        <Dialog>
                          <DialogTrigger className="w-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-800">
                            <Users size={14} /> View Enrolled Students (
                            {enrolledCount}/{group.max_capacity})
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md dark:bg-slate-950 dark:border-slate-800">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                Class Roster
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-2 space-y-4">
                              <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                                {group.title}
                              </h4>
                              {enrolledCount > 0 ? (
                                <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                  {group.lessons.map((l: any, i: number) => {
                                    const s = Array.isArray(l.students)
                                      ? l.students[0]
                                      : l.students;
                                    const p = s?.parents
                                      ? Array.isArray(s.parents)
                                        ? s.parents[0]
                                        : s.parents
                                      : null;
                                    return (
                                      <li
                                        key={i}
                                        className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col gap-1"
                                      >
                                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                                          <User
                                            size={14}
                                            className="text-indigo-500"
                                          />{" "}
                                          {s?.name || "Unknown Student"}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-5">
                                          Parent / Guardian:{" "}
                                          {p?.name || "Unknown"}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                  <Users
                                    size={24}
                                    className="text-slate-300 dark:text-slate-600 mb-2"
                                  />
                                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                    No students are enrolled yet.
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic p-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  No group classes scheduled.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
