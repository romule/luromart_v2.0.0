// src/components/Navbar.tsx
import Link from "next/link";
import AuthSheet from "./AuthSheet";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo / Home Link */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Art Studio
          </span>
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center space-x-4">
          <AuthSheet />
        </div>
      </div>
    </header>
  );
}
