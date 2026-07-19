"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, AlertCircle, RefreshCw, Trash2 } from "lucide-react";

export interface StatusAlertState {
  isOpen: boolean;
  status: "success" | "updated" | "canceled" | "error";
  title: string;
  message: string;
}

interface StatusAlertProps extends StatusAlertState {
  onClose: () => void;
}

export default function StatusAlert({
  isOpen,
  onClose,
  status,
  title,
  message,
}: StatusAlertProps) {
  const config = {
    success: { icon: CheckCircle2, color: "text-emerald-600" },
    updated: { icon: RefreshCw, color: "text-amber-600" },
    canceled: { icon: Trash2, color: "text-red-600" },
    error: { icon: AlertCircle, color: "text-red-600" },
  };

  const { icon: Icon, color } = config[status];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      {/* Forced flex-col and items-center to override the default grid */}
      <AlertDialogContent className="w-[90%] max-w-sm rounded-xl p-6 flex flex-col items-center justify-center text-center border-none">
        <AlertDialogHeader className="flex flex-col items-center justify-center w-full">
          {/* Header/Title + Icon container - forced to center */}
          <div className="flex items-center justify-center gap-2 mb-2 w-full">
            <Icon size={24} className={color} />
            <AlertDialogTitle className="text-xl font-bold text-slate-900 m-0">
              {title}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-slate-600 text-center w-full">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Action Button */}
        <div className="w-full mt-6">
          <AlertDialogAction
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 text-base font-medium transition-all"
          >
            Okay
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
