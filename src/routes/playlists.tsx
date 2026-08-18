import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ListMusic, Play, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/music/Section";
import { SongList } from "@/components/music/SongList";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playlists")({
  head: () => ({
    meta: [
      { title: "Your Playlists — MusifyApp" },
      { name: "description", content: "Create and manage your own MusifyApp playlists." },
      { property: "og:title", content: "Your Playlists — MusifyApp" },
      { property: "og:description", content: "Create and manage your own playlists." },
    ],
  }),
  component: PlaylistsPage,
});

function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist, removeFromPlaylist } = useLibrary();
  const { playSongs } = usePlayer();
  const [name, setName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = playlists.find((p) => p.id === (activeId ?? playlists[0]?.id));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Your Playlists</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const created = createPlaylist(name.trim());
            setActiveId(created.id);
            setName("");
          }}
          className="flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name"
            aria-label="New playlist name"
            className="h-11 rounded-full border border-border bg-surface px-4 text-sm outline-none focus:border-primary/60"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full ember-surface px-5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Create
          </button>
        </form>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          title="No playlists yet"
          description="Create one above, then add songs from any track menu."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <ul className="space-y-2">
            {playlists.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                    active?.id === p.id ? "bg-surface-elevated text-primary" : "hover:bg-accent/60",
                  )}
                >
                  <ListMusic className="h-4.5 w-4.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {p.songs.length} songs
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {active && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold">{active.name}</h2>
                <button
                  type="button"
                  onClick={() => playSongs(active.songs, 0)}
                  disabled={active.songs.length === 0}
                  className="inline-flex items-center gap-2 rounded-full ember-surface px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-current" /> Play
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deletePlaylist(active.id);
                    setActiveId(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-full glass-panel px-5 py-2.5 text-sm font-semibold text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
              {active.songs.length === 0 ? (
                <EmptyState
                  title="This playlist is empty"
                  description="Use the ⋯ menu on any song to add it here."
                />
              ) : (
                <SongList
                  songs={active.songs}
                  onRemove={(songId) => removeFromPlaylist(active.id, songId)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
