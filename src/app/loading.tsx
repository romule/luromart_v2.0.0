import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    // This creates a fixed, full-screen blur effect over whatever page you are currently on
    <div className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
      <Loader2 size={48} className="animate-spin text-primary mb-4" />
      <p className="text-lg font-medium text-foreground tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
}
