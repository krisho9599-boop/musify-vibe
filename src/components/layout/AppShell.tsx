import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Heart,
  Home,
  Library,
  ListMusic,
  Search,
  User,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

const SIDEBAR_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/library", label: "Your Library", icon: Library },
  { to: "/liked", label: "Liked Songs", icon: Heart },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
] as const;

const MOBILE_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function QuickSearch() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) navigate({ to: "/search", search: { q: value.trim() } });
      }}
      className="relative w-full max-w-md"
      role="search"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search songs, albums, artists…"
        aria-label="Search music"
        className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { current } = usePlayer();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
        <Link to="/" className="px-2">
          <Logo />
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {SIDEBAR_LINKS.map((link) => {
            const active =
              link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <link.icon className="h-4.5 w-4.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-sidebar-accent/60 p-4">
          <p className="text-xs font-semibold">Streaming live</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Powered by the MusicHub JioSaavn API. Everything you hear is fetched live.
          </p>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <Link to="/" className="md:hidden">
            <Logo compact />
          </Link>
          <div className="flex flex-1 justify-center md:justify-start">
            <QuickSearch />
          </div>
          <ThemeToggle />
        </header>

        <main
          className={cn(
            "px-4 pb-40 pt-5 sm:px-6 md:pb-32",
            current ? "pb-48 md:pb-32" : "pb-24 md:pb-10",
          )}
        >
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-elevated/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4">
          {MOBILE_LINKS.map((link) => {
            const active =
              link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
