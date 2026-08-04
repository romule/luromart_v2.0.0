"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Loader2, RotateCcw, CalendarX2 } from "lucide-react";
import {
  approveLessonAction,
  declineLessonAction,
  deleteGroupClassAction,
  adminCancelLessonAction,
  adminRestoreLessonAction,
  adminPermanentDeleteLessonAction,
} from "@/actions/admin";
import StatusAlert, { StatusAlertState } from "./StatusAlert";

export function ApproveDeclineButtons({
  lessonId,
  studentId,
}: {
  lessonId: string;
  studentId?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<StatusAlertState>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const handleAction = async (
    formData: FormData,
    actionFunc: any,
    actionName: string,
  ) => {
    setIsSubmitting(actionName);
    try {
      const result = await actionFunc(formData);
      if (result?.error) {
        setAlertState({
          isOpen: true,
          status: "error",
          title: "Action Failed",
          message: result.error,
        });
      } else {
        setAlertState({
          isOpen: true,
          status: "success",
          title: "Success",
          message: `Lesson successfully ${actionName}d.`,
        });
      }
    } catch (err: any) {
      setAlertState({
        isOpen: true,
        status: "error",
        title: "System Error",
        message: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleClose = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto">
        <form
          action={(formData) =>
            handleAction(formData, declineLessonAction, "decline")
          }
          className="flex-1 xl:flex-none"
        >
          <input type="hidden" name="lesson_id" value={lessonId} />
          {studentId && (
            <input type="hidden" name="student_id" value={studentId} />
          )}
          <button
            type="submit"
            disabled={isSubmitting !== null}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-background border border-border text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium text-sm cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSubmitting === "decline" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <X size={16} />
            )}{" "}
            Decline
          </button>
        </form>
        <form
          action={(formData) =>
            handleAction(formData, approveLessonAction, "approve")
          }
          className="flex-1 xl:flex-none"
        >
          <input type="hidden" name="lesson_id" value={lessonId} />
          {studentId && (
            <input type="hidden" name="student_id" value={studentId} />
          )}
          <button
            type="submit"
            disabled={isSubmitting !== null}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting === "approve" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}{" "}
            Approve
          </button>
        </form>
      </div>
      <StatusAlert {...alertState} onClose={handleClose} />
    </>
  );
}

export function AdminCancelLessonButton({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<StatusAlertState>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const handleClose = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    router.refresh();
  };

  return (
    <>
      <form
        className="ml-auto w-full sm:w-auto flex justify-end"
        action={async (formData) => {
          setIsSubmitting(true);
          const result = await adminCancelLessonAction(formData);
          setIsSubmitting(false);
          if (result?.error)
            setAlertState({
              isOpen: true,
              status: "error",
              title: "Failed",
              message: result.error,
            });
          else
            setAlertState({
              isOpen: true,
              status: "canceled",
              title: "Canceled",
              message: "Lesson moved to Trash Can.",
            });
        }}
      >
        <input type="hidden" name="lesson_id" value={lessonId} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full sm:w-auto p-3 sm:px-5 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 font-bold text-sm shadow-sm border border-destructive/20"
          title="Cancel Lesson"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <CalendarX2 size={20} />
          )}
          <span className="hidden sm:inline">Cancel Lesson</span>
        </button>
      </form>
      <StatusAlert {...alertState} onClose={handleClose} />
    </>
  );
}

export function AdminTrashButtons({
  lessonId,
  status,
}: {
  lessonId: string;
  status?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<StatusAlertState>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const handleClose = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    router.refresh();
  };

  const isParentCanceled = status?.startsWith("canceled");

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        {!isParentCanceled && (
          <>
            <form
              action={async (formData) => {
                setIsSubmitting("restore");
                const result = await adminRestoreLessonAction(formData);
                setIsSubmitting(null);
                if (result?.error)
                  setAlertState({
                    isOpen: true,
                    status: "error",
                    title: "Failed",
                    message: result.error,
                  });
                else
                  setAlertState({
                    isOpen: true,
                    status: "success",
                    title: "Restored",
                    message: "Lesson moved back to schedule.",
                  });
              }}
            >
              <input type="hidden" name="lesson_id" value={lessonId} />
              <button
                type="submit"
                disabled={isSubmitting !== null}
                className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors cursor-pointer disabled:opacity-50"
                title="Restore Lesson"
              >
                {isSubmitting === "restore" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RotateCcw size={18} />
                )}
              </button>
            </form>
            <div className="w-px h-4 bg-border"></div>
          </>
        )}
        <form
          action={async (formData) => {
            setIsSubmitting("delete");
            const result = await adminPermanentDeleteLessonAction(formData);
            setIsSubmitting(null);
            if (result?.error)
              setAlertState({
                isOpen: true,
                status: "error",
                title: "Failed",
                message: result.error,
              });
            else
              setAlertState({
                isOpen: true,
                status: "canceled",
                title: "Deleted",
                message: "Lesson permanently erased.",
              });
          }}
        >
          <input type="hidden" name="lesson_id" value={lessonId} />
          <button
            type="submit"
            disabled={isSubmitting !== null}
            className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors cursor-pointer disabled:opacity-50"
            title="Delete Permanently"
          >
            {isSubmitting === "delete" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </form>
      </div>
      <StatusAlert {...alertState} onClose={handleClose} />
    </>
  );
}

export function DeleteGroupButton({ classId }: { classId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<StatusAlertState>({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const handleClose = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    router.refresh();
  };

  return (
    <>
      <form
        action={async (formData) => {
          setIsSubmitting(true);
          const result = await deleteGroupClassAction(formData);
          setIsSubmitting(false);
          if (result?.error)
            setAlertState({
              isOpen: true,
              status: "error",
              title: "Failed to Delete",
              message: result.error,
            });
          else
            setAlertState({
              isOpen: true,
              status: "canceled",
              title: "Deleted",
              message: "Group class removed.",
            });
        }}
      >
        <input type="hidden" name="class_id" value={classId} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors cursor-pointer disabled:opacity-50"
          title="Delete Group Class"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </form>
      <StatusAlert {...alertState} onClose={handleClose} />
    </>
  );
}
