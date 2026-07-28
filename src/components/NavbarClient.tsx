"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ChevronDown,
  Trash2,
  Library,
  Palette,
  Menu,
  X,
  RotateCcw,
  Archive,
  LogOut,
  Loader2,
  Bell,
} from "lucide-react";
import AuthSheet from "@/components/AuthSheet";
import {
  restoreStudentAction,
  permanentlyDeleteStudentAction,
} from "@/actions/students";
import { dismissNotificationAction } from "@/actions/admin";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import ThemeToggle from "@/components/ThemeToggle";

const NotificationMenu = ({
  declinedLessons,
  loadingId,
  setLoadingId,
}: {
  declinedLessons: any[];
  loadingId: string | null;
  setLoadingId: (id: string | null) => void;
}) => (
  <div className="relative group">
    <button className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer">
      <Bell size={18} />
      {declinedLessons.length > 0 && (
        <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
      )}
    </button>
    <div className="absolute top-full right-0 w-full h-2"></div>

    <div className="absolute top-[calc(100%+0.5rem)] right-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
      <div className="px-4 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>Notifications</span>
        {declinedLessons.length > 0 && (
          <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px]">
            {declinedLessons.length} New
          </span>
        )}
      </div>
      {declinedLessons.length > 0 ? (
        <div
          className="max-h-[300px] overflow-y-auto px-2 space-y-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {declinedLessons.map((lesson: any) => {
            const d = new Date(lesson.lesson_date);
            const dateStr = d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            const timeStr = d.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const studentName = Array.isArray(lesson.students)
              ? lesson.students[0]?.name
              : lesson.students?.name;

            return (
              <div
                key={lesson.id}
                className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 rounded-lg"
              >
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    Declined:
                  </span>{" "}
                  {studentName}'s Lesson
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {dateStr} at {timeStr} ({lesson.duration}m)
                </p>
                <form
                  action={async (formData) => {
                    setLoadingId(`dismiss-${lesson.id}`);
                    await dismissNotificationAction(formData);
                    setLoadingId(null);
                  }}
                >
                  <input type="hidden" name="lesson_id" value={lesson.id} />
                  <button
                    type="submit"
                    disabled={loadingId === `dismiss-${lesson.id}`}
                    className="w-full py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex justify-center items-center h-8 shadow-sm"
                  >
                    {loadingId === `dismiss-${lesson.id}` ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "Dismiss"
                    )}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
          No new notifications.
        </div>
      )}
    </div>
  </div>
);

const StudentMenu = ({
  activeStudents,
  deletedStudents,
  router,
  loadingId,
  setLoadingId,
  setStudentToDelete,
}: {
  activeStudents: any[];
  deletedStudents: any[];
  router: any;
  loadingId: string | null;
  setLoadingId: (id: string | null) => void;
  setStudentToDelete: (id: string | null) => void;
}) => (
  <div className="relative group">
    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
      <Users size={16} />
      Students
      <ChevronDown
        size={14}
        className="group-hover:rotate-180 transition-transform duration-200"
      />
    </button>
    <div className="absolute top-full left-0 w-full h-2"></div>

    <div className="absolute top-[calc(100%+0.5rem)] left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
      {activeStudents.length > 0 && (
        <>
          <div className="px-3 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Active Students
          </div>
          {activeStudents.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/student/${s.id}`}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 active:scale-95 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {s.name}
            </Link>
          ))}
        </>
      )}

      {deletedStudents.length > 0 && (
        <>
          <div className="px-3 pb-2 mb-2 mt-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Archive size={14} /> Inactive Students
          </div>
          {deletedStudents.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 group/item"
            >
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                {s.name}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button
                  title="Restore Student"
                  disabled={loadingId !== null}
                  onClick={async (e) => {
                    e.preventDefault();
                    setLoadingId(`restore-${s.id}`);
                    await restoreStudentAction(s.id);
                    router.refresh();
                    setLoadingId(null);
                  }}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loadingId === `restore-${s.id}` ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                </button>

                <button
                  title="Permanently Delete"
                  disabled={loadingId !== null}
                  onClick={(e) => {
                    e.preventDefault();
                    setStudentToDelete(s.id);
                  }}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  </div>
);

export default function NavbarClient({
  user,
  label,
  activeStudents,
  deletedStudents,
  declinedLessons = [],
}: any) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const closeMenu = () => {
    setIsOpen(false);
    setIsStudentsOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 left-0 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2"
            >
              <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400 md:hidden" />
              <span className="hidden md:block font-bold text-xl text-slate-900 dark:text-slate-100">
                Luromart Studio
              </span>
            </Link>

            {/* DESKTOP LINKS */}
            <div className="hidden md:flex items-center gap-2 sm:gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Library size={16} /> {label}
                  </Link>

                  {(activeStudents.length > 0 ||
                    deletedStudents.length > 0) && (
                    <StudentMenu
                      activeStudents={activeStudents}
                      deletedStudents={deletedStudents}
                      router={router}
                      loadingId={loadingId}
                      setLoadingId={setLoadingId}
                      setStudentToDelete={setStudentToDelete}
                    />
                  )}

                  <NotificationMenu
                    declinedLessons={declinedLessons}
                    loadingId={loadingId}
                    setLoadingId={setLoadingId}
                  />

                  <form action="/auth/signout" method="post" className="ml-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <AuthSheet />
              )}

              {/* DESKTOP TOGGLE */}
              <div className="flex items-center h-8 pl-4 ml-1 border-l border-slate-200 dark:border-slate-800">
                <ThemeToggle />
              </div>
            </div>

            {/* MOBILE HAMBURGER BUTTON & TOGGLE */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 cursor-pointer"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN TRAY */}
        <div
          className={`md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-xl px-4 pt-4 pb-8 flex-col items-center text-center gap-4 z-50 ${isOpen ? "flex" : "hidden"}`}
        >
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-3 text-lg font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <Library
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />{" "}
                {label}
              </Link>

              {/* MOBILE NOTIFICATIONS */}
              <div className="w-full flex flex-col items-center">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-full flex items-center justify-center gap-2 text-lg font-medium text-slate-600 dark:text-slate-300 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <Bell
                    size={20}
                    className={declinedLessons.length > 0 ? "text-red-500" : ""}
                  />
                  Notifications
                  {declinedLessons.length > 0 && (
                    <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs ml-1">
                      {declinedLessons.length}
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${isNotificationsOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""}`}
                  />
                </button>

                {isNotificationsOpen && (
                  <div className="w-full flex flex-col items-center bg-slate-50 dark:bg-slate-900 rounded-xl mt-2 p-4 gap-2 w-[90%] border border-slate-100 dark:border-slate-800 shadow-inner">
                    {declinedLessons.length > 0 ? (
                      declinedLessons.map((lesson: any) => {
                        const d = new Date(lesson.lesson_date);
                        const dateStr = d.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        });
                        const timeStr = d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const studentName = Array.isArray(lesson.students)
                          ? lesson.students[0]?.name
                          : lesson.students?.name;

                        return (
                          <div
                            key={lesson.id}
                            className="w-full p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 rounded-lg text-left"
                          >
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                              <span className="text-red-600 dark:text-red-400 font-bold">
                                Declined:
                              </span>{" "}
                              {studentName}'s Lesson
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                              {dateStr} at {timeStr} ({lesson.duration}m)
                            </p>
                            <form
                              action={async (formData) => {
                                setLoadingId(`mobile-dismiss-${lesson.id}`);
                                await dismissNotificationAction(formData);
                                setLoadingId(null);
                                if (declinedLessons.length === 1)
                                  setIsNotificationsOpen(false);
                              }}
                            >
                              <input
                                type="hidden"
                                name="lesson_id"
                                value={lesson.id}
                              />
                              <button
                                type="submit"
                                disabled={
                                  loadingId === `mobile-dismiss-${lesson.id}`
                                }
                                className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex justify-center items-center shadow-sm"
                              >
                                {loadingId === `mobile-dismiss-${lesson.id}` ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  "Dismiss"
                                )}
                              </button>
                            </form>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                        No new notifications.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* MOBILE STUDENTS */}
              {(activeStudents.length > 0 || deletedStudents.length > 0) && (
                <div className="w-full flex flex-col items-center">
                  <button
                    onClick={() => setIsStudentsOpen(!isStudentsOpen)}
                    className="w-full flex items-center justify-center gap-2 text-lg font-medium text-slate-600 dark:text-slate-300 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                  >
                    <Users size={20} /> Students
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${isStudentsOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""}`}
                    />
                  </button>

                  {isStudentsOpen && (
                    <div className="w-full flex flex-col items-center bg-slate-50 dark:bg-slate-900 rounded-xl mt-2 py-4 gap-4 w-[90%] border border-slate-100 dark:border-slate-800 shadow-inner">
                      {activeStudents.length > 0 && (
                        <div className="w-full flex flex-col items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            Active
                          </span>
                          {activeStudents.map((s: any) => (
                            <Link
                              key={s.id}
                              href={`/dashboard/student/${s.id}`}
                              onClick={closeMenu}
                              className="text-base font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 active:scale-95 transition-transform"
                            >
                              {s.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      {deletedStudents.length > 0 && (
                        <div className="w-full flex flex-col items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <Archive size={12} /> Inactive
                          </span>
                          {deletedStudents.map((s: any) => (
                            <div
                              key={s.id}
                              className="flex flex-col items-center gap-2 py-2"
                            >
                              <span className="text-base font-medium text-slate-400 dark:text-slate-500">
                                {s.name}
                              </span>
                              <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                                <button
                                  disabled={loadingId !== null}
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    setLoadingId(`mobile-restore-${s.id}`);
                                    await restoreStudentAction(s.id);
                                    router.refresh();
                                    setLoadingId(null);
                                    closeMenu();
                                  }}
                                  className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 cursor-pointer"
                                >
                                  {loadingId === `mobile-restore-${s.id}` ? (
                                    <Loader2
                                      size={18}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <RotateCcw size={18} />
                                  )}
                                </button>

                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>

                                <button
                                  disabled={loadingId !== null}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setStudentToDelete(s.id);
                                  }}
                                  className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-500 disabled:opacity-50 cursor-pointer"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <form
                action="/auth/signout"
                method="post"
                className="w-full mt-2 pt-4 border-t border-slate-100 dark:border-slate-800"
              >
                <button
                  type="submit"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 text-lg font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-transform cursor-pointer"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </form>
            </>
          ) : (
            <div
              className="py-4 w-full flex justify-center cursor-pointer"
              onClickCapture={closeMenu}
            >
              <AuthSheet />
            </div>
          )}
        </div>
      </nav>

      <Dialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px] p-6 z-[60] dark:bg-slate-950 dark:border-slate-800">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Delete Permanently?
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500 dark:text-slate-400 mt-2">
              Are you absolutely sure you want to permanently delete this
              student? All of their data will be erased. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row items-center justify-between gap-3 mt-4 w-full">
            <Button
              variant="outline"
              onClick={() => setStudentToDelete(null)}
              disabled={loadingId !== null}
              className="flex-1 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              disabled={loadingId !== null}
              onClick={async () => {
                if (studentToDelete) {
                  setLoadingId(`delete-${studentToDelete}`);
                  await permanentlyDeleteStudentAction(studentToDelete);
                  router.refresh();
                  setLoadingId(null);
                  setStudentToDelete(null);
                  closeMenu();
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              {loadingId?.startsWith("delete-") ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
