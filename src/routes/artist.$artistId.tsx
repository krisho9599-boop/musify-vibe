import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Play } from "lucide-react";
import { formatCount, getArtist, musicKeys } from "@/lib/api/music";
import { Artwork } from "@/components/music/Artwork";
import { AlbumCard, ArtistCard } from "@/components/music/MediaCard";
import { SongList } from "@/components/music/SongList";
import { ErrorState, Scroller, Section } from "@/components/music/Section";
import { DetailHeaderSkeleton, SongListSkeleton } from "@/components/music/Skeletons";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/artist/$artistId")({
  head: () => ({
    meta: [
      { title: "Artist — MusifyApp" },
      { name: "description", content: "Top songs, albums and singles from this artist." },
      { property: "og:title", content: "Artist — MusifyApp" },
      { property: "og:description", content: "Top songs, albums and singles from this artist." },
    ],
  }),
  component: ArtistPage,
});

function ArtistPage() {
  const { artistId } = Route.useParams();
  const { playSongs } = usePlayer();
  const { isArtistFollowed, toggleFollowArtist } = useLibrary();

  const query = useQuery({
    queryKey: musicKeys.artist(artistId),
    queryFn: ({ signal }) => getArtist(artistId, signal),
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
    return <ErrorState message="Couldn't load this artist." onRetry={() => void query.refetch()} />;
  }

  const artist = query.data;
  const following = isArtistFollowed(artist.id);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-left">
        <Artwork
          src={artist.image}
          alt={artist.name}
          className="h-40 w-40 shrink-0 rounded-full shadow-glow sm:h-52 sm:w-52"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Artist</p>
          <h1 className="mt-2 flex items-center justify-center gap-2 text-3xl font-extrabold sm:justify-start sm:text-4xl">
            {artist.name}
            {artist.isVerified && <BadgeCheck className="h-6 w-6 text-primary" />}
          </h1>
          {formatCount(artist.followerCount) && (
            <p className="mt-2 text-sm text-muted-foreground">
              {formatCount(artist.followerCount)} followers
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => playSongs(artist.topSongs, 0)}
              disabled={artist.topSongs.length === 0}
              className="inline-flex items-center gap-2 rounded-full ember-surface px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" /> Play top songs
            </button>
            <button
              type="button"
              onClick={() => toggleFollowArtist(artist)}
              className={cn(
                "rounded-full px-6 py-3 text-sm font-semibold",
                following ? "ember-surface" : "glass-panel",
              )}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      </header>

      {artist.bio && (
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{artist.bio}</p>
      )}

      {artist.topSongs.length > 0 && (
        <Section title="Top Songs">
          <SongList songs={artist.topSongs} />
        </Section>
      )}

      {artist.topAlbums.length > 0 && (
        <Section title="Albums">
          <Scroller>
            {artist.topAlbums.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </Scroller>
        </Section>
      )}

      {artist.singles.length > 0 && (
        <Section title="Singles">
          <Scroller>
            {artist.singles.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </Scroller>
        </Section>
      )}

      {artist.similarArtists.length > 0 && (
        <Section title="Fans also like">
          <Scroller>
            {artist.similarArtists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </Scroller>
        </Section>
      )}
    </div>
  );
}
