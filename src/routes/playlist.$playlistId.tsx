import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Shuffle } from "lucide-react";
import { getPlaylist, musicKeys } from "@/lib/api/music";
import { Artwork } from "@/components/music/Artwork";
import { SongList } from "@/components/music/SongList";
import { ErrorState } from "@/components/music/Section";
import { DetailHeaderSkeleton, SongListSkeleton } from "@/components/music/Skeletons";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/playlist/$playlistId")({
  head: () => ({
    meta: [
      { title: "Playlist — MusifyApp" },
      { name: "description", content: "Stream this curated playlist on MusifyApp." },
      { property: "og:title", content: "Playlist — MusifyApp" },
      { property: "og:description", content: "Stream this curated playlist on MusifyApp." },
    ],
  }),
  component: PlaylistPage,
});

function PlaylistPage() {
  const { playlistId } = Route.useParams();
  const { playSongs } = usePlayer();

  const query = useQuery({
    queryKey: musicKeys.playlist(playlistId),
    queryFn: ({ signal }) => getPlaylist(playlistId, 60, signal),
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
    return (
      <ErrorState message="Couldn't load this playlist." onRetry={() => void query.refetch()} />
    );
  }

  const playlist = query.data;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Artwork
          src={playlist.artwork}
          alt={playlist.title}
          className="h-44 w-44 shrink-0 rounded-2xl shadow-glow sm:h-56 sm:w-56"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Playlist</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{playlist.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{playlist.songs.length} songs</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => playSongs(playlist.songs, 0)}
              disabled={playlist.songs.length === 0}
              className="inline-flex items-center gap-2 rounded-full ember-surface px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" /> Play
            </button>
            <button
              type="button"
              onClick={() => playSongs([...playlist.songs].sort(() => Math.random() - 0.5), 0)}
              disabled={playlist.songs.length === 0}
              className="inline-flex items-center gap-2 rounded-full glass-panel px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
          </div>
        </div>
      </header>

      <SongList songs={playlist.songs} />
    </div>
  );
}
