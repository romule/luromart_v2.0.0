import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-background text-foreground px-4 py-12">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">
          Shortly about me
        </h2>
        <p className="text-lg leading-relaxed text-foreground/80 mb-12 text-justify md:text-center">
          Good morning, everyone. My name is Liudmyla Romashchenko, and I am
          Ukrainian. I am a painter. My artistic talent was noticed by my
          father, with whom I had a very close relationship. Thanks to him, I
          completed an art school. Initially, I painted on the occasions of
          celebrations for my friends...
          <br />
          <br />
          As a result, my paintings, along with their owners, ended up in the
          United States, Canada, France, England, Italy, Russia, Moldova,
          Ukraine, and now there are many in Poland. I have participated in
          numerous exhibitions, illustrated children's books, and collaborated
          with international authors.
        </p>
        <Link
          href="/services"
          className="bg-foreground text-background dark:bg-card dark:text-card-foreground px-8 py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          MY SERVICES
        </Link>
      </div>
    </div>
  );
}
