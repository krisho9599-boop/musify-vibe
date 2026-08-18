import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Play, Shuffle } from "lucide-react";
import { getAlbum, musicKeys } from "@/lib/api/music";
import { Artwork } from "@/components/music/Artwork";
import { SongList } from "@/components/music/SongList";
import { ErrorState } from "@/components/music/Section";
import { DetailHeaderSkeleton, SongListSkeleton } from "@/components/music/Skeletons";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/album/$albumId")({
  head: () => ({
    meta: [
      { title: "Album — MusifyApp" },
      { name: "description", content: "Listen to the full album on MusifyApp." },
      { property: "og:title", content: "Album — MusifyApp" },
      { property: "og:description", content: "Listen to the full album on MusifyApp." },
    ],
  }),
  component: AlbumPage,
});

function AlbumPage() {
  const { albumId } = Route.useParams();
  const { playSongs } = usePlayer();
  const { isAlbumSaved, toggleSavedAlbum } = useLibrary();

  const query = useQuery({
    queryKey: musicKeys.album(albumId),
    queryFn: ({ signal }) => getAlbum(albumId, signal),
    staleTime: 1000 * 60 * 10,
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <DetailHeaderSkeleton />
        <SongListSkeleton />
      </div>
    );
  }
  if (query.isError || !query.data) {
    return <ErrorState message="Couldn't load this album." onRetry={() => void query.refetch()} />;
  }

  const album = query.data;
  const saved = isAlbumSaved(album.id);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Artwork
          src={album.artwork}
          alt={album.title}
          className="h-44 w-44 shrink-0 rounded-2xl shadow-glow sm:h-56 sm:w-56"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Album</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{album.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {[album.artist, album.year, `${album.songs.length} songs`].filter(Boolean).join(" • ")}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => playSongs(album.songs, 0)}
              disabled={album.songs.length === 0}
              className="inline-flex items-center gap-2 rounded-full ember-surface px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" /> Play
            </button>
            <button
              type="button"
              onClick={() => playSongs([...album.songs].sort(() => Math.random() - 0.5), 0)}
              disabled={album.songs.length === 0}
              className="inline-flex items-center gap-2 rounded-full glass-panel px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
            <button
              type="button"
              aria-label={saved ? "Remove album from library" : "Save album to library"}
              onClick={() => toggleSavedAlbum(album)}
              className="grid h-11 w-11 place-items-center rounded-full glass-panel"
            >
              <Heart className={cn("h-5 w-5", saved && "fill-primary text-primary")} />
            </button>
          </div>
        </div>
      </header>

      <SongList songs={album.songs} />
    </div>
  );
}
