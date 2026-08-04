"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Palette,
  Menu,
  X,
  LogOut,
  Loader2,
  Bell,
  Trash2,
} from "lucide-react";
import AuthSheet from "@/components/AuthSheet";
import { dismissNotificationAction } from "@/actions/lessons";
import { acknowledgeCanceledAction } from "@/actions/admin";
import ThemeToggle from "@/components/ThemeToggle";

const NotificationMenu = ({
  declinedLessons,
  loadingId,
  setLoadingId,
  isAdmin,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-foreground cursor-pointer z-[60]"
      >
        <Bell size={22} />
        {declinedLessons.length > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[50]"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-[calc(100%+0.5rem)] right-0 md:-right-4 w-[90vw] max-w-[350px] bg-card border border-border rounded-xl shadow-xl z-[60] py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 pb-2 mb-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Notifications</span>
              {declinedLessons.length > 0 && (
                <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {declinedLessons.length} New
                </span>
              )}
            </div>
            {declinedLessons.length > 0 ? (
              <div
                className="max-h-[350px] overflow-y-auto px-2 space-y-2 [&::-webkit-scrollbar]:hidden"
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

                  let labelText = "Notification:";
                  let labelColor = "text-foreground";
                  let bgColor = "bg-muted/50 border-border";

                  if (
                    lesson.status === "declined" ||
                    lesson.status === "notif_admin_deleted_final"
                  ) {
                    labelText =
                      lesson.status === "declined"
                        ? "Declined:"
                        : "Admin Canceled:";
                    labelColor = "text-destructive";
                    bgColor = "bg-destructive/10 border-destructive/30";
                  }
                  if (lesson.status === "canceled") {
                    labelText = "Parent Canceled:";
                    labelColor = "text-destructive";
                    bgColor = "bg-destructive/10 border-destructive/30";
                  }
                  if (lesson.status === "notif_approved") {
                    labelText = "Approved:";
                    labelColor = "text-emerald-500";
                    bgColor = "bg-emerald-500/10 border-emerald-500/30";
                  }
                  if (
                    lesson.status === "notif_admin_rescheduled" ||
                    lesson.status === "notif_parent_rescheduled"
                  ) {
                    labelText =
                      lesson.status === "notif_admin_rescheduled"
                        ? "Admin Rescheduled:"
                        : "Parent Rescheduled:";
                    labelColor = "text-amber-500 dark:text-amber-400";
                    bgColor = "bg-amber-500/10 border-amber-500/30";
                  }

                  return (
                    <div
                      key={lesson.id}
                      className={`p-3 border rounded-lg ${bgColor}`}
                    >
                      <p className="text-sm font-medium text-foreground mb-1">
                        <span className={`${labelColor} font-bold`}>
                          {labelText}
                        </span>{" "}
                        {studentName}'s Lesson
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {dateStr} at {timeStr}{" "}
                        {lesson.duration > 0 ? `(${lesson.duration}m)` : ""}
                      </p>
                      <form
                        action={async (formData) => {
                          setLoadingId(`dismiss-${lesson.id}`);
                          if (isAdmin)
                            await acknowledgeCanceledAction(formData);
                          else await dismissNotificationAction(formData);
                          setLoadingId(null);
                          router.refresh();
                        }}
                      >
                        <input
                          type="hidden"
                          name="lesson_id"
                          value={lesson.id}
                        />
                        <button
                          type="submit"
                          disabled={loadingId === `dismiss-${lesson.id}`}
                          className="w-full py-1.5 bg-background hover:bg-muted text-foreground text-xs font-bold rounded-md border border-border transition-colors cursor-pointer flex justify-center items-center h-8 shadow-sm"
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
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new notifications.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default function NavbarClient({
  user,
  declinedLessons = [],
  isAdmin,
}: any) {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false);
  const [isPublicMenuOpen, setIsPublicMenuOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const closeMenu = () => {
    setIsOpen(false);
    setIsPublicMenuOpen(false);
  };

  const navLinks = [
    { name: "Main", href: "/" },
    { name: "About me", href: "/about" },
    { name: "My services", href: "/services" },
    { name: "My works", href: "/portfolio" },
    { name: "Contacts", href: "/contacts" },
  ];

  return (
    <>
      <nav className="theme-dashboard sticky top-0 left-0 w-full border-b border-border bg-background text-foreground z-[50] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2 group"
            >
              <Palette className="w-7 h-7 text-primary transition-transform group-hover:scale-105" />
              <div className="hidden md:flex flex-col justify-center">
                <span className="font-bold text-xl tracking-tight leading-none text-foreground">
                  Luromart Studio
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 sm:gap-4">
              {!isDashboard && (
                <div className="flex items-center gap-6 mr-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-primary border-b-2 border-primary pb-1" : "text-foreground/70 hover:text-primary"}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {user && (
                    <Link
                      href="/dashboard"
                      className="text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-md ml-4 transition-colors"
                    >
                      Go to Portal
                    </Link>
                  )}
                </div>
              )}

              {isDashboard && user && (
                <>
                  <div className="relative group mr-2">
                    <button className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-4 py-2 rounded-xl hover:bg-muted cursor-pointer border border-border">
                      <Palette size={16} /> Luromart{" "}
                      <ChevronDown
                        size={14}
                        className="group-hover:rotate-180 transition-transform duration-200"
                      />
                    </button>
                    <div className="absolute top-full right-0 w-full h-2"></div>
                    <div className="absolute top-[calc(100%+0.5rem)] right-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <NotificationMenu
                    declinedLessons={declinedLessons}
                    loadingId={loadingId}
                    setLoadingId={setLoadingId}
                    isAdmin={isAdmin}
                  />
                </>
              )}

              {user ? (
                <form
                  action="/auth/signout"
                  method="post"
                  className={isDashboard ? "" : "ml-2"}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary px-3 py-2 rounded-md hover:bg-muted cursor-pointer"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </form>
              ) : (
                <div className="[&_button]:bg-[oklch(0.505_0.213_27.518)] dark:[&_button]:bg-[oklch(0.444_0.177_26.899)] [&_button]:text-white [&_button]:hover:opacity-90 [&_button]:shadow-md [&_button]:rounded-md">
                  <AuthSheet />
                </div>
              )}
              <div className="flex items-center h-8 pl-4 ml-1 border-l border-border">
                <ThemeToggle />
              </div>
            </div>

            {/* MOBILE HEADER */}
            <div className="flex items-center gap-2 sm:gap-3 md:hidden">
              {isDashboard && user && (
                <div className="z-[60]">
                  <NotificationMenu
                    declinedLessons={declinedLessons}
                    loadingId={loadingId}
                    setLoadingId={setLoadingId}
                    isAdmin={isAdmin}
                  />
                </div>
              )}
              <div className="z-[60]">
                <ThemeToggle />
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground p-2 cursor-pointer z-[60]"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        <div
          className={`theme-dashboard md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-xl px-4 pt-4 pb-8 flex-col items-center text-center gap-4 z-[40] ${isOpen ? "flex" : "hidden"}`}
        >
          {!isDashboard && (
            <div className="w-full flex flex-col gap-4 mb-4 border-b border-border pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={`text-lg font-medium ${pathname === link.href ? "text-primary" : "text-foreground/80 hover:text-primary"}`}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="w-full mt-4 h-14 bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center rounded-xl shadow-md"
                >
                  Go to Portal
                </Link>
              )}
            </div>
          )}

          {isDashboard && user && (
            <div className="w-full flex flex-col gap-4 mb-4 border-b border-border pb-4">
              <button
                onClick={() => setIsPublicMenuOpen(!isPublicMenuOpen)}
                className="flex items-center justify-center gap-2 text-lg font-medium text-foreground/80 mt-2"
              >
                <Palette size={20} /> Luromart{" "}
                <ChevronDown
                  size={18}
                  className={isPublicMenuOpen ? "rotate-180" : ""}
                />
              </button>
              {isPublicMenuOpen && (
                <div className="flex flex-col gap-3 bg-muted/50 p-4 rounded-xl w-[90%] mx-auto">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMenu}
                      className="text-foreground/80 hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {!user ? (
            <div className="py-4 w-full flex justify-center cursor-pointer">
              <AuthSheet onOpenDialog={() => closeMenu()} />
            </div>
          ) : (
            <form action="/auth/signout" method="post" className="w-full mt-2">
              <button
                type="submit"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 text-lg font-medium text-foreground/80 hover:text-primary p-3 rounded-lg hover:bg-muted cursor-pointer"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </form>
          )}
        </div>
      </nav>
    </>
  );
}
