import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { T } from "@/components/T";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <LogoMark size={64} className="opacity-80" />
      <h1 className="mt-6 font-serif text-3xl font-bold">
        <T en="Page not found" ta="பக்கம் கிடைக்கவில்லை" />
      </h1>
      <p className="mt-3 text-ink/60">
        <T
          en="The page you're looking for doesn't exist or may have moved."
          ta="நீங்கள் தேடும் பக்கம் இல்லை அல்லது நகர்த்தப்பட்டிருக்கலாம்."
        />
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-emerald px-6 py-2.5 font-semibold text-cream hover:bg-emerald-deep"
      >
        <T en="Back to home" ta="முகப்புக்குத் திரும்பு" />
      </Link>
    </div>
  );
}
