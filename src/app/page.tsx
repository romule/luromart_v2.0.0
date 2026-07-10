// src/app/page.tsx

import Hero from "@/components/Hero";
import BookingForm from "@/components/BookingForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />

      {/* TKT-102.5: Assemble the Booking Form */}
      <section className="mx-auto max-w-3xl p-8 mt-12 text-center border border-slate-200 shadow-sm rounded-xl bg-white">
        <h2 className="text-2xl font-semibold text-slate-700">
          Request a Lesson Schedule
        </h2>
        <p className="text-slate-500 mt-2">
          Fill out the details below and we will confirm your calendar slot.
        </p>

        {/* Our new composed form drops right here */}
        <BookingForm />
      </section>
    </main>
  );
}
