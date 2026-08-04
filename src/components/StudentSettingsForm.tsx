"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentAction } from "@/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import StatusAlert from "@/components/StatusAlert";

export default function StudentSettingsForm({
  student,
  isAdmin,
}: {
  student: any;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [level, setLevel] = useState(student.experience_level || "Beginner");

  const [alert, setAlert] = useState({
    isOpen: false,
    status: "success",
    title: "",
    message: "",
  });

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.append("student_id", student.id);
    formData.append("experience_level", level);

    try {
      const res = await updateStudentAction(formData);
      if (res?.error) {
        setAlert({
          isOpen: true,
          status: "error",
          title: "Error",
          message: res.error,
        });
      } else {
        setAlert({
          isOpen: true,
          status: "success",
          title: "Saved",
          message: "Profile updated successfully.",
        });
      }
    } catch (err: any) {
      setAlert({
        isOpen: true,
        status: "error",
        title: "Error",
        message: err.message,
      });
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
    router.refresh();
  };

  return (
    <>
      <form
        action={handleSubmit}
        className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6"
      >
        {isAdmin && (
          <div className="col-span-1 md:col-span-2 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex gap-3 items-start text-amber-700 dark:text-amber-400 shadow-sm">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-semibold leading-relaxed">
              Warning: Changing the Name or Date of Birth will alter this
              profile permanently for both the studio and the parent.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              First Name
            </label>
            <Input
              name="name"
              defaultValue={student.name}
              required
              className="bg-background border-input text-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Last Name (Surname)
            </label>
            <Input
              name="surname"
              defaultValue={student.surname}
              required
              className="bg-background border-input text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Date of Birth
          </label>
          <Input
            type="date"
            name="date_of_birth"
            defaultValue={student.date_of_birth}
            required
            className="bg-background border-input text-foreground cursor-pointer"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            Experience Level
          </label>
          {isAdmin ? (
            <Select
              value={level}
              onValueChange={(val: string) => val && setLevel(val)}
            >
              <SelectTrigger className="h-10 bg-background text-foreground">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <>
              <Input
                name="experience_level"
                value={student.experience_level}
                readOnly
                className="bg-muted text-muted-foreground font-bold border-transparent select-none focus-visible:ring-0"
              />
              <p className="text-xs text-muted-foreground mt-2 italic">
                Only an administrator can alter the child's experience level.
              </p>
            </>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto mt-4 px-8 py-6 md:py-4 text-base bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-md"
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null} Save
          Changes
        </Button>
      </form>

      <StatusAlert {...(alert as any)} onClose={handleClose} />
    </>
  );
}
