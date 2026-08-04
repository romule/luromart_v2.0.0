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
      <div className="flex items-center justify-between p-5 border border-border rounded-2xl bg-card shadow-sm transition-all duration-300 hover:border-primary/50">
        <div>
          <h3 className="font-bold text-foreground text-lg md:text-xl">
            {student.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Level: {student.experience_level}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className="p-3 sm:w-auto text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-200 active:scale-90 rounded-xl disabled:opacity-50"
            title="Restore to Active Roster"
          >
            <RefreshCcw size={20} />
          </button>
          <button
            onClick={() => setIsAlertOpen(true)}
            disabled={isProcessing}
            className="p-3 sm:w-auto text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-90 rounded-xl disabled:opacity-50"
            title="Permanently Delete"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="theme-dashboard sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              Permanently Delete?
            </DialogTitle>
            <DialogDescription className="pt-2 text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <strong>{student.name}</strong>? This will wipe their profile and
              all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button
              variant="outline"
              className="border-border hover:bg-muted"
              onClick={() => setIsAlertOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
