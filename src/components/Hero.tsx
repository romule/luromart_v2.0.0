export default function Hero() {
  return (
    <section className="relative flex-1 w-full flex items-center justify-center text-center bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero-artwork.jpg')] bg-cover bg-center bg-no-repeat opacity-40" />

      {/* TEXT CONTENT LAYER */}
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl drop-shadow-md">
          Discover the Joy of Painting
        </h1>
        <p className="mt-6 text-xl font-medium text-slate-200 drop-shadow-sm">
          Professional, personalized art instruction from the comfort of your
          home. Book your first session today.
        </p>
      </div>
    </section>
  );
}
