import Link from "next/link";
import { Paintbrush, PenTool } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-primary text-primary-foreground px-4 py-12">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm font-bold tracking-widest uppercase mb-2 opacity-80">
          Services
        </p>
        <h2 className="text-4xl md:text-5xl font-bold mb-16">For you</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mb-16 px-4 md:px-12">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center text-primary shadow-xl mb-6">
              <Paintbrush size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Painting</h3>
            <p className="opacity-90 leading-relaxed">
              A picture? Or maybe a custom portrait? How about one for the whole
              family? Or a painting that will fit into your home? I will paint
              anything you desire!
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center text-primary shadow-xl mb-6">
              <PenTool size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Illustration</h3>
            <p className="opacity-90 leading-relaxed">
              If you have something you'd like to transfer from the world of
              imagination onto a piece of paper.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center mt-8">
          <p className="text-lg font-bold uppercase tracking-widest mb-6">
            ...In that case, I invite you to contact me!
          </p>
          <Link
            href="/contacts"
            className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-bold shadow-lg hover:brightness-110 transition-all"
          >
            CONTACT ME!
          </Link>
        </div>
      </div>
    </div>
  );
}
