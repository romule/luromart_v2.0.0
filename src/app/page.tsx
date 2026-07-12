// src/app/page.tsx
import Image from "next/image";
import heroBg from "../../public/hero-artwork.jpg"; // <-- Add this line!

export default function HomePage() {
  return (
    // We use a relative wrapper that fills the entire height of the screen (minus your navbar)
    <main className="relative flex-1 w-full flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* 1. The Full-Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg}
          alt="Luromart Art Studio Background"
          fill
          priority
          quality={85} // 1. Drop this from 100 to 85. It stays crisp but cuts file size massively.
          sizes="100vw" // 2. CRITICAL: Tells the server to slice it perfectly for the user's screen width.
          placeholder="blur" // 3. Gives that instant, premium fade-in effect.
          className="object-cover object-center"
        />
        {/* A subtle dark gradient overlay so your white text is actually readable over the painting */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. The Centered Foreground Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
          Discover the Joy of Painting
        </h1>
        <p className="text-xl sm:text-2xl text-slate-100 max-w-2xl mx-auto drop-shadow-md font-medium">
          Professional, personalized art instruction brought right to your
          family portal. Book lesson slots, review student history, and
          coordinate schedules seamlessly.
        </p>
      </div>
    </main>
  );
}
