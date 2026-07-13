import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    // We use a React Fragment here to avoid nesting unnecessary divs or <main> tags.
    // The layout.tsx already handles the structural wrapper perfectly.
    <>
      <Hero />
    </>
  );
}
