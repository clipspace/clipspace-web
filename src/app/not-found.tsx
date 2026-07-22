import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <Logo size={40} textClass="text-2xl" />
      <h1 className="font-display text-5xl font-bold">404</h1>
      <p className="max-w-sm text-muted">
        The clip couldn&apos;t hold this page – it doesn&apos;t exist, or it
        slipped out of the stack.
      </p>
      <Link
        href="/"
        className="font-display rounded-full bg-brass px-6 py-3 font-bold text-bg transition-colors hover:bg-brass-soft"
      >
        Back to clipspace
      </Link>
    </main>
  );
}
