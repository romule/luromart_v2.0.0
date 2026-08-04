import { Mail, Phone } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full bg-muted text-muted-foreground px-4 py-12">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-foreground tracking-tight">
          Feel free to contact
        </h2>

        <div className="flex items-center gap-6 md:gap-10 mb-16">
          {/* Facebook SVG */}
          <a
            href="#"
            className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          {/* Instagram SVG */}
          <a
            href="#"
            className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="mailto:test@example.com"
            className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <Mail size={32} />
          </a>
          <a
            href="tel:+1234567890"
            className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <Phone size={32} />
          </a>
        </div>

        <p className="text-sm font-medium opacity-80">
          Luromart Studio © {new Date().getFullYear()} <br />
          Maintained by Elijah Romashchenko
        </p>
      </div>
    </div>
  );
}
