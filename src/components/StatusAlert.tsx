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
  // UNTOUCHABLE Status Colors
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
      {/* ADDED theme-dashboard and base background/border to override SPA colors */}
      <DialogContent className="theme-dashboard sm:max-w-sm p-8 text-center bg-background border-border z-[70] shadow-xl rounded-2xl">
        <div className="flex flex-col items-center justify-center">
          {currentConfig.icon}

          <DialogHeader className="w-full">
            <DialogTitle className="text-xl font-bold text-foreground text-center w-full">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground mt-2">
              {message}
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={onClose}
            className={`w-full mt-6 h-11 text-base font-semibold shadow-sm rounded-xl ${currentConfig.buttonClass} cursor-pointer`}
          >
            Okay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
