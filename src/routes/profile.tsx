import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ListMusic, Music2, Users } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useLibrary } from "@/lib/library";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — MusifyApp" },
      { name: "description", content: "Your MusifyApp listening stats, library counts and settings." },
      { property: "og:title", content: "Your profile — MusifyApp" },
      { property: "og:description", content: "Listening stats, library counts and settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { liked, playlists, savedAlbums, followedArtists, recent } = useLibrary();

  const stats = [
    { label: "Liked songs", value: liked.length, icon: Heart },
    { label: "Playlists", value: playlists.length, icon: ListMusic },
    { label: "Saved albums", value: savedAlbums.length, icon: Music2 },
    { label: "Artists followed", value: followedArtists.length, icon: Users },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex items-center gap-4">
        <span className="grid h-20 w-20 place-items-center rounded-full ember-surface text-2xl font-extrabold shadow-glow">
          M
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">Your profile</h1>
          <p className="text-sm text-muted-foreground">
            {recent.length} tracks played on this device
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl glass-panel p-4">
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl glass-panel p-4">
        <div>
          <p className="text-sm font-semibold">Appearance</p>
          <p className="text-xs text-muted-foreground">Switch between dark, light and system.</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/library" className="rounded-full ember-surface px-5 py-2.5 text-sm font-semibold">
          Open library
        </Link>
        <Link to="/liked" className="rounded-full glass-panel px-5 py-2.5 text-sm font-semibold">
          Liked songs
        </Link>
      </div>
    </div>
  );
}
