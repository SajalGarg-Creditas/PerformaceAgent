import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Performance Agent
          </Link>
          <span className="text-xs text-zinc-500">Portal</span>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/projects"
            className="rounded-md px-2 py-1 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
          >
            Projects
          </Link>
        </nav>
      </div>
    </header>
  );
}

