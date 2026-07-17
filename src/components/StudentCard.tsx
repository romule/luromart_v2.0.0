"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { softDeleteStudentAction } from "@/actions/students";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function StudentCard({ student }: { student: any }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // NEW: Track when the user clicks the card to navigate
  const [isNavigating, setIsNavigating] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the link from triggering when clicking trash
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    await softDeleteStudentAction(student.id);
    setIsAlertOpen(false);
    setIsDeleting(false);
  };

  return (
    <>
      <Link
        href={`/dashboard/student/${student.id}`}
        onClick={() => setIsNavigating(true)}
      >
        <div className="relative p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group overflow-hidden">
          {/* NEW: Overlay that appears when navigating */}
          {isNavigating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          )}

          <div className="flex justify-between items-start gap-4">
            <div className="relative flex-1 min-w-0">
              <h3
                className="font-bold text-lg md:text-xl text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {student.name}
              </h3>
              <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
            </div>

            <button
              onClick={handleDeleteClick}
              className="shrink-0 p-2 -mt-2 -mr-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 relative z-10"
              title="Move to Trash"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Level: {student.experience_level}
          </p>
        </div>
      </Link>

      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="sm:max-w-md p-6 z-[60]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 text-xl font-bold">
              <AlertCircle size={24} />
              Move to Trash?
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-slate-500">
              Are you sure you want to remove <strong>{student.name}</strong>{" "}
              from your active roster? They will be moved to the Trash Can.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-row items-center justify-between gap-3 mt-4 w-full">
            <Button
              variant="outline"
              onClick={() => setIsAlertOpen(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : null}
              {isDeleting ? "Moving..." : "Move to trash"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
