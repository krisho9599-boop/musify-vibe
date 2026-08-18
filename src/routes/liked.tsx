import { createFileRoute } from "@tanstack/react-router";
import { Heart, Play, Shuffle } from "lucide-react";
import { SongList } from "@/components/music/SongList";
import { EmptyState } from "@/components/music/Section";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/liked")({
  head: () => ({
    meta: [
      { title: "Liked Songs — MusifyApp" },
      { name: "description", content: "Every track you've liked, saved on this device." },
      { property: "og:title", content: "Liked Songs — MusifyApp" },
      { property: "og:description", content: "Every track you've liked, saved on this device." },
    ],
  }),
  component: LikedPage,
});

function LikedPage() {
  const { liked } = useLibrary();
  const { playSongs } = usePlayer();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="grid h-44 w-44 shrink-0 place-items-center rounded-2xl ember-surface shadow-glow sm:h-56 sm:w-56">
          <Heart className="h-16 w-16 fill-current" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Playlist</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Liked Songs</h1>
          <p className="mt-2 text-sm text-muted-foreground">{liked.length} songs</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => playSongs(liked, 0)}
              disabled={liked.length === 0}
              className="inline-flex items-center gap-2 rounded-full ember-surface px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" /> Play
            </button>
            <button
              type="button"
              onClick={() => playSongs([...liked].sort(() => Math.random() - 0.5), 0)}
              disabled={liked.length === 0}
              className="inline-flex items-center gap-2 rounded-full glass-panel px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
          </div>
        </div>
      </header>

      {liked.length === 0 ? (
        <EmptyState
          title="No liked songs yet"
          description="Tap the heart on any track to save it here."
        />
      ) : (
        <SongList songs={liked} />
      )}
    </div>
  );
}
