import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPopularPlaylists, getTrending, musicKeys } from "@/lib/api/music";
import { PlaylistCard, SongCard } from "@/components/music/MediaCard";
import { ErrorState, Scroller, Section } from "@/components/music/Section";
import { RowSkeleton } from "@/components/music/Skeletons";

const GENRES = [
  "Pop",
  "Hip Hop",
  "Bollywood",
  "Lofi",
  "Rock",
  "Romantic",
  "Workout",
  "Indie",
  "Punjabi",
  "Jazz",
  "Party",
  "Chill",
];

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore genres & moods — MusifyApp" },
      {
        name: "description",
        content: "Browse genres, moods and trending playlists and start streaming instantly.",
      },
      { property: "og:title", content: "Explore genres & moods — MusifyApp" },
      { property: "og:description", content: "Browse genres, moods and trending playlists." },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();

  const trending = useQuery({
    queryKey: musicKeys.feed("trending"),
    queryFn: ({ signal }) => getTrending(20, signal),
    staleTime: 1000 * 60 * 10,
  });
  const playlists = useQuery({
    queryKey: musicKeys.feed("playlists"),
    queryFn: ({ signal }) => getPopularPlaylists(20, signal),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Explore</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {GENRES.map((genre, i) => (
          <button
            key={genre}
            type="button"
            onClick={() => navigate({ to: "/search", search: { q: genre } })}
            className="relative h-24 overflow-hidden rounded-2xl p-4 text-left font-bold transition-transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, oklch(0.6 0.16 ${(i * 37) % 360}), oklch(0.4 0.12 ${(i * 37 + 40) % 360}))`,
            }}
          >
            <span className="text-primary-foreground">{genre}</span>
          </button>
        ))}
      </div>

      <Section title="Trending now">
        {trending.isLoading ? (
          <RowSkeleton />
        ) : trending.isError ? (
          <ErrorState onRetry={() => void trending.refetch()} />
        ) : (
          <Scroller>
            {trending.data?.map((song) => (
              <SongCard key={song.id} song={song} queue={trending.data} />
            ))}
          </Scroller>
        )}
      </Section>

      <Section title="Editor's playlists">
        {playlists.isLoading ? (
          <RowSkeleton />
        ) : playlists.isError ? (
          <ErrorState onRetry={() => void playlists.refetch()} />
        ) : (
          <Scroller>
            {playlists.data?.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </Scroller>
        )}
      </Section>
    </div>
  );
}
