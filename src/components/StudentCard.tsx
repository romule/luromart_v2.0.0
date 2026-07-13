"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, AlertCircle } from "lucide-react";
import { softDeleteStudentAction } from "@/actions/students";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function StudentCard({ student }: { student: any }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Stops the Link from triggering a page redirect
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
      <Link href={`/dashboard/student/${student.id}`}>
        <div className="relative p-6 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
          <button
            onClick={handleDeleteClick}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title="Move to Trash"
          >
            <Trash2 size={18} />
          </button>

          <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors pr-8">
            {student.name}
          </h3>
          <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Level: {student.experience_level}
          </p>
        </div>
      </Link>

      {/* Themed Shadcn Alert Dialog (Yellow/Amber) */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle size={20} />
              Move to Trash?
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-600">
              Are you sure you want to remove <strong>{student.name}</strong>{" "}
              from your active roster? They will be moved to the Trash Can.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setIsAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Moving..." : "Yes, move to trash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
