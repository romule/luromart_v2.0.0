import Image from "next/image";
import Link from "next/link";

export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-slate-800/20 dark:bg-black/40">
        <Image
          src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2000&auto=format&fit=crop"
          alt="Hero Background"
          fill
          className="object-cover -z-10 mix-blend-overlay"
          priority
        />
      </div>
      <div className="relative z-10 text-center px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-xl font-serif tracking-tight mb-4">
          Liudmyla Romashchenko
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-medium tracking-widest drop-shadow-md mb-8">
          Painter. Artist. Designer.
        </p>
        <Link
          href="/about"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          GET TO KNOW
        </Link>
      </div>
    </div>
  );
}
