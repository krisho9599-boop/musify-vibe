import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Shuffle } from "lucide-react";
import {
  getNewReleases,
  getPopularAlbums,
  getPopularArtists,
  getPopularPlaylists,
  getRecommendations,
  getTrending,
  musicKeys,
} from "@/lib/api/music";
import {
  AlbumCard,
  ArtistCard,
  PlaylistCard,
  SongCard,
} from "@/components/music/MediaCard";
import { ErrorState, Scroller, Section } from "@/components/music/Section";
import { RowSkeleton } from "@/components/music/Skeletons";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MusifyApp — Home for trending music" },
      {
        name: "description",
        content:
          "Discover trending songs, new releases, popular artists and playlists — streamed live on MusifyApp.",
      },
      { property: "og:title", content: "MusifyApp — Home for trending music" },
      {
        property: "og:description",
        content: "Trending songs, new releases and playlists, streamed live.",
      },
    ],
  }),
  component: HomePage,
});

const STALE = 1000 * 60 * 10;

function HomePage() {
  const { playSongs } = usePlayer();
  const { recent } = useLibrary();

  const trending = useQuery({
    queryKey: musicKeys.feed("trending"),
    queryFn: ({ signal }) => getTrending(20, signal),
    staleTime: STALE,
  });
  const artists = useQuery({
    queryKey: musicKeys.feed("artists"),
    queryFn: ({ signal }) => getPopularArtists(15, signal),
    staleTime: STALE,
  });
  const albums = useQuery({
    queryKey: musicKeys.feed("albums"),
    queryFn: ({ signal }) => getPopularAlbums(20, signal),
    staleTime: STALE,
  });
  const releases = useQuery({
    queryKey: musicKeys.feed("new-releases"),
    queryFn: ({ signal }) => getNewReleases(20, signal),
    staleTime: STALE,
  });
  const recommended = useQuery({
    queryKey: musicKeys.feed(`recommended-${recent[0]?.id ?? "generic"}`),
    queryFn: ({ signal }) => getRecommendations(recent[0]?.id, 20, signal),
    staleTime: STALE,
  });
  const playlists = useQuery({
    queryKey: musicKeys.feed("playlists"),
    queryFn: ({ signal }) => getPopularPlaylists(20, signal),
    staleTime: STALE,
  });

  const heroSongs = trending.data ?? [];
  const hero = heroSongs[0];

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <section className="relative overflow-hidden rounded-3xl hero-glow border border-border/60 p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          MusifyApp
        </p>
        <h1 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Every track you love, <span className="ember-text">one tap away</span>.
        </h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          {hero
            ? `Right now everyone is listening to "${hero.title}" by ${hero.artist}.`
            : "Live music search, streaming and playlists — powered by a real music API."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={heroSongs.length === 0}
            onClick={() => playSongs(heroSongs, 0)}
            className="inline-flex items-center gap-2 rounded-full ember-surface px-6 py-3 text-sm font-semibold shadow-glow transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" /> Play trending
          </button>
          <button
            type="button"
            disabled={heroSongs.length === 0}
            onClick={() =>
              playSongs(
                [...heroSongs].sort(() => Math.random() - 0.5),
                0,
              )
            }
            className="inline-flex items-center gap-2 rounded-full glass-panel px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4" /> Shuffle
          </button>
        </div>
      </section>

      <Section title="Trending Music" subtitle="What the world is streaming right now">
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

      {recent.length > 0 && (
        <Section title="Recently Played" subtitle="Pick up where you left off">
          <Scroller>
            {recent.slice(0, 15).map((song) => (
              <SongCard key={song.id} song={song} queue={recent} />
            ))}
          </Scroller>
        </Section>
      )}

      <Section title="Popular Artists">
        {artists.isLoading ? (
          <RowSkeleton circle />
        ) : artists.isError ? (
          <ErrorState onRetry={() => void artists.refetch()} />
        ) : (
          <Scroller>
            {artists.data?.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </Scroller>
        )}
      </Section>

      <Section title="Popular Albums">
        {albums.isLoading ? (
          <RowSkeleton />
        ) : albums.isError ? (
          <ErrorState onRetry={() => void albums.refetch()} />
        ) : (
          <Scroller>
            {albums.data?.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </Scroller>
        )}
      </Section>

      <Section title="New Releases">
        {releases.isLoading ? (
          <RowSkeleton />
        ) : releases.isError ? (
          <ErrorState onRetry={() => void releases.refetch()} />
        ) : (
          <Scroller>
            {releases.data?.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </Scroller>
        )}
      </Section>

      <Section title="Recommended Songs" subtitle="Based on what you've been playing">
        {recommended.isLoading ? (
          <RowSkeleton />
        ) : recommended.isError ? (
          <ErrorState onRetry={() => void recommended.refetch()} />
        ) : (
          <Scroller>
            {recommended.data?.map((song) => (
              <SongCard key={song.id} song={song} queue={recommended.data} />
            ))}
          </Scroller>
        )}
      </Section>

      <Section title="Popular Playlists">
        {playlists.isLoading ? (
          <RowSkeleton />
        ) : playlists.isError ? (
          <ErrorState onRetry={() => void playlists.refetch()} />
        ) : (
          <Scroller>
            {playlists.data?.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </Scroller>
        )}
      </Section>
    </div>
  );
}
