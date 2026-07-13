"use client";

import { useState } from "react";
import {
  restoreStudentAction,
  permanentlyDeleteStudentAction,
} from "@/actions/students";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2, AlertTriangle } from "lucide-react";

export default function TrashCard({ student }: { student: any }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRestore = async () => {
    setIsProcessing(true);
    await restoreStudentAction(student.id);
    setIsProcessing(false);
  };

  const handlePermanentDelete = async () => {
    setIsProcessing(true);
    await permanentlyDeleteStudentAction(student.id);
    setIsAlertOpen(false);
    setIsProcessing(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{student.name}</h3>
          <p className="text-sm text-slate-500 mt-1">
            Level: {student.experience_level}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className="p-2 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-all disabled:opacity-50"
            title="Restore to Active Roster"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={() => setIsAlertOpen(true)}
            disabled={isProcessing}
            className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all disabled:opacity-50"
            title="Permanently Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Centered Warning Dialog */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              Permanently Delete?
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-600">
              Are you sure you want to permanently delete{" "}
              <strong>{student.name}</strong>? This will wipe their profile and
              all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setIsAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handlePermanentDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
