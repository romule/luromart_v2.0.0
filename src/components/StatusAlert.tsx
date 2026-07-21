"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

export interface StatusAlertState {
  isOpen: boolean;
  status: "success" | "error" | "canceled";
  title: string;
  message: string;
}

interface StatusAlertProps extends StatusAlertState {
  onClose: () => void;
}

export default function StatusAlert({
  isOpen,
  status,
  title,
  message,
  onClose,
}: StatusAlertProps) {
  // Shrunk the icons down to w-8 h-8
  const config = {
    success: {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />,
      buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    error: {
      icon: <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />,
      buttonClass: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    canceled: {
      icon: <Trash2 className="w-8 h-8 text-red-500 mb-3" />,
      buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  const currentConfig = config[status] || config.success;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-[70] shadow-xl rounded-2xl">
        <div className="flex flex-col items-center justify-center">
          {currentConfig.icon}

          <DialogHeader className="w-full">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center w-full">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              {message}
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={onClose}
            className={`w-full mt-6 h-11 text-base font-semibold shadow-sm rounded-xl ${currentConfig.buttonClass}`}
          >
            Okay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
