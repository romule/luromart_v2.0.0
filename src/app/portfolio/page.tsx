"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// 🎨 MOCK DATA: EASILY SWAP THESE WITH YOUR MOM'S ACTUAL ARTWORK
const galleryItems = [
  {
    id: 1,
    title: "Sunrise over the valley",
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop&sig=1",
  },
  {
    id: 2,
    title: "Ocean Waves",
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop&sig=2",
  },
  {
    id: 3,
    title: "Forest Path",
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop&sig=3",
  },
  {
    id: 4,
    title: "Still Life Flowers",
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop&sig=4",
  },
  {
    id: 5,
    title: "Abstract Emotion",
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop&sig=5",
  },
  {
    id: 6,
    title: "City Lights",
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop&sig=6",
  },
];

export default function PortfolioPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex === 0 ? galleryItems.length - 1 : selectedIndex - 1,
      );
    }
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex === galleryItems.length - 1 ? 0 : selectedIndex + 1,
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-background text-foreground px-4 py-12">
      <div className="max-w-7xl mx-auto text-center w-full">
        <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase mb-2">
          Portfolio
        </p>
        <h2 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">
          This is my works and exhibition
        </h2>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <p className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Lightbox Overlay */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[101] cursor-pointer"
          >
            <X size={36} />
          </button>

          {/* Previous Arrow */}
          <button
            onClick={goToPrev}
            className="absolute left-4 md:left-10 text-white/70 hover:text-white p-2 z-[101] cursor-pointer hover:scale-110 transition-transform"
          >
            <ChevronLeft size={48} />
          </button>

          {/* Main Focused Image */}
          <div className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center px-16">
            <div className="relative w-full h-full">
              <Image
                src={galleryItems[selectedIndex].src}
                alt={galleryItems[selectedIndex].title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <p className="text-white text-xl font-bold mt-4 tracking-wide">
              {galleryItems[selectedIndex].title}
            </p>
          </div>

          {/* Next Arrow */}
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-10 text-white/70 hover:text-white p-2 z-[101] cursor-pointer hover:scale-110 transition-transform"
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </div>
  );
}
